import SectionPage from '../SectionPage';

export default function AdminBlogPage() {
  return (
    <SectionPage
      eyebrow="Blog"
      title="Content and promotions"
      description="Manage articles, announcements, seasonal offers, and search-friendly content updates."
      metrics={[
        { label: 'Published posts', value: '12', hint: 'Live on the website.' },
        { label: 'Drafts', value: '4', hint: 'Ready for review.' },
        { label: 'Scheduled', value: '2', hint: 'Upcoming campaigns.' },
        { label: 'SEO updates', value: '5', hint: 'Recently optimized pages.' },
      ]}
      actions={[
        { href: '/admin', title: 'Dashboard', description: 'Back to overview and alerts.' },
        { href: '/admin/products', title: 'Products', description: 'Highlight featured products in posts.' },
        { href: '/admin/orders', title: 'Orders', description: 'Reference order milestones in updates.' },
        { href: '/admin/stores', title: 'Stores', description: 'Publish branch announcements.' },
        { href: '/admin/coupons', title: 'Coupons', description: 'Promote seasonal discount codes.' },
        { href: '/admin/settings', title: 'Settings', description: 'Manage content defaults.' },
      ]}
      note="This route gives you a real admin landing page for content work, with backend integration to follow."
    />
  );
}
