import type { PoolClient } from "pg";

export interface CommunityRow {
  id: string;
  organization_id: string | null;
  name: string;
  community_type: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

// Matches idx_communities_search in 030_community.sql - a plain ILIKE would
// silently skip that index, same reasoning as meds.repository.ts.
export function searchCommunities(
  db: PoolClient,
  args: { search?: string; type?: string; page: number; limit: number },
) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (args.search) {
    params.push(args.search);
    clauses.push(
      `to_tsvector('english', name || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', $${params.length})`,
    );
  }
  if (args.type) {
    params.push(args.type);
    clauses.push(`community_type = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(args.limit, (args.page - 1) * args.limit);

  return db
    .query<CommunityRow>(
      `SELECT * FROM communities ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    )
    .then((r) => r.rows);
}

export function getMyCommunities(db: PoolClient, userId: string) {
  return db
    .query<CommunityRow>(
      `SELECT c.* FROM communities c
       JOIN community_members cm ON cm.community_id = c.id
       WHERE cm.user_id = $1
       ORDER BY cm.joined_at DESC`,
      [userId],
    )
    .then((r) => r.rows);
}

export function findCommunityById(db: PoolClient, id: string) {
  return db.query<CommunityRow>("SELECT * FROM communities WHERE id = $1", [id]).then((r) => r.rows[0] ?? null);
}

export function insertCommunityMember(db: PoolClient, communityId: string, userId: string) {
  return db.query(
    "INSERT INTO community_members (community_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [communityId, userId],
  );
}

export function deleteCommunityMember(db: PoolClient, communityId: string, userId: string) {
  return db
    .query("DELETE FROM community_members WHERE community_id = $1 AND user_id = $2", [communityId, userId])
    .then((r) => (r.rowCount ?? 0) > 0);
}

export function insertCommunity(
  db: PoolClient,
  args: {
    name: string;
    communityType: string;
    description: string | null;
    organizationId: string | null;
    createdBy: string;
  },
) {
  return db
    .query<CommunityRow>(
      `INSERT INTO communities (name, community_type, description, organization_id, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [args.name, args.communityType, args.description, args.organizationId, args.createdBy],
    )
    .then((r) => r.rows[0]);
}

export interface PostRow {
  id: string;
  community_id: string | null;
  author_id: string;
  post_type: string;
  content: unknown;
  created_at: string;
}

// Matches idx_posts_feed in 030_community.sql - a global chronological feed
// across all communities, not scoped to the caller's memberships. That
// index was built for exactly this shape of query.
export function getFeedPosts(db: PoolClient, args: { page: number; limit: number }) {
  return db
    .query<PostRow>("SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2", [
      args.limit,
      (args.page - 1) * args.limit,
    ])
    .then((r) => r.rows);
}

export function insertPost(
  db: PoolClient,
  args: { communityId: string | null; authorId: string; postType: string; content: unknown },
) {
  return db
    .query<PostRow>(
      "INSERT INTO posts (community_id, author_id, post_type, content) VALUES ($1, $2, $3, $4) RETURNING *",
      [args.communityId, args.authorId, args.postType, JSON.stringify(args.content)],
    )
    .then((r) => r.rows[0]);
}

export function findPostById(db: PoolClient, id: string) {
  return db.query<PostRow>("SELECT * FROM posts WHERE id = $1", [id]).then((r) => r.rows[0] ?? null);
}

export interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export function getCommentsForPost(db: PoolClient, postId: string) {
  return db
    .query<CommentRow>("SELECT * FROM post_comments WHERE post_id = $1 ORDER BY created_at ASC", [postId])
    .then((r) => r.rows);
}
