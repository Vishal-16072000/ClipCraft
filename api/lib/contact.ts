import Mailjet from "node-mailjet";

export type ContactRequest = {
  name?: string;
  email?: string;
  phone?: string;
  contentType?: string;
  monthlyVideos?: string;
  message?: string;
};

export type ContactEmailEnv = {
  MJ_APIKEY_PUBLIC?: string;
  MJ_APIKEY_PRIVATE?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_FROM_NAME?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_TO_NAME?: string;
};

const defaultFromEmail = "vishaldhangarmca21@gmail.com";
const defaultFromName = "ClipCraft";
const defaultToEmail = "support@clipcraft.co.in";
const defaultToName = "Vishal";

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

export async function sendContactEmail(body: ContactRequest, env: ContactEmailEnv) {
  if (isMissing(env.MJ_APIKEY_PUBLIC) || isMissing(env.MJ_APIKEY_PRIVATE)) {
    return {
      status: 503,
      body: {
        success: false,
        error: "Contact form is not configured. Missing Mailjet API keys.",
        message: "Contact form is not configured. Missing Mailjet API keys.",
      },
    };
  }

  const mailjetPublicKey = env.MJ_APIKEY_PUBLIC as string;
  const mailjetPrivateKey = env.MJ_APIKEY_PRIVATE as string;

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const contentType = body.contentType?.trim() ?? "";
  const monthlyVideos = body.monthlyVideos?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !phone || !contentType || !monthlyVideos) {
    return {
      status: 400,
      body: {
        success: false,
        error: "Please fill all required fields.",
        message: "Please fill all required fields.",
      },
    };
  }

  const fromEmail = env.CONTACT_FROM_EMAIL?.trim() || defaultFromEmail;
  const fromName = env.CONTACT_FROM_NAME?.trim() || defaultFromName;
  const toEmail = env.CONTACT_TO_EMAIL?.trim() || defaultToEmail;
  const toName = env.CONTACT_TO_NAME?.trim() || defaultToName;

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

    return {
      status: 200,
      body: {
        success: true,
        ok: true,
        response: response.body,
      },
    };
  } catch (error) {
    console.error("MAILJET ERROR:", error);
    const message = getErrorMessage(error);

    return {
      status: 500,
      body: {
        success: false,
        error: message,
        message,
      },
    };
  }
}
