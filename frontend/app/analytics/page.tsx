import type { Metadata } from "next";
import AnalyticsDashboard from "./AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics Dashboard — Vardayini Sweet Mart",
  description: "E-commerce analytics: sales, orders, customers, and repeat customer insights",
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
