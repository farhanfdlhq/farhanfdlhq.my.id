import "@/app/admin.css";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { FeedbackProvider } from "@/components/admin/Feedback";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="admin"><FeedbackProvider>{children}</FeedbackProvider></div>;
}
