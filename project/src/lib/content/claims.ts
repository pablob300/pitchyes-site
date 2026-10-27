// Afirmações ainda sem comprovação (SEO.md §1.5). As certificações da seção de segurança da
// home vieram do wireframe e esperam o jurídico (TODO em components/home/content.ts): o site
// ainda as mostra, mas os arquivos feitos para IA citar (/llms.txt, /llms-full.txt) não
// repetem nenhum trecho que as mencione. Comprovadas, basta esvaziar a lista.
const UNVERIFIED = /\b(SOC ?2|HIPAA|PCI[ -]?DSS|FedRAMP)\b/i;

export function citesUnverifiedClaim(text: string): boolean {
  return UNVERIFIED.test(text);
}
