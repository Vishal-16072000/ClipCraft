export type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  contentType?: string;
  preferredTime?: string;
  message?: string;
};

export type ContactResult = {
  status: number;
  body: Record<string, unknown>;
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

export async function handleContactRequest(
  payload: ContactPayload,
): Promise<ContactResult> {
  const missingEnv = requiredEnv.filter((key) => isMissing(process.env[key]));

  if (missingEnv.length > 0) {
    return {
      status: 503,
      body: {
        error: `Contact form is not configured. Missing: ${missingEnv.join(", ")}.`,
      },
    };
  }

  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const contentType = payload.contentType?.trim() ?? "";
  const preferredTime = payload.preferredTime?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (!name || !email || !phone || !contentType || !preferredTime) {
    return {
      status: 400,
      body: { error: "Please fill all required fields." },
    };
  }

  const html = `
    <h2>New ClipCraft meeting request</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Discussion topic:</strong> ${escapeHtml(contentType)}</p>
    <p><strong>Preferred meeting time:</strong> ${escapeHtml(preferredTime)}</p>
    <p><strong>Questions / notes:</strong></p>
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
      subject: `New ClipCraft meeting request from ${name}`,
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    let error = "Could not send your request right now. Please try again.";

    try {
      const parsed = JSON.parse(details) as { message?: string };
      if (parsed.message) {
        error = parsed.message;
      }
    } catch {
      // keep generic message
    }

    return {
      status: 502,
      body: { error },
    };
  }

  return { status: 200, body: { ok: true } };
}
