import { pgTable, unique, text, boolean, timestamp, integer, foreignKey, uuid, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const orderStatus = pgEnum("order_status", ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'])
export const paymentMethod = pgEnum("payment_method", ['RAZORPAY'])
export const paymentStatus = pgEnum("payment_status", ['PENDING', 'SUCCESS', 'FAILED'])
export const role = pgEnum("role", ['ADMIN', 'USER'])


export const admins = pgTable("admins", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	fullName: text("full_name").notNull(),
	otp: text(),
	isFirstLogin: boolean("is_first_login").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("admins_email_unique").on(table.email),
]);

export const contactForms = pgTable("contact_forms", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	message: text().notNull(),
	phone: text(),
	service: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const dailyStats = pgTable("daily_stats", {
	id: text().primaryKey().notNull(),
	date: timestamp({ mode: 'string' }).defaultNow(),
	totalVisits: integer("total_visits").default(0),
	uniqueVisits: integer("unique_visits").default(0),
	pageViews: text("page_views").default('{}'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("daily_stats_date_unique").on(table.date),
]);

export const visitors = pgTable("visitors", {
	id: text().primaryKey().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	page: text(),
	referer: text(),
	count: text(),
	date: timestamp({ mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	fullName: text("full_name").notNull(),
	phone: text().notNull(),
	houseNumber: text("house_number").notNull(),
	street: text().notNull(),
	area: text().notNull(),
	city: text().notNull(),
	state: text().notNull(),
	pinCode: text("pin_code").notNull(),
	livelocation: text(),
	role: role().default('USER'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const cart = pgTable("cart", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "cart_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "cart_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	brand: text().notNull(),
	imageUrl: text("image_url"),
	quantity: integer(),
	rate: numeric().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const orders = pgTable("orders", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	orderNumber: text("order_number").notNull(),
	status: orderStatus().default('CONFIRMED'),
	totalAmount: numeric("total_amount").notNull(),
	currency: text().default('INR'),
	paymentMethod: text("payment_method"),
	razorpayOrderId: text("razorpay_order_id"),
	orderPlacedAt: timestamp("order_placed_at", { mode: 'string' }),
	processingAt: timestamp("processing_at", { mode: 'string' }),
	packedAt: timestamp("packed_at", { mode: 'string' }),
	shippedAt: timestamp("shipped_at", { mode: 'string' }),
	inTransitAt: timestamp("in_transit_at", { mode: 'string' }),
	outForDeliveryAt: timestamp("out_for_delivery_at", { mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	trackingNumber: text("tracking_number"),
	carrierName: text("carrier_name"),
	estimatedDelivery: timestamp("estimated_delivery", { mode: 'string' }),
	deliveryNotes: text("delivery_notes"),
	deliveryConfirmed: boolean("delivery_confirmed"),
	deliveryConfirmedAt: timestamp("delivery_confirmed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("orders_order_number_unique").on(table.orderNumber),
	unique("orders_razorpay_order_id_unique").on(table.razorpayOrderId),
]);

export const orderItems = pgTable("order_items", {
	id: text().primaryKey().notNull(),
	orderId: text("order_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().notNull(),
	price: numeric().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const orderTracking = pgTable("order_tracking", {
	id: text().primaryKey().notNull(),
	orderId: text("order_id").notNull(),
	stage: orderStatus().notNull(),
	status: text().notNull(),
	notes: text(),
	updatedBy: text("updated_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_tracking_order_id_orders_id_fk"
		}).onDelete("cascade"),
]);

export const payments = pgTable("payments", {
	id: text().primaryKey().notNull(),
	orderId: text("order_id").notNull(),
	userId: text("user_id").notNull(),
	paymentMethod: paymentMethod("payment_method"),
	amount: numeric().notNull(),
	status: paymentStatus().default('PENDING'),
	providerPaymentId: text("provider_payment_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "payments_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payments_user_id_users_id_fk"
		}).onDelete("cascade"),
]);
