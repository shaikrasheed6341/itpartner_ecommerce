import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg"; // ✅ MISSING IMPORT (IMPORTANT)

// Ensure env vars are loaded even if this module is imported before entrypoint
dotenv.config();

declare global {
  // eslint-disable-next-line no-var
  var drizzleDb: ReturnType<typeof drizzle> | undefined;
}

console.log('🔍 DB connection type:', typeof process.env.DATABASE_URL);
console.log('🔍 DB connection string sample:', process.env.DATABASE_URL ? `${process.env.DATABASE_URL.slice(0,60)}...` : process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error('⚠️ DATABASE_URL is not set. Please add it to your .env or environment variables.');
  throw new Error('DATABASE_URL is required but missing');
}

const db =
  global.drizzleDb ??
  drizzle(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  );

if (process.env.NODE_ENV !== "production") {
  global.drizzleDb = db;
}

// Attach simple model helpers to mimic Prisma-like API used by controllers
import { admins, orders, payments, cart, orderItems, users } from './schema';
import { eq } from 'drizzle-orm';

const dbWithModels: any = db as any;

// Admin helpers
dbWithModels.admin = {
  findUnique: async ({ where }: any) => {
    if (where?.email) {
      const rows = await db.select().from(admins).where(eq(admins.email, where.email)).limit(1);
      return rows[0] ?? null;
    }
    if (where?.id) {
      const rows = await db.select().from(admins).where(eq(admins.id, where.id)).limit(1);
      return rows[0] ?? null;
    }
    return null;
  },
  create: async ({ data }: any) => {
    // Ensure an id is present for tables without DB-side defaults
    const record = { id: data.id ?? randomUUID(), ...data };
    const result = await db.insert(admins).values(record).returning();
    return result[0];
  },
  update: async ({ where, data }: any) => {
    const result = await db.update(admins).set(data).where(eq(admins.id, where.id)).returning();
    return result[0];
  }
};

// Order helpers
dbWithModels.order = {
  findMany: async ({ where, include, orderBy }: any) => {
    let q: any = db.select().from(orders);
    if (where?.userId) q = q.where(eq(orders.userId, where.userId));
    if (orderBy) q = q.orderBy({ column: orders.createdAt, direction: 'desc' });
    const rows = await q;
    return rows;
  },
  findFirst: async ({ where }: any) => {
    let q: any = db.select().from(orders);
    if (where?.id) q = q.where(eq(orders.id, where.id));
    if (where?.userId) q = q.where(eq(orders.userId, where.userId));
    if (where?.razorpayOrderId) q = q.where(eq(orders.razorpayOrderId, where.razorpayOrderId));
    const rows = await q.limit(1);
    return rows[0] ?? null;
  },
  update: async ({ where, data }: any) => {
    const result = await db.update(orders).set(data).where(eq(orders.id, where.id)).returning();
    return result[0];
  }
};

// Payment helper
dbWithModels.payment = {
  create: async ({ data }: any) => {
    const record = { id: data.id ?? randomUUID(), ...data };
    const result = await db.insert(payments).values(record).returning();
    return result[0];
  }
};

// Cart helper (deleteMany)
dbWithModels.cart = {
  deleteMany: async ({ where }: any) => {
    if (where?.userId) {
      const result = await db.delete(cart).where(eq(cart.userId, where.userId)).returning();
      return result;
    }
    return null;
  }
};

export { dbWithModels as db, dbWithModels as prisma };
