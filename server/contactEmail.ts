export type ContactRequest = {
  name?: string;
  email?: string;
  phone?: string;
  contentType?: string;
  monthlyVideos?: string;
  message?: string;
};

export type ContactEmailEnv = {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
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

export async function sendContactEmail(body: ContactRequest, env: ContactEmailEnv) {
  const missingEnv = requiredEnv.filter((key) => isMissing(env[key]));

  if (missingEnv.length > 0) {
    return {
      status: 503,
      body: {
        error: `Contact form is not configured. Missing: ${missingEnv.join(", ")}.`,
      },
    };
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const contentType = body.contentType?.trim() ?? "";
  const monthlyVideos = body.monthlyVideos?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !phone || !contentType || !monthlyVideos) {
    return {
      status: 400,
      body: { error: "Please fill all required fields." },
    };
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

  let response: Response;

  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
        reply_to: email,
        subject: `New ClipCraft request from ${name}`,
        html,
      }),
    });
  } catch (error) {
    return {
      status: 502,
      body: {
        error: "Could not connect to the email service. Please try again.",
        details: error instanceof Error ? error.message : "Unknown network error",
      },
    };
  }

  if (!response.ok) {
    const details = await response.text();
    return {
      status: 502,
      body: {
        error: "Could not send your request right now. Please try again.",
        details,
      },
    };
  }

  return { status: 200, body: { ok: true } };
}
