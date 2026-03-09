import { Router } from "express";
import { OpportunitiesController } from "../controllers/opportunities.controller";

const router = Router();

// GET /api/opportunities
router.get("/", OpportunitiesController.getOpportunities);

// GET /api/opportunities/:id
router.get("/:id", OpportunitiesController.getOpportunityById);

export default router;
