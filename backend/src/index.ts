import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { json, urlencoded } from "body-parser";
import { router as apiRouter } from "./routes";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:4000", "http://127.0.0.1:3000", "http://127.0.0.1:4000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development fallback
      }
    },
    credentials: true,
  })
);
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }));

// Serve static admin files directly from backend server
app.use("/admin", express.static(path.join(__dirname, "../public/admin")));
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", apiRouter);

// Backend Admin Control Panel Routes: http://localhost:4000/admin & http://localhost:4000/admin/dashboard
app.get(["/admin", "/admin/*", "/dashboard"], (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
});

app.get("/", (_req, res) => {
  res.send({ status: "ok", message: "PremNiMithaas API is running", admin: `http://localhost:${port}/admin` });
});

// Express Global Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled Error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

app.listen(port, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Backend server with Admin Panel running at http://localhost:${port}/admin`);
});
