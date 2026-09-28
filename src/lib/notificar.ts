/**
 * Aviso por e-mail para a equipe quando chega sugestão ou mensagem nova.
 *
 * Continua saindo do navegador, via EmailJS, como no site atual — trocar por
 * um envio de servidor depende de decisão sobre a conta de e-mail e está
 * anotado como próximo passo. Fica isolado aqui justamente para essa troca
 * mexer em um arquivo só.
 *
 * A chave pública do EmailJS é visível no código do site hoje. Enquanto for
 * assim, vale ativar a trava de domínio na conta (só teiasp.com.br pode
 * enviar), senão qualquer um pode usar a cota com a identidade do projeto.
 */

const SERVICO = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "service_kbyp4ct";
const MODELO = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "template_lqltjmo";
const CHAVE_PUBLICA = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "x0Hj6B9M7634Wid8O";
const DESTINATARIOS =
  process.env.NEXT_PUBLIC_EMAILS_EQUIPE ??
  "helenavaz.psi@gmail.com,barbara.albertini.psi@gmail.com";

export async function avisarEquipe(assunto: string, resumo: string): Promise<void> {
  const agora = new Date();
  const quando = `${agora.toLocaleDateString("pt-BR")} ${agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: SERVICO,
        template_id: MODELO,
        user_id: CHAVE_PUBLICA,
        template_params: {
          to_email: DESTINATARIOS,
          name: "Site Teia SP",
          time: quando,
          message: `${assunto} — ${resumo}. Acesse a Área restrita em https://teiasp.com.br/admin para revisar.`,
        },
      }),
    });
  } catch {
    /**
     * O aviso é acessório: a sugestão já está gravada e aparece no painel de
     * qualquer forma. Falhar aqui não pode derrubar o envio de quem
     * contribuiu.
     */
  }
}
