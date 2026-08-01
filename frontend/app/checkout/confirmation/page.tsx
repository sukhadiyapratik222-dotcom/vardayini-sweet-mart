import { Suspense } from 'react';
import ConfirmationContent from './ConfirmationContent';

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#0B1B3D] font-black text-sm">Loading your order...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
