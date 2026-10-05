import { FormEvent, useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { Check, ChevronRight, Loader2, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { shopApi } from "@/lib/api";
import { formatCfa } from "@/lib/format";
import type { ShopProduct } from "@/types";

export default function ReservationModal({ product, open, onClose }: { product: ShopProduct; open: boolean; onClose: () => void }) {
  const submitReservation = useMutation(shopApi.submitReservation);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", whatsapp: "", email: "", city: "", preferredColor: product.colors[0] || "", quantity: 1, notes: "", consentContact: false, consentDeposit: false });
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  useEffect(() => { if (open) { setSuccess(null); setForm((current) => ({ ...current, preferredColor: product.colors[0] || "" })); } }, [open, product]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.consentContact || !form.consentDeposit) { toast.error("Veuillez valider les deux confirmations."); return; }
    setSending(true);
    try {
      if (import.meta.env.VITE_SHOP_DEMO === "true") {
        await new Promise((resolve) => setTimeout(resolve, 650));
        setSuccess(`CTS-SHOP-DEMO`);
        toast.success("Votre demande a bien été envoyée.");
      } else {
        const result = await submitReservation({ productId: product._id, productSlug: product.slug, quantity: Number(form.quantity), fullName: form.fullName, whatsapp: form.whatsapp, email: form.email || undefined, city: form.city, preferredColor: form.preferredColor || undefined, notes: form.notes || undefined, consentContact: form.consentContact, consentDeposit: form.consentDeposit, source: window.location.href });
        setSuccess(result.reference);
        toast.success(result.duplicate ? "Cette demande avait déjà été enregistrée." : "Votre demande a bien été envoyée.");
      }
    } catch (error: any) { toast.error(error?.message || "Impossible d'envoyer la demande."); }
    finally { setSending(false); }
  }

  return (
    <AnimatePresence>
      {open && <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-5">
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-label="Fermer" />
        <motion.div initial={{ opacity: 0, y: 60, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40 }} className="scroll-thin relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#121731] shadow-2xl sm:rounded-[28px]">
          <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/30 p-2 text-white/70 hover:text-white"><X size={18} /></button>
          {success ? (
            <div className="px-6 py-16 text-center sm:px-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"><Check size={38} /></div>
              <p className="mt-7 text-xs font-extrabold uppercase tracking-[.2em] text-cts-red">Demande enregistrée</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold">Votre place est en cours de vérification.</h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-cts-mist">L'équipe CTS analysera votre demande et vous contactera sur WhatsApp pour confirmer le modèle, l'acompte et les modalités. Aucun paiement n'a été effectué ici.</p>
              <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] uppercase tracking-[.16em] text-cts-mist">Référence</p><p className="mt-1 font-mono text-lg font-bold">{success}</p></div>
              <button onClick={onClose} className="mt-8 rounded-xl bg-cts-red px-7 py-3.5 text-sm font-extrabold shadow-glow">Continuer à explorer</button>
            </div>
          ) : (
            <>
              <div className="relative overflow-hidden border-b border-white/10 px-6 py-7 sm:px-8"><div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cts-red/15 blur-3xl" /><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-cts-red">Demande de réservation</p><h2 className="mt-2 pr-10 font-display text-2xl font-extrabold sm:text-3xl">{product.name}</h2><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-cts-mist"><span>Prix : <b className="text-white">{formatCfa(product.priceCfa)}</b></span><span>Acompte indicatif : <b className="text-white">{formatCfa(product.depositCfa)}</b></span></div></div>
              <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-white/80">Nom complet *<input className="field mt-2" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Votre nom et prénom" /></label><label className="text-xs font-bold text-white/80">WhatsApp *<input className="field mt-2" required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="Ex. +229 01 00 00 00 00" /></label><label className="text-xs font-bold text-white/80">Ville *<input className="field mt-2" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Cotonou, Porto-Novo…" /></label><label className="text-xs font-bold text-white/80">E-mail <input type="email" className="field mt-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Optionnel" /></label><label className="text-xs font-bold text-white/80">Couleur souhaitée<select className="field mt-2" value={form.preferredColor} onChange={(e) => setForm({ ...form, preferredColor: e.target.value })}>{product.colors.map((color) => <option key={color}>{color}</option>)}</select></label><label className="text-xs font-bold text-white/80">Quantité<select className="field mt-2" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}>{[1,2,3,4,5].map((q) => <option key={q} value={q}>{q}</option>)}</select></label></div>
                <label className="block text-xs font-bold text-white/80">Précision ou question<textarea className="field mt-2 min-h-24 resize-y" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Usage prévu, préférence, besoin de financement…" /></label>
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[.035] p-4">
                  <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-cts-mist"><input type="checkbox" checked={form.consentContact} onChange={(e) => setForm({ ...form, consentContact: e.target.checked })} className="mt-1 h-4 w-4 accent-[#e6002d]" /><span>J'accepte que l'équipe CTS me contacte par WhatsApp ou téléphone au sujet de cette demande.</span></label>
                  <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-cts-mist"><input type="checkbox" checked={form.consentDeposit} onChange={(e) => setForm({ ...form, consentDeposit: e.target.checked })} className="mt-1 h-4 w-4 accent-[#e6002d]" /><span>Je comprends que la réservation sera confirmée après échange avec l'équipe et paiement d'un acompte. Aucun paiement n'est demandé sur ce site.</span></label>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[.06] p-4 text-xs leading-5 text-emerald-100/80"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-400" />Vos informations sont utilisées uniquement pour traiter votre demande de groupage.</div>
                <button disabled={sending} className="shine flex w-full items-center justify-center gap-2 rounded-2xl bg-cts-red px-6 py-4 text-sm font-extrabold shadow-glow disabled:opacity-60">{sending ? <Loader2 className="animate-spin" size={18} /> : <>Envoyer ma demande <ChevronRight size={18} /></>}</button>
              </form>
            </>
          )}
        </motion.div>
      </div>}
    </AnimatePresence>
  );
}
