// Rodízio de vendedores no WhatsApp.
// A escolha do vendedor é feita no banco (função assign_whatsapp_lead): respeita quem está
// ativo, pausado, no almoço e a ordem da fila, e registra o atendimento. O administrador
// controla tudo pela aba "Vendedores WhatsApp" do painel.
//
// Se o banco demorar ou falhar, o cliente cai no número padrão: ele nunca fica sem atendimento.

export const DEFAULT_WHATSAPP = "5515996854945";
const TIMEOUT_MS = 2500;

const soDigitos = (v: unknown) => String(v ?? "").replace(/\D/g, "");

/** Pede ao banco o próximo vendedor da fila. Devolve só números, ou o número padrão. */
export async function proximoVendedor(source: string, message?: string): Promise<string> {
  try {
    const { supabase } = await import("./supabase");
    if (!supabase) return DEFAULT_WHATSAPP;
    const resposta = await Promise.race([
      supabase.rpc("assign_whatsapp_lead", { p_source: source, p_message: message ?? null }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS)),
    ]);
    if (!resposta || resposta.error) return DEFAULT_WHATSAPP;
    const linha = Array.isArray(resposta.data) ? resposta.data[0] : resposta.data;
    const fone = soDigitos(linha?.phone);
    return fone.length >= 10 && fone.length <= 15 ? fone : DEFAULT_WHATSAPP;
  } catch {
    return DEFAULT_WHATSAPP;
  }
}

/**
 * Abre o WhatsApp com o próximo vendedor da fila.
 * A janela é aberta na hora do clique (senão o navegador bloqueia como pop-up) e
 * redirecionada assim que o banco responde.
 */
export async function abrirWhatsApp(source: string, text?: string): Promise<void> {
  const janela = window.open("", "_blank");
  const fone = await proximoVendedor(source, text);
  const url = `https://wa.me/${fone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  if (janela) janela.location.href = url;
  else window.location.href = url;
}
