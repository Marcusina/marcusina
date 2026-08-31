import type { PoolClient } from "pg";

export interface CartItemRow {
  id: string;
  cart_user_id: string;
  medication_id: string;
  quantity: number;
}

export interface CartItemWithMedication extends CartItemRow {
  name: string;
  price_cents: number;
  currency_code: string;
}

// carts/cart_items carry NO RLS (not PHI, see 900_rls.sql) - every query
// here filters by the owning user explicitly. There is no database-layer
// backstop the way there is for appointments/prescriptions/etc.
export function ensureCartExists(db: PoolClient, userId: string) {
  return db.query("INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING", [userId]);
}

export function getCartItems(db: PoolClient, userId: string) {
  return db
    .query<CartItemWithMedication>(
      `SELECT ci.id, ci.cart_user_id, ci.medication_id, ci.quantity, m.name, m.price_cents, m.currency_code
       FROM cart_items ci
       JOIN medications m ON m.id = ci.medication_id
       WHERE ci.cart_user_id = $1
       ORDER BY ci.id`,
      [userId],
    )
    .then((r) => r.rows);
}

// Adding an already-present medication increments its quantity rather than
// erroring on the (cart_user_id, medication_id) UNIQUE constraint.
export function upsertCartItem(db: PoolClient, userId: string, medicationId: string, quantity: number) {
  return db
    .query<CartItemRow>(
      `INSERT INTO cart_items (cart_user_id, medication_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_user_id, medication_id) DO UPDATE SET quantity = cart_items.quantity + excluded.quantity
       RETURNING *`,
      [userId, medicationId, quantity],
    )
    .then((r) => r.rows[0]);
}

export function setCartItemQuantity(db: PoolClient, userId: string, itemId: string, quantity: number) {
  return db
    .query<CartItemRow>("UPDATE cart_items SET quantity = $3 WHERE id = $1 AND cart_user_id = $2 RETURNING *", [
      itemId,
      userId,
      quantity,
    ])
    .then((r) => r.rows[0] ?? null);
}

export function deleteCartItem(db: PoolClient, userId: string, itemId: string) {
  return db
    .query("DELETE FROM cart_items WHERE id = $1 AND cart_user_id = $2", [itemId, userId])
    .then((r) => (r.rowCount ?? 0) > 0);
}
