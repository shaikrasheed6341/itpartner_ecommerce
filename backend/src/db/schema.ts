import {
  pgTable,
  text,
  varchar,
  uuid,
  integer,
  boolean,
  timestamp,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";

/* =========================
   ENUMS
========================= */

export const roleEnum = pgEnum("role", ["ADMIN", "USER"]);

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["RAZORPAY"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
]);

/* =========================
   USERS
========================= */

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  houseNumber: text("house_number").notNull(),
  street: text("street").notNull(),
  area: text("area").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pinCode: text("pin_code").notNull(),
  livelocation: text("livelocation"),
  role: roleEnum("role").default("USER"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   CONTACT FORM
========================= */

export const contactForms = pgTable("contact_forms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  phone: text("phone"),
  service: text("service"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   VISITORS
========================= */

export const visitors = pgTable("visitors", {
  id: text("id").primaryKey(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  page: text("page"),
  referer: text("referer"),
  count: text("count"),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   DAILY STATS
========================= */

export const dailyStats = pgTable("daily_stats", {
  id: text("id").primaryKey(),
  date: timestamp("date").unique().defaultNow(),
  totalVisits: integer("total_visits").default(0),
  uniqueVisits: integer("unique_visits").default(0),
  pageViews: text("page_views").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   PRODUCTS
========================= */

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  imageUrl: text("image_url"),
  quantity: integer("quantity"),
  rate: numeric("rate").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   CART
========================= */

export const cart = pgTable("cart", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   ORDERS
========================= */

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  orderNumber: text("order_number").unique().notNull(),
  status: orderStatusEnum("status").default("CONFIRMED"),
  totalAmount: numeric("total_amount").notNull(),
  currency: text("currency").default("INR"),
  paymentMethod: text("payment_method"),
  razorpayOrderId: text("razorpay_order_id").unique(),

  orderPlacedAt: timestamp("order_placed_at"),
  processingAt: timestamp("processing_at"),
  packedAt: timestamp("packed_at"),
  shippedAt: timestamp("shipped_at"),
  inTransitAt: timestamp("in_transit_at"),
  outForDeliveryAt: timestamp("out_for_delivery_at"),
  deliveredAt: timestamp("delivered_at"),

  trackingNumber: text("tracking_number"),
  carrierName: text("carrier_name"),
  estimatedDelivery: timestamp("estimated_delivery"),
  deliveryNotes: text("delivery_notes"),

  deliveryConfirmed: boolean("delivery_confirmed"),
  deliveryConfirmedAt: timestamp("delivery_confirmed_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   ORDER ITEMS
========================= */

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   PAYMENTS
========================= */

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  paymentMethod: paymentMethodEnum("payment_method"),
  amount: numeric("amount").notNull(),
  status: paymentStatusEnum("status").default("PENDING"),
  providerPaymentId: text("provider_payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   ORDER TRACKING
========================= */

export const orderTracking = pgTable("order_tracking", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  stage: orderStatusEnum("stage").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   ADMINS
========================= */

export const admins = pgTable("admins", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  otp: text("otp"),
  isFirstLogin: boolean("is_first_login").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
