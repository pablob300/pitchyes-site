"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";

// Entrega o relatório ao desenvolvedor: copia o Markdown ou baixa como .md.
export function CopyReport({ markdown, filename }: { markdown: string; filename: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      download();
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button type="button" className={buttonClass("solid")} onClick={copy}>
        {copied ? "Relatório copiado" : "Copiar relatório"}
      </button>
      <button type="button" className={buttonClass("ghost")} onClick={download}>
        Baixar .md
      </button>
    </>
  );
}
