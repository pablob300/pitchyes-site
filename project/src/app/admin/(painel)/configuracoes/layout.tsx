import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";

// Configurações: uma entrada só no menu lateral; as seções viram abas aqui dentro.
export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SettingsTabs />
      {children}
    </>
  );
}
