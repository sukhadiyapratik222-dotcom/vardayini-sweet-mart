import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { json, urlencoded } from "body-parser";
import { router as apiRouter } from "./routes";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }));
app.use("/api", apiRouter);

app.get("/", (_req, res) => {
  res.send({ status: "ok", message: "PremNiMithaas API is running" });
});

app.listen(port, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server running at http://0.0.0.0:${port}`);
});
