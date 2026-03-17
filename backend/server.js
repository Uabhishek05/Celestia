import dotenv from "dotenv";
import app from "./app.js";
import { isDbReady, startDbConnectionWithRetry } from "./config/db.js";
import { ensureAdminUser } from "./utils/ensureAdminUser.js";
import { ensureStoreCollections } from "./utils/ensureStoreCollections.js";

dotenv.config();

const port = process.env.PORT || 5000;
const host = process.env.HOST || "127.0.0.1";

startDbConnectionWithRetry();

app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});

const seedAdminWhenReady = setInterval(async () => {
  if (!isDbReady()) {
    return;
  }

  clearInterval(seedAdminWhenReady);

  try {
    await ensureStoreCollections();
    await ensureAdminUser();
  } catch (error) {
    console.error(`Admin seed failed: ${error.message}`);
  }
}, 2000);
