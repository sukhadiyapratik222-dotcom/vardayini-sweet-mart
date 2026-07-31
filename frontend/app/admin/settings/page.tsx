import SectionPage from '../SectionPage';

export default function AdminSettingsPage() {
  return (
    <SectionPage
      eyebrow="Settings"
      title="Store configuration"
      description="Adjust branding, defaults, delivery thresholds, and admin preferences for the site."
      metrics={[
        { label: 'Theme', value: 'Maroon', hint: 'Current brand palette.' },
        { label: 'Currency', value: 'INR', hint: 'Indian rupees across the store.' },
        { label: 'Delivery threshold', value: '₹1000', hint: 'Free delivery begins here.' },
        { label: 'Bulk discount', value: '5%', hint: 'Applied above ₹5000.' },
      ]}
      actions={[
        { href: '/admin', title: 'Dashboard', description: 'Back to overview and alerts.' },
        { href: '/admin/products', title: 'Products', description: 'Configure catalog defaults.' },
        { href: '/admin/orders', title: 'Orders', description: 'Adjust order workflow settings.' },
        { href: '/admin/stores', title: 'Stores', description: 'Update outlet defaults.' },
        { href: '/admin/coupons', title: 'Coupons', description: 'Set discount policy defaults.' },
        { href: '/admin/login', title: 'Admin login', description: 'Manage authentication access.' },
      ]}
      note="This page now acts as the access point for panel configuration and can be connected to persisted settings later."
    />
  );
}
