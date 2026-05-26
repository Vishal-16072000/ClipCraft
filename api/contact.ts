import Mailjet from "node-mailjet";

type ContactRequest = {
  name?: string;
  email?: string;
  phone?: string;
  contentType?: string;
  monthlyVideos?: string;
  message?: string;
};

type VercelRequest = {
  method?: string;
  body?: ContactRequest | string;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

const defaultFromEmail = "vishaldhangarmca21@gmail.com";
const defaultFromName = "ClipCraft";
const defaultToEmail = "support@clipcraft.co.in";
const defaultToName = "Vishal";

function parseBody(body: ContactRequest | string | undefined): ContactRequest {
  if (!body) return {};
  if (typeof body !== "string") return body;

  try {
    return JSON.parse(body) as ContactRequest;
  } catch {
    return {};
  }
}

function isMissing(value: unknown) {
  return typeof value !== "string" || value.trim() === "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  return "Could not submit the form. Please try again.";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).json(null);
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({
      success: false,
      error: "Method not allowed.",
      message: "Method not allowed.",
    });
    return;
  }

  if (isMissing(process.env.MJ_APIKEY_PUBLIC) || isMissing(process.env.MJ_APIKEY_PRIVATE)) {
    res.status(503).json({
      success: false,
      error: "Contact form is not configured. Missing Mailjet API keys.",
      message: "Contact form is not configured. Missing Mailjet API keys.",
    });
    return;
  }

  const mailjetPublicKey = process.env.MJ_APIKEY_PUBLIC as string;
  const mailjetPrivateKey = process.env.MJ_APIKEY_PRIVATE as string;

  const body = parseBody(req.body);
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const contentType = body.contentType?.trim() ?? "";
  const monthlyVideos = body.monthlyVideos?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !phone || !contentType || !monthlyVideos) {
    res.status(400).json({
      success: false,
      error: "Please fill all required fields.",
      message: "Please fill all required fields.",
    });
    return;
  }

  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim() || defaultFromEmail;
  const fromName = process.env.CONTACT_FROM_NAME?.trim() || defaultFromName;
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim() || defaultToEmail;
  const toName = process.env.CONTACT_TO_NAME?.trim() || defaultToName;

  const html = `
    <h2>New Meeting Request</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Content type:</strong> ${escapeHtml(contentType)}</p>
    <p><strong>Monthly videos:</strong> ${escapeHtml(monthlyVideos)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message || "No message added.").replace(/\n/g, "<br />")}</p>
  `;

  try {
    const mailjet = Mailjet.apiConnect(mailjetPublicKey, mailjetPrivateKey);

    const response = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: fromName,
          },
          To: [
            {
              Email: toEmail,
              Name: toName,
            },
          ],
          ReplyTo: {
            Email: email,
            Name: name,
          },
          Subject: `New Meeting Request from ${name}`,
          HTMLPart: html,
        },
      ],
    });

    res.status(200).json({
      success: true,
      ok: true,
      response: response.body,
    });
  } catch (error) {
    console.error("MAILJET ERROR:", error);
    const message = getErrorMessage(error);

    res.status(500).json({
      success: false,
      error: message,
      message,
    });
  }
}
