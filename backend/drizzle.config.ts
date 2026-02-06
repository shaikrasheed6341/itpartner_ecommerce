import type { Config } from "drizzle-kit";
// import { env } from "./env";
import dotenv from "dotenv";
dotenv.config();
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
