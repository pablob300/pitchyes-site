import type { Metadata } from "next";
import { Suspense } from "react";
import { CodeForm } from "@/components/admin/auth/AuthForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Confirmar acesso", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense>
      <CodeForm />
    </Suspense>
  );
}
