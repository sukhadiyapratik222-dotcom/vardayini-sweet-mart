export default function CartPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-maroon">Your Cart</h1>
        <p className="mt-2 text-gray-600">Edit quantities, apply coupon codes, and checkout securely.</p>
        <div className="mt-8 space-y-4">
          <div className="rounded-3xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-maroon">Kaju Katli 500g</h2>
                <p className="text-sm text-gray-600">₹850</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-full border px-3 py-1 text-gray-600">-</button>
                <span className="min-w-[2rem] text-center font-semibold">1</span>
                <button className="rounded-full border px-3 py-1 text-gray-600">+</button>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="font-semibold text-maroon">₹850</p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full w-60 rounded-full bg-gold" />
            </div>
            <p className="mt-3 text-sm text-gray-600">Spend ₹1,150 more to get free delivery.</p>
          </div>
          <button className="w-full rounded-3xl bg-maroon px-5 py-3 text-sm font-semibold text-cream">Proceed to Checkout</button>
        </div>
      </div>
    </main>
  );
}
