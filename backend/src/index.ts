import "dotenv/config";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { toNodeHandler } from "better-auth/node";
import { HTTPSTATUS } from "./config/http.config";
import { Env } from "./config/env.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";

import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { connectDatabase } from "./config/database.config";
import { getAuth } from "./lib/auth";
import routes from "./routes"
import webhookRoutes from "./routes/webhook.route";



const app = express();

app.use(
  cors({
    origin: [Env.FRONTEND_ORIGIN],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
)

app.all("/api/auth/*splat", (req, res) => {
  const auth = getAuth();
  return toNodeHandler(auth)(req, res);
});

app.use("/api/webhook", webhookRoutes)

app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// Serve static assets (images, etc.)
app.use("/assets", express.static(path.join(__dirname, "assets")))

app.get("/health", asyncHandler(async (req: Request, res: Response) => {
  res.status(HTTPSTATUS.OK).json({
    message: "Server is healthy",
    status: "Ok"
  })

}))

app.use("/api", routes)

app.use(errorHandler)

app.listen(Env.PORT, async () => {
  await connectDatabase()
  console.log(`Server running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
})
