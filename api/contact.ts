import { sendContactEmail, type ContactRequest } from "./contactEmail";

type VercelRequest = {
  method?: string;
  body?: ContactRequest | string;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

function parseBody(body: ContactRequest | string | undefined): ContactRequest {
  if (!body) return {};
  if (typeof body !== "string") return body;

  try {
    return JSON.parse(body) as ContactRequest;
  } catch {
    return {};
  }
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

  const result = await sendContactEmail(parseBody(req.body), process.env);
  res.status(result.status).json(result.body);
}
