import { Request, Response, NextFunction } from "express";
import { ExpaService } from "../services/expa.service";
import { env } from "../config/env";

import { FilterBuilder } from "../utils/filterBuilder";
import { CacheManager } from "../utils/cacheManager";
import { ValidationError } from "../utils/errors";

export class OpportunitiesController {
  static async getOpportunities(req: Request, res: Response, next: NextFunction) {
    try {
      // Create a cache key representing this exact frontend query permutation
      const cacheKey = CacheManager.generateKey("opportunities_list", req.query);
      
      const cachedResult = CacheManager.get(cacheKey);
      if (cachedResult) {
        // Return quickly via in-memory cache
        res.json(cachedResult);
        return;
      }

      // Use utility to parse pagination and core properties
      const pagination = FilterBuilder.buildOpportunityPagination(req.query);
      const filters = FilterBuilder.buildOpportunityFilters(req.query);

      const paginatedResult = await ExpaService.fetchOpportunities(
        pagination.page, 
        pagination.limit, 
        pagination.searchQuery, 
        filters
      );
      
      // Keep list cache short so new opportunities appear quickly without manual refresh.
      CacheManager.set(cacheKey, paginatedResult, env.OPPORTUNITIES_CACHE_TTL_MS);

      res.json(paginatedResult);
    } catch (error) {
      next(error);
    }
  }

  static async getOpportunityById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const opportunity = await ExpaService.fetchOpportunityById(id as string);
      
      if (!opportunity) {
        res.status(404).json({
          status: "error",
          message: "Opportunity not found",
        });
        return;
      }

      res.json({
        data: opportunity,
      });
    } catch (error) {
      next(error);
    }
  }
}
