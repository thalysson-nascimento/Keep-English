// Explicit local command opt-in; never imported by the application or production build.
import { config } from "dotenv";

config({ path: ".variables", override: true, quiet: true });
const databaseUrl = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;
if (!databaseUrl || !/^postgres(?:ql)?:\/\//.test(databaseUrl)) {
  throw new Error(
    "The project variables must contain a PostgreSQL connection URL.",
  );
}
