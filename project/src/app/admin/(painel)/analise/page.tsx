import { redirect } from "next/navigation";

// "Análise" é só o rótulo do submenu; a primeira tela dele é o PageSpeed.
export default function Page() {
  redirect("/admin/analise/pagespeed");
}
