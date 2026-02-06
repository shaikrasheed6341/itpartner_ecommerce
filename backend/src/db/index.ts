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

// if (!process.env.DATABASE_URL) {
//   throw new Error('DATABASE_URL is required but missing');
// }

// Create a single shared pg Pool and drizzle instance. Cache both in the global object
// so restarting in dev doesn't recreate new connection pools repeatedly.
const connectionString = process.env.DATABASE_URL;
console.log('DB Connection String present:', !!connectionString);
if (connectionString) {
  console.log('DB Connection String start:', connectionString.substring(0, 15) + '...');
}

const pool = (global as any).__pgPool ?? new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Required for Supabase/Cloudflare usually
});

// Attempt connection verification
pool.query('SELECT 1').then(() => {
  console.log('DB Connection successful');
}).catch((err: any) => {
  console.error('DB Connection failed:', err);
});
const dbInstance = global.drizzleDb ?? drizzle(pool);

if (process.env.NODE_ENV !== "production") {
  (global as any).__pgPool = pool;
  global.drizzleDb = dbInstance;
}

const db = dbInstance; // keep the same name used elsewhere for clarity


// Attach simple model helpers to mimic Prisma-like API used by controllers
import { admins, orders, payments, cart, orderItems, users, products } from './schema';
import { eq, desc } from 'drizzle-orm';

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
    // Apply orderBy - default to desc if orderBy is provided
    if (orderBy) {
      if (orderBy.createdAt === 'desc') {
        q = q.orderBy(desc(orders.createdAt));
      } else {
        q = q.orderBy(desc(orders.createdAt)); // Default to desc
      }
    } else {
      q = q.orderBy(desc(orders.createdAt)); // Default to desc
    }
    const rows = await q;

    // Handle includes
    if (include && rows.length > 0) {
      const allOrderItems = await db.select().from(orderItems);
      const allProducts = include.orderItems ? await db.select().from(products) : [];
      const allUsers = include.user ? await db.select().from(users) : [];
      const allPayments = include.payments ? await db.select().from(payments) : [];

      return rows.map((order: any) => {
        const result: any = { ...order };

        // Include orderItems with products
        if (include.orderItems) {
          const items = allOrderItems.filter((item: any) => item.orderId === order.id);
          result.orderItems = items.map((item: any) => {
            const itemResult: any = { ...item };
            if (include.orderItems.include?.product) {
              const product = allProducts.find((p: any) => p.id === item.productId);
              if (product) {
                // Handle select for product
                if (include.orderItems.include.product.select) {
                  const selected: any = {};
                  Object.keys(include.orderItems.include.product.select).forEach((key: string) => {
                    if (include.orderItems.include.product.select[key] && (product as any)[key] !== undefined) {
                      selected[key] = (product as any)[key];
                    }
                  });
                  itemResult.product = selected;
                } else {
                  itemResult.product = product;
                }
              } else {
                itemResult.product = null;
              }
            }
            return itemResult;
          });
        }

        // Include user
        if (include.user) {
          const user = allUsers.find((u: any) => u.id === order.userId);
          if (user) {
            if (include.user.select) {
              const selected: any = {};
              Object.keys(include.user.select).forEach((key: string) => {
                if (include.user.select[key] && (user as any)[key] !== undefined) {
                  selected[key] = (user as any)[key];
                }
              });
              result.user = selected;
            } else {
              result.user = user;
            }
          } else {
            result.user = null;
          }
        }

        // Include payments
        if (include.payments) {
          const orderPayments = allPayments.filter((p: any) => p.orderId === order.id);
          if (include.payments.select) {
            result.payments = orderPayments.map((payment: any) => {
              const selected: any = {};
              Object.keys(include.payments.select).forEach((key: string) => {
                if (include.payments.select[key] && (payment as any)[key] !== undefined) {
                  selected[key] = (payment as any)[key];
                }
              });
              return selected;
            });
          } else {
            result.payments = orderPayments;
          }
        }

        return result;
      });
    }

    return rows;
  },
  findFirst: async ({ where, include }: any) => {
    let q: any = db.select().from(orders);
    if (where?.id) q = q.where(eq(orders.id, where.id));
    if (where?.userId) q = q.where(eq(orders.userId, where.userId));
    if (where?.razorpayOrderId) q = q.where(eq(orders.razorpayOrderId, where.razorpayOrderId));
    const rows = await q.limit(1);
    const order = rows[0] ?? null;

    if (!order) return null;

    // Handle includes
    if (include) {
      const result: any = { ...order };

      // Include orderItems with products
      if (include.orderItems) {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        const allProducts = include.orderItems.include?.product ? await db.select().from(products) : [];

        result.orderItems = items.map((item: any) => {
          const itemResult: any = { ...item };
          if (include.orderItems.include?.product) {
            const product = allProducts.find((p: any) => p.id === item.productId);
            if (product) {
              if (include.orderItems.include.product.select) {
                const selected: any = {};
                Object.keys(include.orderItems.include.product.select).forEach((key: string) => {
                  if (include.orderItems.include.product.select[key] && (product as any)[key] !== undefined) {
                    selected[key] = (product as any)[key];
                  }
                });
                itemResult.product = selected;
              } else {
                itemResult.product = product;
              }
            } else {
              itemResult.product = null;
            }
          }
          return itemResult;
        });
      }

      // Include user
      if (include.user) {
        const userRows = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
        const user = userRows[0] ?? null;
        if (user) {
          if (include.user.select) {
            const selected: any = {};
            Object.keys(include.user.select).forEach((key: string) => {
              if (include.user.select[key] && (user as any)[key] !== undefined) {
                selected[key] = (user as any)[key];
              }
            });
            result.user = selected;
          } else {
            result.user = user;
          }
        } else {
          result.user = null;
        }
      }

      // Include payments
      if (include.payments) {
        const orderPayments = await db.select().from(payments).where(eq(payments.orderId, order.id));
        if (include.payments.select) {
          result.payments = orderPayments.map((payment: any) => {
            const selected: any = {};
            Object.keys(include.payments.select).forEach((key: string) => {
              if (include.payments.select[key] && (payment as any)[key] !== undefined) {
                selected[key] = (payment as any)[key];
              }
            });
            return selected;
          });
        } else {
          result.payments = orderPayments;
        }
      }

      return result;
    }

    return order;
  },
  create: async ({ data, include }: any) => {
    const orderId = data.id ?? randomUUID();
    const orderRecord = {
      id: orderId,
      userId: data.userId,
      orderNumber: data.orderNumber,
      status: data.status,
      totalAmount: data.totalAmount,
      currency: data.currency || 'INR',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const orderResult = await db.insert(orders).values(orderRecord).returning();
    const createdOrder = orderResult[0];

    // Handle nested orderItems creation
    let createdOrderItems: any[] = [];
    if (data.orderItems?.create && Array.isArray(data.orderItems.create)) {
      for (const itemData of data.orderItems.create) {
        const itemRecord = {
          id: randomUUID(),
          orderId: orderId,
          productId: itemData.productId,
          quantity: itemData.quantity,
          price: itemData.price,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const itemResult = await db.insert(orderItems).values(itemRecord).returning();
        createdOrderItems.push(itemResult[0]);
      }
    }

    // If include.orderItems is requested, attach them with products
    if (include?.orderItems) {
      const allProducts = await db.select().from(products);
      const itemsWithProducts = createdOrderItems.map((item: any) => {
        const product = allProducts.find((p: any) => p.id === item.productId);
        return {
          ...item,
          product: product || null
        };
      });

      return {
        ...createdOrder,
        orderItems: itemsWithProducts
      };
    }

    return createdOrder;
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

// Cart helpers
dbWithModels.cart = {
  findMany: async ({ where, include }: any = {}) => {
    let rows: any[] = await db.select().from(cart);

    if (where?.userId) {
      rows = rows.filter((r: any) => r.userId === where.userId);
    }

    // If include.product is requested, join with products
    if (include?.product) {
      const allProducts = await db.select().from(products);
      rows = rows.map((cartItem: any) => {
        const product = allProducts.find((p: any) => p.id === cartItem.productId);
        return {
          ...cartItem,
          product: product || null
        };
      });
    }

    return rows;
  },

  findFirst: async ({ where, include }: any = {}) => {
    let rows: any[] = await db.select().from(cart);

    if (where?.userId) {
      rows = rows.filter((r: any) => r.userId === where.userId);
    }
    if (where?.productId) {
      rows = rows.filter((r: any) => r.productId === where.productId);
    }
    if (where?.id) {
      rows = rows.filter((r: any) => r.id === where.id);
    }

    const row = rows[0] ?? null;

    // If include.product is requested, join with product
    if (row && include?.product) {
      const allProducts = await db.select().from(products);
      const product = allProducts.find((p: any) => p.id === row.productId);
      return {
        ...row,
        product: product || null
      };
    }

    return row;
  },

  create: async ({ data, include }: any) => {
    const record = { id: data.id ?? randomUUID(), ...data };
    const result = await db.insert(cart).values(record).returning();
    const created = result[0];

    // If include.product is requested, join with product
    if (created && include?.product) {
      const allProducts = await db.select().from(products);
      const product = allProducts.find((p: any) => p.id === created.productId);
      return {
        ...created,
        product: product || null
      };
    }

    return created;
  },

  update: async ({ where, data, include }: any) => {
    const result = await db.update(cart).set(data).where(eq(cart.id, where.id)).returning();
    const updated = result[0];

    // If include.product is requested, join with product
    if (updated && include?.product) {
      const allProducts = await db.select().from(products);
      const product = allProducts.find((p: any) => p.id === updated.productId);
      return {
        ...updated,
        product: product || null
      };
    }

    return updated;
  },

  delete: async ({ where }: any) => {
    const result = await db.delete(cart).where(eq(cart.id, where.id)).returning();
    return result[0];
  },

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
  findUnique: async ({ where }: any) => {
    if (where?.id) {
      const rows = await db.select().from(products);
      const product = rows.find((p: any) => p.id === where.id);
      return product ?? null;
    }
    return null;
  },
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
  },
  update: async ({ where, data }: any) => {
    if (!where?.id) {
      throw new Error('Product ID is required for update');
    }

    // Convert snake_case to camelCase if needed
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.image_url !== undefined) updateData.imageUrl = data.image_url;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.rate !== undefined) updateData.rate = data.rate;

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    const result = await db.update(products)
      .set(updateData)
      .where(eq(products.id, where.id))
      .returning();

    return result[0] ?? null;
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
