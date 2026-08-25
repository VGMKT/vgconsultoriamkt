import express, { type ErrorRequestHandler, type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

const app: Express = express();

app.use((req, res, next) => {
  const forwardedProtocol = req.headers["x-forwarded-proto"];
  const isHttps = req.secure || forwardedProtocol === "https"
    || (Array.isArray(forwardedProtocol) && forwardedProtocol.includes("https"));
  if (isHttps) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
const configuredOrigins = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean);
const allowedOrigins = configuredOrigins?.length
  ? configuredOrigins
  : ["https://vgconsultoriamkt.com.br", "http://localhost:5173", "http://127.0.0.1:5173"];
app.use("/api", (req, res, next) => {
  const requestMethod = req.method === "OPTIONS"
    ? req.headers["access-control-request-method"]
    : req.method;
  const isMutation = typeof requestMethod === "string"
    && ["POST", "PUT", "PATCH", "DELETE"].includes(requestMethod);
  const origin = req.headers.origin;
  if (isMutation && (!origin || !allowedOrigins.includes(origin))) {
    res.status(403).json({ error: "Origin not allowed." });
    return;
  }
  next();
});
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin not allowed by CORS"));
  },
}));
app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use("/api", router);

const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  logger.error({
    event: "system.error",
    err: error,
    method: req.method,
    path: req.path,
    requestId: req.id,
  }, "Unhandled API error");
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error." });
};

app.use(errorHandler);

export default app;
