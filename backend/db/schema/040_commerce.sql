-- Commerce data: PII, not PHI. One cart/wishlist per user, matching
-- cart.api.js and wishlist.api.js which never address a cart/wishlist by its
-- own id -- only "the current user's cart/wishlist".
CREATE TABLE carts (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_user_id UUID NOT NULL REFERENCES carts(user_id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE (cart_user_id, medication_id)
);

CREATE TABLE inventories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id),
  organization_id UUID REFERENCES organizations(id),
  stock_qty INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE wishlists (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_user_id UUID NOT NULL REFERENCES wishlists(user_id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id),
  inventory_id UUID REFERENCES inventories(id),
  UNIQUE (wishlist_user_id, medication_id)
);
