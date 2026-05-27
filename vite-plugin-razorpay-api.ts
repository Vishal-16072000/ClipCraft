import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv, type Plugin } from "vite";
import {
  activateFreePlan,
  createPendingSubscriptionAndRazorpayOrder,
  verifyAndActivateSubscription,
} from "./api/lib/razorpay";

type JsonRecord = Record<string, unknown>;

function readJsonBody(req: IncomingMessage): Promise<JsonRecord> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      try {
        resolve(raw ? (JSON.parse(raw) as JsonRecord) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function applyRazorpayEnv(mode: string, root: string) {
  const env = loadEnv(mode, root, "");
  for (const key of [
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_ANON_KEY",
  ] as const) {
    if (env[key]) {
      process.env[key] = env[key];
    }
  }
}

export function razorpayApiDev(): Plugin {
  return {
    name: "clipcraft-razorpay-api-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0];

        const isCreateOrder = pathname === "/api/razorpay/create-order";
        const isVerifyPayment = pathname === "/api/razorpay/verify-payment";
        const isActivateFreePlan = pathname === "/api/activate-free-plan";

        if (!isCreateOrder && !isVerifyPayment && !isActivateFreePlan) {
          next();
          return;
        }

        applyRazorpayEnv(server.config.mode, server.config.root);

        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

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
          const authorizationHeader = req.headers.authorization;

          if (isCreateOrder) {
            const result = await createPendingSubscriptionAndRazorpayOrder({
              authorizationHeader,
              planId: String(body.planId ?? ""),
              billingCycle: String(body.billingCycle ?? ""),
            });
            sendJson(res, 200, { success: true, ...result });
            return;
          }

          if (isVerifyPayment) {
            const result = await verifyAndActivateSubscription({
              authorizationHeader,
              razorpayOrderId: String(body.razorpay_order_id ?? ""),
              razorpayPaymentId: String(body.razorpay_payment_id ?? ""),
              razorpaySignature: String(body.razorpay_signature ?? ""),
            });

            if (!result.success) {
              sendJson(res, 400, result);
              return;
            }

            sendJson(res, 200, result);
            return;
          }

          if (isActivateFreePlan) {
            const result = await activateFreePlan({ authorizationHeader });
            sendJson(res, 200, result);
            return;
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : "Could not process request.";
          console.error("[razorpay-api] error:", e);
          const status = message.startsWith("Razorpay order creation failed") ? 400 : 500;
          sendJson(res, status, { success: false, error: message });
        }
      });
    },
  };
}

