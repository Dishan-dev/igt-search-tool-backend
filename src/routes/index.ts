import { Router, Request, Response } from "express";
import opportunitiesRouter from "./opportunities.routes";
import { OpportunityAssignmentsService } from "../services/opportunityAssignments.service";

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

// Debug: sheet assignment sync check (only accessible when DEBUG_SHEET=true in env)
router.get("/debug/assignments", async (req: Request, res: Response) => {
  if (process.env.DEBUG_SHEET !== "true") {
    res.status(403).json({ error: "Debug endpoint disabled. Set DEBUG_SHEET=true in .env to enable." });
    return;
  }

  try {
    // Enrich a dummy opportunity with id "__probe__" to force a sheet fetch
    // and return the raw enriched results for a real id if provided
    const probeId = typeof req.query["id"] === "string" ? req.query["id"] : null;

    const results = await OpportunityAssignmentsService.enrichOpportunities(
      probeId ? [{ id: probeId } as any] : []
    );

    res.json({
      sheetUrl: process.env.GOOGLE_SHEET_CSV_URL || "(not set)",
      probeId: probeId ?? "(none)",
      parsedHeaders: OpportunityAssignmentsService.lastRawHeaders,
      normalizedHeaders: OpportunityAssignmentsService.lastNormalizedHeaders,
      result: results[0] ?? null,
      message: probeId
        ? results[0]?.assignedPersonName
          ? `✅ Assignment found for ID ${probeId}`
          : `⚠️ No assignment matched for ID ${probeId} — check sheet rows`
        : "Sheet fetched. Pass ?id=<opportunityId> to test a specific row.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes
router.use("/api/opportunities", opportunitiesRouter);

export default router;
