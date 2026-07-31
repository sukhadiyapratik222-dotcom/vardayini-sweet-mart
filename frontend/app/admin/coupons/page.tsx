import SectionPage from '../SectionPage';

export default function AdminCouponsPage() {
  return (
    <SectionPage
      eyebrow="Coupons"
      title="Discount and promotion control"
      description="Create offers, manage campaign rules, and review active coupon codes from one place."
      metrics={[
        { label: 'Active codes', value: '6', hint: 'Currently usable coupons.' },
        { label: 'Flat offers', value: '3', hint: 'Fixed-value discounts.' },
        { label: 'Percent offers', value: '3', hint: 'Percentage-based promotions.' },
        { label: 'Expired this month', value: '1', hint: 'Campaigns that need cleanup.' },
      ]}
      actions={[
        { href: '/admin', title: 'Dashboard', description: 'Back to overview and alerts.' },
        { href: '/admin/products', title: 'Products', description: 'Attach coupons to catalog campaigns.' },
        { href: '/admin/orders', title: 'Orders', description: 'Check discount usage in orders.' },
        { href: '/admin/customers', title: 'Customers', description: 'Target segmented promotions.' },
        { href: '/admin/blog', title: 'Blog', description: 'Publish promotion announcements.' },
        { href: '/admin/settings', title: 'Settings', description: 'Tune discount defaults.' },
      ]}
      note="Coupons are wired as an admin entry point and can be connected to the backend coupon table next."
    />
  );
}
