import { relations } from "drizzle-orm/relations";
import { users, cart, products, orders, orderItems, orderTracking, payments } from "./schema";

export const cartRelations = relations(cart, ({one}) => ({
	user: one(users, {
		fields: [cart.userId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [cart.productId],
		references: [products.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	carts: many(cart),
	orders: many(orders),
	payments: many(payments),
}));

export const productsRelations = relations(products, ({many}) => ({
	carts: many(cart),
	orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	orderItems: many(orderItems),
	orderTrackings: many(orderTracking),
	payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));

export const orderTrackingRelations = relations(orderTracking, ({one}) => ({
	order: one(orders, {
		fields: [orderTracking.orderId],
		references: [orders.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	order: one(orders, {
		fields: [payments.orderId],
		references: [orders.id]
	}),
	user: one(users, {
		fields: [payments.userId],
		references: [users.id]
	}),
}));