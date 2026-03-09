import express, { Express } from "express";
import cors from "cors";
import mainRouter from "./routes/index";
import { errorHandler } from "./utils/errorHandler";
import { env } from "./config/env";

const app: Express = express();
const allowedOrigins = env.FRONTEND_ORIGINS.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

// Middleware
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
				return;
			}

			callback(new Error("Not allowed by CORS"));
		},
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(mainRouter);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
