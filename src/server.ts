import app from "./app";
import { env } from "./config/env";
import { registerCronJobs } from "./jobs";

const startServer = () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`🚀 Server is running on port ${env.PORT}`);
      console.log(`Health check: http://localhost:${env.PORT}/health`);
      console.log(`API endpoint: http://localhost:${env.PORT}/api/opportunities`);
      
      // Initialize background job placeholders
      registerCronJobs();
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
