import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import {
  CommunityNotFoundError,
  NotAMemberError,
  PostNotFoundError,
  createCommunity,
  createPost,
  getCommunities,
  getFeed,
  getMyCommunities,
  getPost,
  joinCommunity,
  leaveCommunity,
} from "./community.service";

const router = Router();

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

router.get("/communities/all", requireAuth, async (req, res, next) => {
  const parsed = paginationSchema
    .extend({ search: z.string().optional(), type: z.string().optional() })
    .safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid query parameters", details: parsed.error.issues } });
  }
  try {
    res.json(await getCommunities(req.db!, parsed.data));
  } catch (err) {
    next(err);
  }
});

// Shared endpoint: called as getUserCommunities from auth.api.js and as
// getMyCommunities from community.api.js - registered once, here.
router.get("/communities/my", requireAuth, async (req, res, next) => {
  try {
    res.json(await getMyCommunities(req.db!, req.user!.id));
  } catch (err) {
    next(err);
  }
});

router.post("/communities/:communityId/join", requireAuth, async (req, res, next) => {
  try {
    await joinCommunity(req.db!, req.params.communityId, req.user!.id);
    res.json({ data: { joined: true } });
  } catch (err) {
    if (err instanceof CommunityNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

router.post("/communities/:communityId/leave", requireAuth, async (req, res, next) => {
  try {
    await leaveCommunity(req.db!, req.params.communityId, req.user!.id);
    res.json({ data: { left: true } });
  } catch (err) {
    if (err instanceof NotAMemberError) return res.status(409).json({ error: { code: "NOT_A_MEMBER", message: err.message } });
    next(err);
  }
});

const createCommunitySchema = z.object({
  name: z.string().min(1),
  community_type: z.string().min(1),
  description: z.string().nullable().optional(),
  organization_id: z.string().uuid().nullable().optional(),
});

router.post("/communities/create", requireAuth, async (req, res, next) => {
  const parsed = createCommunitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const community = await createCommunity(req.db!, {
      name: parsed.data.name,
      communityType: parsed.data.community_type,
      description: parsed.data.description ?? null,
      organizationId: parsed.data.organization_id ?? null,
      createdBy: req.user!.id,
    });
    res.status(201).json(community);
  } catch (err) {
    next(err);
  }
});

router.get("/posts/feed", requireAuth, async (req, res, next) => {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid query parameters", details: parsed.error.issues } });
  }
  try {
    res.json(await getFeed(req.db!, parsed.data));
  } catch (err) {
    next(err);
  }
});

const createPostSchema = z.object({
  community_id: z.string().uuid().nullable().optional(),
  type: z.enum(["post", "article", "poll", "reel"]),
  content: z.record(z.unknown()),
});

router.post("/posts/create", requireAuth, async (req, res, next) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const post = await createPost(req.db!, {
      communityId: parsed.data.community_id ?? null,
      authorId: req.user!.id,
      postType: parsed.data.type,
      content: parsed.data.content,
    });
    res.status(201).json(post);
  } catch (err) {
    if (err instanceof CommunityNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

router.get("/posts/:postId", requireAuth, async (req, res, next) => {
  try {
    res.json(await getPost(req.db!, req.params.postId));
  } catch (err) {
    if (err instanceof PostNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

export default router;
