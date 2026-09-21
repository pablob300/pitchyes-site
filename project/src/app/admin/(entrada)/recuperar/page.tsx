import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotForm } from "@/components/admin/auth/AuthForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recuperar senha", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense>
      <ForgotForm />
    </Suspense>
  );
}
