// Mensagem para quem tem sessão mas não tem a capacidade de editar conteúdo.
// Fica num arquivo próprio para o layout não misturar layout com tela de erro.
export function forbidden() {
  return (
    <main style={{ padding: "4rem 1.5rem", maxWidth: "36rem", margin: "0 auto" }}>
      <h1>Sem permissão</h1>
      <p>Sua conta não tem acesso à edição de conteúdo. Fale com um administrador.</p>
    </main>
  );
}
