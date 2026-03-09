import { initSyncOpportunitiesJob } from "./syncOpportunities.job";
import { initNotificationsJob } from "./notifications.job";

/**
 * Main registry function to initialize all background cron jobs 
 * concurrently on server startup.
 */
export const registerCronJobs = () => {
  console.log("\n[CRON] Initializing Background Jobs...");
  
  initSyncOpportunitiesJob();
  initNotificationsJob();

  console.log("[CRON] Background Jobs Ready.\n");
};
