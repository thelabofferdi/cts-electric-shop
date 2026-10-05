import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, BatteryCharging, Check, ChevronLeft, ChevronRight, Clock3, Gauge, PackageCheck, Route, ShieldCheck, Zap } from "lucide-react";
import { shopApi } from "@/lib/api";
import { defaultConfig, defaultProducts } from "@/lib/defaults";
import { formatCfa } from "@/lib/format";
import { cardHover, cardRise, fadeLeft, fadeRight, fastStaggerContainer, listItem, viewportCards, viewportOnce } from "@/lib/motion";
import type { ShopConfig, ShopProduct } from "@/types";
import ShopHeader from "@/components/ShopHeader";
import ShopFooter from "@/components/ShopFooter";
import StoreUnavailable from "@/components/StoreUnavailable";
import ReservationModal from "@/components/ReservationModal";
import { shopAnchor, shopHomePath } from "@/lib/paths";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const demo = import.meta.env.VITE_SHOP_DEMO === "true";
  const remote = useQuery(shopApi.getProductBySlug, demo ? "skip" : { slug }) as ShopProduct | null | undefined;
  const storefront = useQuery(shopApi.getStorefront, demo ? "skip" : {}) as { config?: ShopConfig } | undefined;
  const config = (storefront?.config ?? defaultConfig) as ShopConfig;
  const product = (demo ? defaultProducts.find((item) => item.slug === slug) : remote) as ShopProduct | null | undefined;
  const [reservationOpen, setReservationOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!demo && (remote === undefined || storefront === undefined)) return <div className="public-shell flex min-h-screen items-center justify-center text-sm text-cts-mist">Chargement de la boutique…</div>;
  if (!demo && !config.enabled) return <StoreUnavailable config={config} />;
  if (!product) return <div className="public-shell min-h-screen pt-40 text-center"><ShopHeader announcement={config.announcement} /><h1 className="font-display text-3xl font-bold">Moto introuvable</h1><Link to={shopHomePath} className="mt-6 inline-block rounded-xl bg-cts-red px-6 py-3 text-sm font-bold">Retour au catalogue</Link></div>;

  const status = product.availability === "limited" ? "Dernières places disponibles" : product.availability === "closed" ? "Groupage fermé" : "Demandes ouvertes";
  const images = [...new Set([product.imageUrl, ...(product.galleryUrls ?? [])].filter(Boolean))];
  const currentImageIndex = activeImageIndex % images.length;

  return (
    <div className="public-shell min-h-screen pt-[116px]">
      <ShopHeader announcement={config.announcement} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .45 }}>
          <Link to={shopAnchor("catalogue")} className="inline-flex items-center gap-2 text-xs font-bold text-cts-mist transition hover:text-white"><ArrowLeft size={15} /> Retour au catalogue</Link>
        </motion.div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.06fr_.94fr]">
          <motion.div variants={fadeLeft} initial="hidden" animate="visible" className="relative min-h-[440px] overflow-hidden rounded-[30px] border border-white/10 bg-[#151a38] shadow-card sm:min-h-[620px]">
            <img src={images[currentImageIndex]} alt={product.name} className="absolute inset-0 h-full w-full object-contain p-8 sm:p-12" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090d22]/85 via-transparent to-black/5" />
            {images.length > 1 && <>
              <button type="button" onClick={() => setActiveImageIndex((index) => (index - 1 + images.length) % images.length)} aria-label="Image précédente" className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 text-slate-900 shadow-lg transition hover:bg-slate-100">
                <ChevronLeft size={22} />
              </button>
              <button type="button" onClick={() => setActiveImageIndex((index) => (index + 1) % images.length)} aria-label="Image suivante" className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 text-slate-900 shadow-lg transition hover:bg-slate-100">
                <ChevronRight size={22} />
              </button>
            </>}
            <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-[9px] font-extrabold uppercase tracking-[.12em] backdrop-blur-md">{status}</div>
            <div className="glass absolute bottom-5 left-5 right-5 rounded-2xl p-4"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-cts-mist">Départ prévu</p><p className="mt-1 font-display font-bold">{product.groupLabel}</p><p className="mt-2 text-[9px] leading-5 text-cts-mist">Visuel indicatif. Le modèle exact est confirmé avant acompte.</p></div>
          </motion.div>

          <motion.div variants={fadeRight} initial="hidden" animate="visible" className="lg:sticky lg:top-36 lg:self-start lg:py-2">
            <motion.p initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .15 }} className="text-xs font-extrabold uppercase tracking-[.18em] text-cts-red">{product.eyebrow}</motion.p>
            <motion.h1 initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .24, duration: .55 }} className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{product.name}</motion.h1>
            <motion.p initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .34, duration: .5 }} className="mt-5 text-sm leading-7 text-cts-mist">{product.description}</motion.p>

            <motion.div variants={fastStaggerContainer} initial="hidden" animate="visible" className="mt-6 grid grid-cols-2 gap-3">
              <ProductSpec icon={Route} value={`${product.rangeKm} km`} label="Autonomie" />
              <ProductSpec icon={Gauge} value={`${product.maxSpeedKmh} km/h`} label="Vitesse max" />
              <ProductSpec icon={Zap} value={`${product.motorPowerW / 1000} kW`} label="Puissance" />
              <ProductSpec icon={Clock3} value={`${product.chargeHours} heures`} label="Recharge" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .54, duration: .5 }} whileHover={{ y: -4 }} className="mt-6 rounded-[22px] border border-white/10 bg-[#151a38] p-5">
              <p className="text-xs text-cts-mist">Prix groupage</p>
              {product.compareAtPriceCfa && <p className="mt-1 text-sm text-cts-mist line-through">{formatCfa(product.compareAtPriceCfa)}</p>}
              <p className="font-display text-3xl font-extrabold">{formatCfa(product.priceCfa)}</p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4"><span className="text-xs text-cts-mist">Acompte indicatif</span><b>{formatCfa(product.depositCfa)}</b></div>
            </motion.div>

            <motion.button initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .64, duration: .45 }} whileHover={product.availability === "closed" ? undefined : { scale: 1.02 }} whileTap={product.availability === "closed" ? undefined : { scale: .98 }} disabled={product.availability === "closed"} onClick={() => setReservationOpen(true)} className="shine mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cts-red px-6 py-4 text-sm font-extrabold shadow-glow disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none text-white">{product.availability === "closed" ? "Groupage actuellement fermé" : <>Demander à rejoindre ce groupage <PackageCheck size={17} /></>}</motion.button>
            <p className="mt-3 text-center text-[10px] leading-5 text-cts-mist">Envoyez votre demande de réservation. Aucun paiement en ligne : CTS confirme les détails avec vous avant tout acompte.</p>
          </motion.div>
        </div>

        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          <motion.div variants={cardRise} initial="hidden" whileInView="visible" viewport={viewportOnce} whileHover={cardHover} style={{ transformPerspective: 1000 }} className="rounded-[26px] border border-white/10 bg-[#151a38] p-6 sm:p-7"><p className="section-kicker">Équipement inclus</p><h2 className="mt-4 font-display text-2xl font-extrabold">Une configuration pensée pour votre usage.</h2><motion.div variants={fastStaggerContainer} initial="hidden" whileInView="visible" viewport={viewportCards} className="mt-6 grid gap-3 sm:grid-cols-2">{product.features.map((feature) => <motion.p key={feature} variants={listItem} whileHover={{ x: 6 }} className="flex items-center gap-3 text-sm text-cts-mist"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400"><Check size={14} /></span>{feature}</motion.p>)}</motion.div></motion.div>
          <motion.div variants={cardRise} initial="hidden" whileInView="visible" viewport={viewportOnce} whileHover={cardHover} style={{ transformPerspective: 1000 }} className="rounded-[26px] border border-white/10 bg-[#151a38] p-6 sm:p-7"><p className="section-kicker">Batterie & livraison</p><h2 className="mt-4 font-display text-2xl font-extrabold">Les points confirmés avec CTS.</h2><motion.div variants={fastStaggerContainer} initial="hidden" whileInView="visible" viewport={viewportCards} className="mt-5 divide-y divide-white/10"><DetailRow icon={BatteryCharging} title={product.batteryLabel} text="Capacité et configuration finale revérifiées avec vous." /><DetailRow icon={PackageCheck} title={product.deliveryEstimate} text="Le délai dépend de la clôture du groupage et du transport." /><DetailRow icon={ShieldCheck} title="Accompagnement CTS" text="Commande, groupage, transit et suivi client." /></motion.div></motion.div>
        </section>

        <section className="mt-8 rounded-[26px] border border-rose-100 bg-rose-50/80 p-6 text-center sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-cts-red">Un dernier renseignement avant de décider ?</p>
          <h2 className="mt-3 font-display text-2xl font-extrabold text-[#10152f]">Faites confirmer le prix et la disponibilité de {product.name}.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5d6682]">Envoyez une demande pour rejoindre le groupage de cette moto. CTS confirmera le prix, la disponibilité et les modalités avant tout acompte.</p>
          <button type="button" onClick={() => setReservationOpen(true)} disabled={product.availability === "closed"} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-cts-red px-6 py-4 text-sm font-extrabold text-white shadow-glow transition hover:bg-[#c80027] disabled:cursor-not-allowed disabled:opacity-50">{product.availability === "closed" ? "Demandes actuellement fermées" : <>Envoyer ma demande de groupage <PackageCheck size={17} /></>}</button>
        </section>
      </main>
      <ShopFooter phone={config.supportPhone} whatsapp={config.whatsapp} />
      <ReservationModal product={product} open={reservationOpen} onClose={() => setReservationOpen(false)} />
    </div>
  );
}

function ProductSpec({ icon: Icon, value, label }: { icon: any; value: string; label: string }) { return <motion.div variants={listItem} whileHover={{ y: -4 }} className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><Icon className="text-cts-red" size={17} /><b className="mt-3 block font-display text-base">{value}</b><span className="text-[9px] uppercase tracking-wide text-cts-mist">{label}</span></motion.div>; }
function DetailRow({ icon: Icon, title, text }: { icon: any; title: string; text: string }) { return <motion.div variants={listItem} whileHover={{ x: 7 }} className="flex gap-3 py-4"><motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: .5 }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cts-red/10 text-cts-red"><Icon size={18} /></motion.div><div><b className="text-sm text-white">{title}</b><p className="mt-1 text-xs leading-5 text-cts-mist">{text}</p></div></motion.div>; }
