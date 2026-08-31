import type { PoolClient } from "pg";
import { deleteWishlistItem, ensureWishlistExists, getWishlistItems, upsertWishlistItem } from "./wishlist.repository";

export class InvalidReferenceError extends Error {
  constructor() {
    super("Medication or inventory reference not found");
  }
}

export class WishlistItemNotFoundError extends Error {
  constructor() {
    super("Wishlist item not found");
  }
}

function isForeignKeyViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23503";
}

export function getWishlist(db: PoolClient, userId: string) {
  return getWishlistItems(db, userId);
}

export async function addToWishlist(
  db: PoolClient,
  userId: string,
  medicationId: string,
  inventoryId: string | null,
) {
  await ensureWishlistExists(db, userId);
  try {
    return await upsertWishlistItem(db, userId, medicationId, inventoryId);
  } catch (err) {
    if (isForeignKeyViolation(err)) throw new InvalidReferenceError();
    throw err;
  }
}

export async function removeFromWishlist(db: PoolClient, userId: string, itemId: string) {
  const deleted = await deleteWishlistItem(db, userId, itemId);
  if (!deleted) throw new WishlistItemNotFoundError();
}
