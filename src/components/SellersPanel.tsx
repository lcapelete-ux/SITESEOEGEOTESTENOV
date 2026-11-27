import React, { useCallback, useEffect, useState } from "react";
import { Loader2, ArrowUp, ArrowDown } from "lucide-react";
import toast from "react-hot-toast";
import { supabase, formatSupabaseError } from "../supabase";

interface Agent {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  manual_paused: boolean;
  auto_pause_enabled: boolean;
  lunch_start: string | null;
  lunch_end: string | null;
  sort_order: number;
}
interface Settings { business_start: string; business_end: string }

const hhmm = (t: string | null) => (t ? t.slice(0, 5) : "");

export default function SellersPanel() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const [a, s, l] = await Promise.all([
      supabase.from("sales_agents").select("id,name,phone,active,manual_paused,auto_pause_enabled,lunch_start,lunch_end,sort_order").order("sort_order"),
      supabase.from("sales_distribution_settings").select("business_start,business_end").maybeSingle(),
      supabase.from("whatsapp_lead_assignments").select("agent_id").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()).limit(5000),
    ]);
    if (a.error) toast.error(formatSupabaseError(a.error)); else setAgents(a.data as Agent[]);
    if (s.data) setSettings(s.data as Settings);
    const c: Record<string, number> = {};
    (l.data || []).forEach((r: any) => { c[r.agent_id] = (c[r.agent_id] || 0) + 1; });
    setCounts(c);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (id: string, values: Partial<Agent>) => {
    if (!supabase) return;
    setSaving(id);
    const { error } = await supabase.from("sales_agents").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
    setSaving(null);
    if (error) { toast.error(formatSupabaseError(error)); return; }
    setAgents((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));
    toast.success("Salvo");
  };

  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (!supabase || j < 0 || j >= agents.length) return;
    const a = agents[i], b = agents[j];
    setSaving(a.id);
    const r1 = await supabase.from("sales_agents").update({ sort_order: b.sort_order }).eq("id", a.id);
    const r2 = await supabase.from("sales_agents").update({ sort_order: a.sort_order }).eq("id", b.id);
    setSaving(null);
    if (r1.error || r2.error) { toast.error(formatSupabaseError(r1.error || r2.error)); load(); return; }
    load();
  };

  const saveSettings = async (values: Partial<Settings>) => {
    if (!supabase || !settings) return;
    const next = { ...settings, ...values };
    setSettings(next);
    const { error } = await supabase.from("sales_distribution_settings").update({ ...values, updated_at: new Date().toISOString() }).eq("singleton", true);
    if (error) toast.error(formatSupabaseError(error)); else toast.success("Horário salvo");
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;

  const total = (Object.values(counts) as number[]).reduce((x, y) => x + y, 0);
  const input = "border border-stone-300 rounded-lg px-2 py-1 text-sm";

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <h2 className="text-xl font-bold text-stone-900 mb-1">Rodízio do WhatsApp</h2>
        <p className="text-stone-500 text-sm">
          Cada clique em "WhatsApp" do site (todas as páginas) vai para o próximo vendedor da fila, na ordem abaixo.
          Vendedor inativo, pausado ou no horário de almoço é pulado. Se nenhum estiver disponível, o cliente cai no número padrão (15) 99685-4945.
        </p>
        {settings && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium text-stone-700">Horário comercial (seg a sex):</span>
            <input type="time" className={input} value={hhmm(settings.business_start)} onChange={(e) => saveSettings({ business_start: e.target.value })} />
            <span>até</span>
            <input type="time" className={input} value={hhmm(settings.business_end)} onChange={(e) => saveSettings({ business_end: e.target.value })} />
            <span className="text-stone-500">(a pausa de almoço automática só vale dentro deste horário)</span>
          </div>
        )}
      </div>

      {agents.map((a, i) => (
        <div key={a.id} className={`bg-white p-6 rounded-2xl border shadow-sm ${a.active && !a.manual_paused ? "border-stone-200" : "border-stone-200 opacity-70"}`}>
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <button aria-label="Subir na fila" disabled={i === 0 || !!saving} onClick={() => move(i, -1)} className="p-1 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                <button aria-label="Descer na fila" disabled={i === agents.length - 1 || !!saving} onClick={() => move(i, 1)} className="p-1 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
              </div>
              <div>
                <p className="font-bold text-stone-900">{i + 1}. {a.name}</p>
                <p className="text-sm text-stone-500">{a.phone} · {counts[a.id] || 0} clientes em 30 dias{total ? ` (${Math.round(((counts[a.id] || 0) / total) * 100)}%)` : ""}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={a.active} onChange={(e) => patch(a.id, { active: e.target.checked })} /> Ativo no rodízio</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={a.manual_paused} onChange={(e) => patch(a.id, { manual_paused: e.target.checked })} /> Pausar agora</label>
              {saving === a.id && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={a.auto_pause_enabled} onChange={(e) => patch(a.id, { auto_pause_enabled: e.target.checked })} /> Pausar no almoço</label>
            <input type="time" aria-label="Início do almoço" className={input} value={hhmm(a.lunch_start)} onChange={(e) => patch(a.id, { lunch_start: e.target.value || null })} />
            <span>até</span>
            <input type="time" aria-label="Fim do almoço" className={input} value={hhmm(a.lunch_end)} onChange={(e) => patch(a.id, { lunch_end: e.target.value || null })} />
          </div>
        </div>
      ))}
      {!agents.length && <p className="text-stone-500">Nenhum vendedor encontrado (ou você não está logado como administrador).</p>}
    </div>
  );
}
