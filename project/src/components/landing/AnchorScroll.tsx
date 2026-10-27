"use client";

import { useEffect } from "react";

// Âncoras da landing page (menu e botões para o formulário): rola até o alvo A CADA clique.
//
// Sem isto, depois do primeiro clique o endereço já termina em "#formulario" e o navegador
// (com o roteador do Next escutando a navegação) trata o próximo clique como "já estou aqui"
// e não rola de novo. Aqui o clique é interceptado, a página rola até o alvo (respeitando o
// scroll-margin do topo fixo e o scroll-behavior do CSS) e o endereço é atualizado sem
// gerar navegação. Não renderiza nada.
export function AnchorScroll() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      const hash = link?.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ block: "start" });
      if (window.location.hash !== hash) history.replaceState(history.state, "", hash);
      // Leva o foco junto (teclado e leitor de tela continuam de onde a página foi).
      target.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
