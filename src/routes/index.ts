import { Router, Request, Response } from "express";
import opportunitiesRouter from "./opportunities.routes";

const router = Router();

// Root route
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "IGT Search Tool Backend is running",
    health: "/health",
    opportunities: "/api/opportunities",
    timestamp: new Date().toISOString(),
  });
});

// Health check route
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
router.use("/api/opportunities", opportunitiesRouter);

export default router;
