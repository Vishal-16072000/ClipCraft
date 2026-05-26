import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv, type Plugin } from "vite";
import { handleContactRequest, type ContactPayload } from "./api/lib/contact";

function readJsonBody(req: IncomingMessage): Promise<ContactPayload> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? (JSON.parse(raw) as ContactPayload) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: Record<string, unknown>) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function applyContactEnv(mode: string, root: string) {
  const env = loadEnv(mode, root, "");

  for (const key of ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL"] as const) {
    if (env[key]) {
      process.env[key] = env[key];
    }
  }
}

export function contactApiDev(): Plugin {
  return {
    name: "contact-api-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname !== "/api/contact") {
          next();
          return;
        }

        applyContactEnv(server.config.mode, server.config.root);

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed." });
          return;
        }

        try {
          const body = await readJsonBody(req);
          const result = await handleContactRequest(body);
          sendJson(res, result.status, result.body);
        } catch {
          sendJson(res, 400, { error: "Invalid request body." });
        }
      });
    },
  };
}
