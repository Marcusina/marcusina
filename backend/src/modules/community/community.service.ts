import type { PoolClient } from "pg";
import {
  deleteCommunityMember,
  findCommunityById,
  findPostById,
  getCommentsForPost,
  getFeedPosts,
  getMyCommunities as getMyCommunitiesRepo,
  insertCommunity,
  insertCommunityMember,
  insertPost,
  searchCommunities,
} from "./community.repository";

export class CommunityNotFoundError extends Error {
  constructor() {
    super("Community not found");
  }
}

export class PostNotFoundError extends Error {
  constructor() {
    super("Post not found");
  }
}

export class NotAMemberError extends Error {
  constructor() {
    super("You are not a member of this community");
  }
}

export function getCommunities(
  db: PoolClient,
  args: { search?: string; type?: string; page: number; limit: number },
) {
  return searchCommunities(db, args);
}

export function getMyCommunities(db: PoolClient, userId: string) {
  return getMyCommunitiesRepo(db, userId);
}

export async function joinCommunity(db: PoolClient, communityId: string, userId: string) {
  const community = await findCommunityById(db, communityId);
  if (!community) throw new CommunityNotFoundError();
  await insertCommunityMember(db, communityId, userId);
}

export async function leaveCommunity(db: PoolClient, communityId: string, userId: string) {
  const left = await deleteCommunityMember(db, communityId, userId);
  if (!left) throw new NotAMemberError();
}

export async function createCommunity(
  db: PoolClient,
  args: {
    name: string;
    communityType: string;
    description: string | null;
    organizationId: string | null;
    createdBy: string;
  },
) {
  const community = await insertCommunity(db, args);
  // The creator is automatically a member - there'd be no other way for
  // them to end up in their own community's member list otherwise.
  await insertCommunityMember(db, community.id, args.createdBy);
  return community;
}

export function getFeed(db: PoolClient, args: { page: number; limit: number }) {
  return getFeedPosts(db, args);
}

export async function createPost(
  db: PoolClient,
  args: { communityId: string | null; authorId: string; postType: string; content: unknown },
) {
  if (args.communityId) {
    const community = await findCommunityById(db, args.communityId);
    if (!community) throw new CommunityNotFoundError();
  }
  return insertPost(db, args);
}

export async function getPost(db: PoolClient, id: string) {
  const post = await findPostById(db, id);
  if (!post) throw new PostNotFoundError();
  const comments = await getCommentsForPost(db, id);
  return { ...post, comments };
}
