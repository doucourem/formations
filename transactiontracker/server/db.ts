import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Check your .env file.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // ✅ désactive SSL pour local
});

export const db = drizzle(pool, { schema });
