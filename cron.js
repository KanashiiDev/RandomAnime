import { CronJob } from "cron";
import dailyUpdate from "./jobs/dailyUpdate.js";
const job = new CronJob(
  "0 0 * * *", // Run every day at 00:00.
  function () {
    dailyUpdate();
  }, // onTick
  null, // onComplete
  true, // start
  "America/Los_Angeles" // timeZone
);
