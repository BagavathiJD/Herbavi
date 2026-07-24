import "dotenv/config";
import { runMigrations } from "../backend/db/migrate";

runMigrations()
  .then(() => {
    console.log("Migrations complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
