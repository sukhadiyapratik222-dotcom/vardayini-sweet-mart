'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AdminLayout from './AdminLayout';

export type AdminAction = {
  href: string;
  title: string;
  description: string;
};

export type AdminMetric = {
  label: string;
  value: string;
  hint: string;
};

export default function SectionPage({
  eyebrow,
  title,
  description,
  actions,
  metrics,
  note,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions: AdminAction[];
  metrics?: AdminMetric[];
  note?: string;
}) {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-[2rem] bg-gradient-to-br from-maroon via-[#8b2e2e] to-[#5a1717] p-8 text-cream shadow-[0_20px_60px_rgba(92,23,23,0.25)]">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/90">{eyebrow}</p>
          <h2 className="mt-3 text-4xl font-semibold">{title}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-cream/80">{description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-maroon transition hover:opacity-90">
              Back to dashboard <ArrowRight size={16} />
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-5 py-3 text-sm font-semibold text-cream transition hover:bg-cream/10">
              View storefront
            </Link>
          </div>
        </section>

        {metrics?.length ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
                <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold text-maroon">{metric.value}</p>
                <p className="mt-4 text-sm text-gray-500">{metric.hint}</p>
              </div>
            ))}
          </section>
        ) : null}

        <section className="rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
          <h3 className="text-2xl font-semibold text-maroon">Admin links</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {actions.map((action) => (
              <Link key={action.href} href={action.href} className="rounded-3xl border border-gray-200 bg-[#fcfaf6] p-4 transition hover:-translate-y-0.5 hover:border-maroon hover:shadow-sm">
                <p className="font-semibold text-gray-900">{action.title}</p>
                <p className="mt-1 text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
          {note ? <p className="mt-5 text-sm text-gray-600">{note}</p> : null}
        </section>
      </div>
    </AdminLayout>
  );
}
