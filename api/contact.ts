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
  body?: ContactRequest;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

const requiredEnv = ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL"] as const;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).json(null);
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const missingEnv = requiredEnv.filter((key) => isMissing(process.env[key]));

  if (missingEnv.length > 0) {
    res.status(503).json({
      error: `Contact form is not configured. Missing: ${missingEnv.join(", ")}.`,
    });
    return;
  }

  const body = req.body ?? {};
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const contentType = body.contentType?.trim() ?? "";
  const monthlyVideos = body.monthlyVideos?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !phone || !contentType || !monthlyVideos) {
    res.status(400).json({ error: "Please fill all required fields." });
    return;
  }

  const html = `
    <h2>New ClipCraft editor request</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Content type:</strong> ${escapeHtml(contentType)}</p>
    <p><strong>Monthly videos:</strong> ${escapeHtml(monthlyVideos)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message || "No message added.").replace(/\n/g, "<br />")}</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL,
      to: process.env.CONTACT_TO_EMAIL,
      reply_to: email,
      subject: `New ClipCraft request from ${name}`,
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    res.status(502).json({
      error: "Could not send your request right now. Please try again.",
      details,
    });
    return;
  }

  res.status(200).json({ ok: true });
}
