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

// Create a single shared pg Pool and drizzle instance. Cache both in the global object
// so restarting in dev doesn't recreate new connection pools repeatedly.
const pool = (global as any).__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
const dbInstance = global.drizzleDb ?? drizzle(pool);

if (process.env.NODE_ENV !== "production") {
  (global as any).__pgPool = pool;
  global.drizzleDb = dbInstance;
}

const db = dbInstance; // keep the same name used elsewhere for clarity


// Attach simple model helpers to mimic Prisma-like API used by controllers
import { admins, orders, payments, cart, orderItems, users, products } from './schema';
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

// User helpers
// Provides a lightweight Prisma-like API used by controllers: findUnique, create, update, findMany, count
dbWithModels.user = {
  findUnique: async ({ where }: any) => {
    if (where?.email) {
      const rows = await db.select().from(users).where(eq(users.email, where.email)).limit(1);
      return rows[0] ?? null;
    }
    if (where?.id) {
      const rows = await db.select().from(users).where(eq(users.id, where.id)).limit(1);
      return rows[0] ?? null;
    }
    return null;
  },
  create: async ({ data }: any) => {
    const record = { id: data.id ?? randomUUID(), ...data };
    const result = await db.insert(users).values(record).returning();
    return result[0];
  },
  update: async ({ where, data }: any) => {
    const result = await db.update(users).set(data).where(eq(users.id, where.id)).returning();
    return result[0];
  },
  // Basic findMany that supports take, skip, ordering and simple search (in-memory) for Prisma-like 'OR contains' structure
  findMany: async ({ where, take, skip, orderBy }: any = {}) => {
    let rows: any[] = await db.select().from(users);

    // Support simple OR contains search (case-insensitive) produced by controllers
    if (where?.OR && Array.isArray(where.OR) && where.OR.length > 0) {
      const firstOr = where.OR[0] as any;
      const key = Object.keys(firstOr)[0];
      const contains = firstOr[key]?.contains;
      if (typeof contains === 'string') {
        const s = contains.toLowerCase();
        rows = rows.filter((r: any) => (
          (r.fullName && r.fullName.toLowerCase().includes(s)) ||
          (r.email && r.email.toLowerCase().includes(s)) ||
          (r.phone && r.phone.toLowerCase().includes(s))
        ));
      }
    }

    // orderBy createdAt desc
    if (orderBy && orderBy.createdAt === 'desc') {
      rows = rows.sort((a: any, b: any) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }

    if (typeof skip === 'number') rows = rows.slice(skip);
    if (typeof take === 'number') rows = rows.slice(0, take);

    return rows;
  },
  count: async ({ where }: any = {}) => {
    const rows = await dbWithModels.user.findMany({ where });
    return rows.length;
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

// Product helpers
// Basic create, findMany and count used by controllers
dbWithModels.product = {
  create: async ({ data }: any) => {
    const record = { id: data.id ?? undefined, ...data };
    const result = await db.insert(products).values(record).returning();
    return result[0];
  },
  findMany: async ({ where, take, skip, orderBy }: any = {}) => {
    let rows: any[] = await db.select().from(products);

    // Support simple OR contains search on name or brand
    if (where?.OR && Array.isArray(where.OR) && where.OR.length > 0) {
      const firstOr = where.OR[0] as any;
      const key = Object.keys(firstOr)[0];
      const contains = firstOr[key]?.contains;
      if (typeof contains === 'string') {
        const s = contains.toLowerCase();
        rows = rows.filter((r: any) => (
          (r.name && r.name.toLowerCase().includes(s)) ||
          (r.brand && r.brand.toLowerCase().includes(s))
        ));
      }
    }

    // orderBy createdAt desc
    if (orderBy && orderBy.createdAt === 'desc') {
      rows = rows.sort((a: any, b: any) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }

    if (typeof skip === 'number') rows = rows.slice(skip);
    if (typeof take === 'number') rows = rows.slice(0, take);

    return rows;
  },
  count: async ({ where }: any = {}) => {
    const rows = await dbWithModels.product.findMany({ where });
    return rows.length;
  }
};

// Connection helpers (compatible with code expecting Prisma-like API)
dbWithModels.$connect = async () => {
  // Perform a lightweight query to verify connectivity
  await pool.query('SELECT 1');
};

dbWithModels.$disconnect = async () => {
  await pool.end();
};

export { dbWithModels as db, dbWithModels as prisma };
