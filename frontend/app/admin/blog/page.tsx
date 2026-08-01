"use client";

import { useState } from "react";
import { BookOpen, Plus, Trash2, CheckCircle2, Calendar, User, ArrowRight } from "lucide-react";
import AdminLayout from "../AdminLayout";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  image: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: "b-1",
      title: "The Golden Art of Making Authentic A2 Ghee Kaju Katli",
      slug: "art-of-making-kaju-katli",
      summary: "Discover our 48-year-old traditional recipe for preparing silky smooth, melt-in-the-mouth Kaju Katli using pure silver vark.",
      content: "For over four decades, Vardayini Sweet Mart has preserved the authentic heritage of traditional Indian sweet making...",
      author: "Vardayini Master Chef",
      date: "2026-07-28",
      image: "/images/sweet-1.jpg",
    },
    {
      id: "b-2",
      title: "Top 5 Health Benefits of Sugarless Anjeer & Dry Fruit Sweets",
      slug: "health-benefits-sugarless-anjeer-sweets",
      summary: "Explore how natural dates, figs, and premium nuts offer guilt-free festive indulgence without added artificial sugars.",
      content: "Health-conscious sweet lovers no longer have to compromise on taste during festive celebrations...",
      author: "Nutrition Desk",
      date: "2026-07-20",
      image: "/images/sweet-2.jpg",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const newPost: BlogPost = {
      id: `b-${Date.now()}`,
      title: title.trim(),
      slug,
      summary: summary.trim(),
      content: content.trim() || summary.trim(),
      author: "Vardayini Editor",
      date: new Date().toISOString().split("T")[0],
      image: "/images/sweet-3.jpg",
    };

    setPosts([newPost, ...posts]);
    setTitle("");
    setSummary("");
    setContent("");
    setShowAddModal(false);
    setFeedback(`✓ Blog article "${newPost.title}" successfully published!`);
    setTimeout(() => setFeedback(null), 3000);
  }

  function handleDelete(id: string) {
    setPosts(posts.filter((p) => p.id !== id));
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#162C5B] to-[#0A1836] p-6 rounded-3xl text-white border-2 border-gold/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider mb-2 border border-gold/30">
              <BookOpen size={14} />
              <span>Articles & Announcements</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Blog Post Manager</h1>
            <p className="text-xs text-gray-300 mt-1">Publish news, sweet recipes, health benefits, and festive announcements.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gold text-[#0B1B3D] hover:bg-gold-light px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 shadow border border-gold shrink-0"
          >
            <Plus size={16} />
            <span>Create New Article</span>
          </button>
        </div>

        {feedback && (
          <div className="p-4 bg-green-100 border border-green-300 text-green-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow">
            <CheckCircle2 size={18} className="text-green-700" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Blog Posts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-3xl border-2 border-gold/30 shadow-md p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-44 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gold/20">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                </div>

                <h3 className="font-extrabold text-base text-[#0B1B3D]">{post.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">{post.summary}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-400 font-semibold">/{post.slug}</span>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                  title="Delete Post"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Post Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleCreatePost} className="bg-white rounded-3xl border-2 border-gold/40 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-[#0B1B3D]">Create New Blog Post</h3>
                <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xs">✕ Cancel</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Article Title</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Secrets of Pure Desi Ghee Sweets"
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Short Summary</label>
                <textarea
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief 2-line summary for preview card..."
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Article Body</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write complete blog story..."
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold"
                  rows={4}
                />
              </div>

              <button type="submit" className="w-full bg-[#0B1B3D] text-gold py-3 rounded-xl font-black text-xs shadow hover:bg-[#162C5B] transition">
                Publish Blog Article
              </button>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
