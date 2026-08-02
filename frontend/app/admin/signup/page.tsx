"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminSignUpRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/login?mode=signup");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-amber-400 font-bold text-sm">
      Opening Admin Registration...
    </div>
  );
}
