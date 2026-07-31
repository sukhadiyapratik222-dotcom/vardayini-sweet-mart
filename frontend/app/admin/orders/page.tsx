import SectionPage from '../SectionPage';

export default function AdminOrdersPage() {
  return (
    <SectionPage
      eyebrow="Orders"
      title="Order management"
      description="Review placed orders, update fulfillment statuses, and keep delivery operations moving."
      metrics={[
        { label: 'Placed', value: '18', hint: 'Awaiting packing or allocation.' },
        { label: 'Packed', value: '9', hint: 'Ready for dispatch.' },
        { label: 'Shipped', value: '22', hint: 'On the way to customers.' },
        { label: 'Delivered today', value: '11', hint: 'Completed successfully.' },
      ]}
      actions={[
        { href: '/admin', title: 'Dashboard', description: 'Back to overview and alerts.' },
        { href: '/admin/products', title: 'Products', description: 'Check stock before packing orders.' },
        { href: '/admin/stores', title: 'Stores', description: 'Coordinate branch-level fulfillment.' },
        { href: '/admin/customers', title: 'Customers', description: 'Review order history and profiles.' },
        { href: '/admin/coupons', title: 'Coupons', description: 'Verify discount usage against orders.' },
        { href: '/admin/login', title: 'Admin login', description: 'Re-authenticate before order changes.' },
      ]}
      note="This section is ready as a live admin entry point and can be wired to backend order APIs next."
    />
  );
}
