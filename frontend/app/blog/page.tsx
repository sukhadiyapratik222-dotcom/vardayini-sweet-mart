export default function BlogPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-maroon">Blog</h1>
        <p className="mt-2 text-gray-600">Insights on gifting, Indian sweets, festival menus, and seasonal flavors.</p>
        <div className="mt-8 space-y-5">
          <article className="rounded-3xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-maroon">Top 5 Sweets for Diwali Gifting</h2>
            <p className="mt-3 text-gray-600">Explore premium boxes, sugar-free treats, and festive combos designed for every budget.</p>
          </article>
          <article className="rounded-3xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-maroon">How to Store Indian Namkeen</h2>
            <p className="mt-3 text-gray-600">Tips for keeping your crunchy namkeen fresh for weeks with airtight packaging and cool storage.</p>
          </article>
        </div>
      </div>
    </main>
  );
}
