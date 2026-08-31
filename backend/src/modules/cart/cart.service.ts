import type { PoolClient } from "pg";
import {
  deleteCartItem,
  ensureCartExists,
  getCartItems,
  setCartItemQuantity,
  upsertCartItem,
} from "./cart.repository";

export class MedicationNotFoundError extends Error {
  constructor() {
    super("Medication not found");
  }
}

export class CartItemNotFoundError extends Error {
  constructor() {
    super("Cart item not found");
  }
}

function isForeignKeyViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23503";
}

export function getCart(db: PoolClient, userId: string) {
  return getCartItems(db, userId);
}

export async function addToCart(db: PoolClient, userId: string, medicationId: string, quantity: number) {
  await ensureCartExists(db, userId);
  try {
    return await upsertCartItem(db, userId, medicationId, quantity);
  } catch (err) {
    if (isForeignKeyViolation(err)) throw new MedicationNotFoundError();
    throw err;
  }
}

export async function updateCartItem(db: PoolClient, userId: string, itemId: string, quantity: number) {
  const updated = await setCartItemQuantity(db, userId, itemId, quantity);
  if (!updated) throw new CartItemNotFoundError();
  return updated;
}

export async function removeFromCart(db: PoolClient, userId: string, itemId: string) {
  const deleted = await deleteCartItem(db, userId, itemId);
  if (!deleted) throw new CartItemNotFoundError();
}
