import SectionPage from '../SectionPage';

export default function AdminCustomersPage() {
  return (
    <SectionPage
      eyebrow="Customers"
      title="Customer management"
      description="See customer accounts, saved addresses, order activity, and loyalty opportunities."
      metrics={[
        { label: 'Customers', value: '138', hint: 'Known customer accounts.' },
        { label: 'Repeat buyers', value: '64', hint: 'Returning shoppers.' },
        { label: 'Saved addresses', value: '214', hint: 'Address book entries.' },
        { label: 'Wishlist items', value: '91', hint: 'Products customers want next.' },
      ]}
      actions={[
        { href: '/admin', title: 'Dashboard', description: 'Back to overview and alerts.' },
        { href: '/admin/orders', title: 'Orders', description: 'Review customer purchase history.' },
        { href: '/admin/products', title: 'Products', description: 'Match customers with best sellers.' },
        { href: '/admin/stores', title: 'Stores', description: 'Support local pickup and delivery.' },
        { href: '/admin/coupons', title: 'Coupons', description: 'Target promotions to customers.' },
        { href: '/admin/settings', title: 'Settings', description: 'Configure account defaults.' },
      ]}
      note="This screen is a ready admin access point and can later connect to customer APIs."
    />
  );
}
