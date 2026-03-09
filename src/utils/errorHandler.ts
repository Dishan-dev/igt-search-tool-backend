import { Request, Response, NextFunction } from "express";
import { AppError, ExpaApiError } from "./errors";

// Centralized error handler middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Determine if it's a known operational error
  if (err instanceof AppError) {
    if (err instanceof ExpaApiError) {
      console.error(`[EXPA API ERROR] ${err.message}`, err.details || "");
    } else {
      console.warn(`[APP ERROR] ${err.message}`);
    }

    res.status(err.statusCode).json({
      message: err.message,
      details: err.details || null,
    });
    return;
  }

  // Handle unexpected or native errors securely
  console.error("[UNEXPECTED INTERNAL ERROR]:", err);

  res.status(500).json({
    message: "Something went wrong internally",
    details: null,
  });
};
