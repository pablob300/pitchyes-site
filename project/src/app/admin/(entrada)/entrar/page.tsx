import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/auth/AuthForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Entrar", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
