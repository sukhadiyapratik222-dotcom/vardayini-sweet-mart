'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch(`${API_BASE}/blogs`);
        if (res.ok) {
          const data = await res.json();
          const postsList = Array.isArray(data) ? data : (data.posts || []);
          setBlogs(postsList);
        }
      } catch (err) {}
      setLoading(false);
    }
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between">
      <div>
        <Header />

        <section className="border-b border-gold/30 bg-[#0B1B3D] text-white px-4 py-10 sm:px-6 lg:px-8 shadow-inner">
          <div className="mx-auto max-w-7xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-gold bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
              Vardayini Stories & Recipes
            </span>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black text-gold">Mithai & Culinary Journal</h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-300">
              Insights on gifting, authentic Gujarati sweet recipes, festival menus, and traditional preparation techniques.
            </p>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12 font-bold text-gray-500">Loading live blog stories...</div>
          ) : blogs.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border-2 border-gold/30 text-center text-gray-500 font-semibold">
              No published stories yet. Check back soon for fresh recipes & sweet guides!
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((post) => (
                <article key={post.id || post.slug} className="bg-white rounded-3xl border-2 border-gold/30 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-gold-dark">
                      <span className="bg-gold/15 px-2.5 py-0.5 rounded-full border border-gold/30 uppercase">
                        {post.category || 'Special Recipe'}
                      </span>
                      <span className="text-gray-400 font-semibold">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Published'}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-[#0B1B3D] group-hover:text-gold-dark transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-3">
                      {post.content}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#0B1B3D]">By {post.author || 'Admin Team'}</span>
                    <span className="font-black text-gold-dark group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read Article →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
