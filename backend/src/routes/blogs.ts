import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

const defaultBlogs = [
  {
    id: "b1",
    title: "The Secret Behind Authentic Gujarati Kaju Katli",
    slug: "secret-behind-authentic-kaju-katli",
    author: "Chef Pratik",
    category: "Recipes & Sweets",
    status: "published",
    publishedAt: new Date("2026-08-01").toISOString(),
    createdAt: new Date("2026-08-01").toISOString(),
    content: "Our traditional recipe uses pure A2 desi ghee, handpicked Goan cashews, and zero artificial preservatives..."
  },
  {
    id: "b2",
    title: "Top 5 Festive Sweets for Indian Celebrations",
    slug: "top-5-festive-sweets",
    author: "Admin Team",
    category: "Festive Guide",
    status: "published",
    publishedAt: new Date("2026-08-03").toISOString(),
    createdAt: new Date("2026-08-03").toISOString(),
    content: "Discover our curated collection of luxury sweet gift boxes perfect for weddings, corporate gifting, and festivals..."
  }
];

// GET /api/blogs - Storefront blog list (published posts only)
router.get("/", async (req, res) => {
  try {
    const { page = "1", limit = "10", includeDrafts = "false" } = req.query;

    const posts = await prisma.blogPost.findMany({
      where: includeDrafts === "true" ? {} : { status: "published" },
      orderBy: { createdAt: "desc" },
    });

    if (!posts || posts.length === 0) {
      return res.json(defaultBlogs.filter(b => includeDrafts === "true" || b.status === "published"));
    }

    const take = Number(limit);
    const currentPage = Number(page);
    const skip = (currentPage - 1) * take;
    const paged = posts.slice(skip, skip + take);

    res.json({
      posts: paged,
      total: posts.length,
      page: currentPage,
      limit: take
    });
  } catch (error) {
    res.json({ posts: defaultBlogs, total: defaultBlogs.length, page: 1, limit: 10 });
  }
});

// GET /api/blogs/:slug - Single published blog post
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: "published"
      }
    });

    if (!post) {
      const fallback = defaultBlogs.find(b => b.slug === slug || b.id === slug);
      if (fallback) return res.json(fallback);
      return res.status(404).json({ success: false, errors: { slug: "Blog post not found or is saved as draft." } });
    }

    res.json(post);
  } catch (error) {
    res.status(404).json({ success: false, errors: { slug: "Blog post not found." } });
  }
});

export default router;
