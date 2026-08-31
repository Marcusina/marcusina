import type { PoolClient } from "pg";

export interface WishlistItemRow {
  id: string;
  wishlist_user_id: string;
  medication_id: string;
  inventory_id: string | null;
}

export interface WishlistItemWithMedication extends WishlistItemRow {
  name: string;
  price_cents: number;
  currency_code: string;
}

// wishlists/wishlist_items carry NO RLS (not PHI) - every query here filters
// by the owning user explicitly, same as cart.repository.ts.
export function ensureWishlistExists(db: PoolClient, userId: string) {
  return db.query("INSERT INTO wishlists (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING", [userId]);
}

export function getWishlistItems(db: PoolClient, userId: string) {
  return db
    .query<WishlistItemWithMedication>(
      `SELECT wi.id, wi.wishlist_user_id, wi.medication_id, wi.inventory_id, m.name, m.price_cents, m.currency_code
       FROM wishlist_items wi
       JOIN medications m ON m.id = wi.medication_id
       WHERE wi.wishlist_user_id = $1
       ORDER BY wi.id`,
      [userId],
    )
    .then((r) => r.rows);
}

export function upsertWishlistItem(
  db: PoolClient,
  userId: string,
  medicationId: string,
  inventoryId: string | null,
) {
  return db
    .query<WishlistItemRow>(
      `INSERT INTO wishlist_items (wishlist_user_id, medication_id, inventory_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (wishlist_user_id, medication_id) DO UPDATE SET inventory_id = excluded.inventory_id
       RETURNING *`,
      [userId, medicationId, inventoryId],
    )
    .then((r) => r.rows[0]);
}

export function deleteWishlistItem(db: PoolClient, userId: string, itemId: string) {
  return db
    .query("DELETE FROM wishlist_items WHERE id = $1 AND wishlist_user_id = $2", [itemId, userId])
    .then((r) => (r.rowCount ?? 0) > 0);
}
