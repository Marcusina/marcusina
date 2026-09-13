-- Backs the "my posts" query (getMyPosts in community.repository.ts) -
-- filtering a single author's posts chronologically, the same shape as
-- idx_posts_feed but scoped to one author.
CREATE INDEX idx_posts_author ON posts(author_id, created_at DESC);
