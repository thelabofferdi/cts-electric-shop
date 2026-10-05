import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { CalendarClock, Clock3, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { shopApi } from "@/lib/api";
import type { ShopProduct } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
  product?: ShopProduct | null;
};

const defaultAppointmentTypes = [
  ["showroom", "Visite du showroom"],
  ["demonstration", "Démonstration d’une moto"],
  ["consultation", "Échange sur mon projet"],
  ["whatsapp", "Appel WhatsApp planifié"],
] as const;

export default function ShopAppointmentModal({ open, onClose, product }: Props) {
  const config = useQuery(shopApi.getShopAppointmentConfig, open ? {} : "skip");
  const create = useMutation(shopApi.createShopAppointment);
  const typeOptions = config?.appointmentTypes?.filter((item) => item.enabled) ?? defaultAppointmentTypes.map(([key, label]) => ({ key, label, enabled: true }));
  const appointmentDays = config?.businessHours
    ? config.businessHours.filter((item) => item.enabled).map((item) => item.label)
    : ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  const [form, setForm] = useState({ visitorName: "", phone: "", email: "", city: "", appointmentType: "demonstration", date: "", time: "", reason: "" });
  const slots = useQuery(shopApi.getShopAppointmentSlots, open && form.date ? { date: form.date } : "skip") as string[] | undefined;
  const [saving, setSaving] = useState(false);

  const minDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }, []);

  if (!open) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.date || !form.time) {
      toast.error("Choisissez une date et un créneau.");
      return;
    }
    setSaving(true);
    try {
      await create({
        productId: product?._id as any,
        productName: product?.name,
        productSlug: product?.slug,
        visitorName: form.visitorName,
        phone: form.phone,
        email: form.email || undefined,
        city: form.city,
        appointmentType: form.appointmentType,
        requestedAt: `${form.date}T${form.time}`,
        reason: form.reason || (product ? `Présentation de ${product.name}` : "Demande de rendez-vous boutique"),
      });
      toast.success("Votre demande de rendez-vous a été reçue.");
      setForm({ visitorName: "", phone: "", email: "", city: "", appointmentType: typeOptions[0]?.key || "demonstration", date: "", time: "", reason: "" });
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Impossible d’envoyer la demande.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <button className="absolute inset-0" onClick={onClose} aria-label="Fermer" />
      <form onSubmit={submit} className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#121731] p-6 text-white shadow-2xl sm:rounded-[28px] sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 text-cts-mist hover:text-white" aria-label="Fermer"><X /></button>
        <div className="flex items-start gap-3 pr-8">
          <CalendarClock className="mt-1 text-cts-red" size={24} />
          <div>
            <h2 className="font-display text-2xl font-extrabold">Prendre rendez-vous</h2>
            <p className="mt-1 text-sm text-cts-mist">{product ? `Présentation de ${product.name}` : "Échangez avec l’équipe CTS Electric."}</p>
          </div>
        </div>
        {config && !config.enabled ? <p className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">Les rendez-vous sont temporairement indisponibles.</p> : (
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold">Nom complet *<input required className="field mt-2" value={form.visitorName} onChange={(e) => setForm({ ...form, visitorName: e.target.value })} /></label>
              <label className="text-xs font-bold">WhatsApp / téléphone *<input required className="field mt-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <label className="text-xs font-bold">Ville *<input required className="field mt-2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Cotonou, Calavi…" /></label>
              <label className="text-xs font-bold">E-mail <input type="email" className="field mt-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            </div>
            <label className="block text-xs font-bold">Type de rendez-vous<select required className="field mt-2" value={form.appointmentType} onChange={(e) => setForm({ ...form, appointmentType: e.target.value })}>{typeOptions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold">Date *<input required type="date" min={minDate} className="field mt-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value, time: "" })} /></label>
              <label className="text-xs font-bold">Créneau *<select required className="field mt-2" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} disabled={!form.date || slots === undefined}><option value="">{!form.date ? "Choisissez d’abord une date" : slots === undefined ? "Chargement…" : slots.length ? "Choisir un créneau" : "Aucun créneau disponible"}</option>{slots?.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label>
            </div>
            <p className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-xs leading-5 text-cts-mist">
              <Clock3 size={15} className="mt-0.5 shrink-0 text-cts-red" />
              <span>
                Jours disponibles : {appointmentDays.length ? appointmentDays.join(", ").toLowerCase() : "aucun jour actuellement"}.
                {form.date && slots?.length === 0 ? " Aucun créneau n’est disponible à cette date : choisissez un jour ouvré ou une autre date." : " Les créneaux dépendent des horaires d’ouverture et des disponibilités."}
              </span>
            </p>
            <label className="block text-xs font-bold">Précision <textarea className="field mt-2 min-h-20" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Votre besoin ou votre question…" /></label>
            <button disabled={saving || !config} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cts-red px-5 py-4 text-sm font-extrabold shadow-glow disabled:opacity-60">{saving ? <Loader2 className="animate-spin" size={18} /> : "Envoyer ma demande"}</button>
          </div>
        )}
      </form>
    </div>
  );
}
