import { useState } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BatteryCharging,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Headphones,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { shopApi } from "@/lib/api";
import { defaultConfig, defaultProducts } from "@/lib/defaults";
import { formatCfa } from "@/lib/format";
import { cardRise, fadeLeft, fadeRight, fadeUp, listItem, viewportOnce } from "@/lib/motion";
import type { ShopConfig, ShopProduct } from "@/types";
import ShopHeader from "@/components/ShopHeader";
import ShopFooter from "@/components/ShopFooter";
import StoreUnavailable from "@/components/StoreUnavailable";
import ShopAppointmentModal from "@/components/ShopAppointmentModal";
import ReservationModal from "@/components/ReservationModal";
import { shopProductPath } from "@/lib/paths";

export default function Storefront() {
  const demo = import.meta.env.VITE_SHOP_DEMO === "true";
  const remote = useQuery(shopApi.getStorefront, demo ? "skip" : {}) as { config?: ShopConfig; products?: ShopProduct[] } | undefined;
  const config = (remote?.config ?? defaultConfig) as ShopConfig;
  const products = (remote?.products ?? defaultProducts) as ShopProduct[];
  const featured = [...products].filter((product) => product.featured).sort((a, b) => b.priceCfa - a.priceCfa)[0] ?? products[0] ?? defaultProducts[0];
  const [appointmentProduct, setAppointmentProduct] = useState<ShopProduct | null>(null);
  const [reservationProduct, setReservationProduct] = useState<ShopProduct | null>(null);
  const openAppointment = (product: ShopProduct = featured) => setAppointmentProduct(product);
  const openReservation = (product: ShopProduct = featured) => setReservationProduct(product);
  const lowestPrice = products.length ? Math.min(...products.map((product) => product.priceCfa)) : 0;

  if (!demo && remote && !config.enabled) return <StoreUnavailable config={config} />;

  return (
    <div className="public-shell min-h-screen overflow-hidden pt-[116px]">
      <ShopHeader announcement={config.announcement} />
      <main>
        <section className="shop-hero relative isolate overflow-hidden">
          <div className="shop-hero__image" aria-hidden="true" />
          <div className="shop-hero__shade" aria-hidden="true" />
          <div className="shop-hero__orb shop-hero__orb--red" aria-hidden="true" />
          <div className="shop-hero__orb shop-hero__orb--blue" aria-hidden="true" />
          <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:min-h-[690px] lg:grid-cols-[1.02fr_.98fr] lg:py-20">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.12 } } }} className="shop-hero__copy relative z-10 max-w-2xl text-white">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-white backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.9)]" /> Mobilité électrique · Bénin
              </motion.div>
              <motion.p variants={fadeUp} className="mt-7 text-xs font-bold uppercase tracking-[.24em] text-white/65">L’énergie du mouvement, l’expertise CTS</motion.p>
              <motion.h1 variants={fadeUp} className="mt-4 font-display text-[2.85rem] font-extrabold leading-[1.02] tracking-[-.05em] sm:text-6xl lg:text-[4.45rem]">
                Passez à l’électrique.<br /><span className="text-[#ff3456]">Allez plus loin.</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
                Découvrez une nouvelle façon de rouler : silencieuse, économique et pensée pour vos trajets au quotidien. CTS vous accompagne de la Chine jusqu’au Bénin.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#catalogue" className="shine inline-flex items-center justify-center gap-2 rounded-xl bg-cts-red px-6 py-4 text-sm font-extrabold text-white shadow-[0_15px_45px_rgba(230,0,45,.36)] transition hover:bg-[#c80027]">
                  Voir les motos et les prix <ArrowRight size={17} />
                </a>
                <button type="button" onClick={() => openAppointment()} className="shop-hero__secondary inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-4 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/20">
                  <CalendarClock size={17} /> Poser une question à CTS
                </button>
              </motion.div>
              <motion.div variants={fadeUp} className="shop-hero__proof mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-white/70">
                <HeroProof icon={BadgeCheck} label="Sélection CTS" />
                <HeroProof icon={ShieldCheck} label="Paiement sécurisé hors site" />
                <HeroProof icon={Headphones} label="Un conseiller à vos côtés" />
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 45, scale: .96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: .8, delay: .25 }} className="relative mx-auto w-full max-w-[570px] lg:ml-auto">
              <div className="absolute -inset-8 rounded-[48px] bg-[#e6002d]/20 blur-3xl" />
              <div className="shop-hero__bike relative overflow-hidden rounded-[32px] border border-white/20 bg-[#11182a] shadow-[0_35px_90px_rgba(0,0,0,.42)]">
                <img src={featured.imageUrl} alt={featured.name} className="h-[390px] w-full object-cover object-[center_58%] sm:h-[470px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d18]/90 via-transparent to-black/5" />
                <span className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/35 px-3 py-2 text-[9px] font-extrabold uppercase tracking-[.17em] text-white backdrop-blur-md">La sélection CTS</span>
                <div className="absolute inset-x-5 bottom-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/65">{featured.eyebrow}</p>
                  <p className="mt-1 font-display text-2xl font-extrabold">{featured.name}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <HeroStat icon={Zap} value="0 émission" label="À l’usage" />
                    <HeroStat icon={BatteryCharging} value={`Jusqu’à ${featured.rangeKm} km`} label="Autonomie" />
                    <HeroStat icon={CircleDollarSign} value="Économique" label="Au quotidien" />
                  </div>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .8 }} className="absolute -bottom-5 right-4 rounded-2xl border border-white/70 bg-white px-5 py-3 text-[#10152f] shadow-xl sm:-right-6 sm:px-6">
                <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#68718d]">Offres dès</p>
                <p className="mt-0.5 font-display text-xl font-extrabold">{formatCfa(lowestPrice)}</p>
              </motion.div>
            </motion.div>
          </div>
          <a href="#promesse" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/55 transition hover:text-white lg:flex">Défiler <ArrowDown size={14} /></a>
        </section>

        <section id="promesse" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={viewportOnce}>
              <p className="section-kicker">La mobilité selon CTS</p>
              <h2 className="mt-5 max-w-xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">La liberté de bouger.<br /><span className="text-cts-red">Sans compromis.</span></h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#5d6682] sm:text-base">Choisir une moto électrique, c’est choisir une conduite plus fluide et un budget mieux maîtrisé. Nous faisons le lien avec les fournisseurs et organisons votre groupage en toute clarté.</p>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                <a href="#processus" className="inline-flex items-center gap-2 text-sm font-extrabold text-cts-red transition hover:gap-3">Voir les étapes du groupage <ArrowRight size={16} /></a>
                <button type="button" onClick={() => openAppointment()} className="inline-flex items-center gap-2 text-sm font-extrabold text-[#34405e] transition hover:text-cts-red">Poser une question à un conseiller <CalendarClock size={15} /></button>
              </div>
            </motion.div>
            <div className="grid gap-3 sm:grid-cols-2">
              <BenefitCard icon={Zap} number="01" title="Une conduite fluide" text="Un moteur silencieux et réactif pour circuler en ville." />
              <BenefitCard icon={CircleDollarSign} number="02" title="Un budget maîtrisé" text="Moins de dépenses au quotidien, sans carburant." />
              <BenefitCard icon={BatteryCharging} number="03" title="L’autonomie qu’il vous faut" text="Des modèles choisis selon vos trajets et votre activité." />
              <BenefitCard icon={Headphones} number="04" title="Un vrai accompagnement" text="Un interlocuteur CTS avant, pendant et après le groupage." />
            </div>
          </div>
        </section>

        <section className="border-y border-[#10152f]/[.08] bg-white py-7">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 md:gap-3">
            <TrustMetric icon={ShieldCheck} title="Aucun paiement en ligne" text="Vous échangez avec CTS avant tout versement." />
            <TrustMetric icon={PackageCheck} title="Un groupage organisé" text="La commande est suivie par notre équipe." />
            <TrustMetric icon={MapPin} title="De la Chine au Bénin" text="Un accompagnement jusqu’à la livraison." />
          </div>
        </section>

        <section id="catalogue" className="scroll-mt-28 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce} className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="section-kicker">La gamme CTS Electric</p><h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Trouvez votre prochaine moto.</h2></div>
            <p className="max-w-lg text-sm leading-7 text-[#5d6682]">Ville, longues distances ou activité professionnelle : découvrez les modèles et choisissez celui qui vous ressemble.</p>
          </motion.div>
          {products.length ? (
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {products.map((product, index) => <ProductShowcase key={product.slug} product={product} index={index} onRequest={() => openReservation(product)} />)}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-[#10152f]/10 bg-white p-10 text-center shadow-sm"><h3 className="font-display text-xl font-bold">Notre prochaine sélection arrive bientôt.</h3><p className="mt-2 text-sm text-[#68718d]">Contactez notre équipe pour préparer votre projet.</p></div>
          )}
          <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 px-5 py-4 text-center sm:flex-row sm:text-left">
            <p className="text-xs leading-6 text-[#5d6682]">Les prix, coloris, équipements et délais sont confirmés par votre conseiller avant engagement.</p>
            <button onClick={() => openAppointment()} className="shine inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cts-red px-4 py-3 text-xs font-extrabold text-white shadow-glow hover:bg-[#c80027]">Poser une question à CTS <ArrowRight size={15} /></button>
          </div>
        </section>

        <section id="processus" className="shop-process scroll-mt-28 bg-[#10152f] py-16 text-white lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:py-4">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce} className="grid gap-5 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <div><p className="section-kicker">Comment ça marche</p><h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">Votre projet, en trois étapes.</h2></div>
              <p className="max-w-2xl text-sm leading-7 text-white/65 lg:justify-self-end">Pas de paiement sur la boutique : vous échangez d’abord avec CTS pour confirmer le modèle, le prix et le calendrier.</p>
            </motion.div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <ProcessCard number="01" icon={Check} title="Choisissez votre modèle" text="Parcourez la sélection et partagez-nous votre projet." />
              <ProcessCard number="02" icon={Headphones} title="Échangez avec CTS" text="Un conseiller confirme les détails et répond à vos questions." />
              <ProcessCard number="03" icon={Truck} title="Suivez votre groupage" text="Après accord, CTS organise l’expédition jusqu’au Bénin." />
            </div>
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/[.05] p-5 sm:flex-row">
              <p className="text-sm text-white/80">Une question sur le prix, l’acompte ou le délai ? Échangez avec CTS avant de vous engager.</p>
              <button type="button" onClick={() => openReservation()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cts-red px-5 py-3 text-xs font-extrabold text-white hover:bg-[#c80027]">Demander à rejoindre le groupage <ArrowRight size={15} /></button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid gap-8 overflow-hidden rounded-[30px] border border-[#10152f]/10 bg-white shadow-[0_24px_70px_rgba(16,21,47,.08)] lg:grid-cols-[.8fr_1.2fr]">
            <div className="relative isolate flex min-h-[280px] flex-col justify-between overflow-hidden bg-cts-red p-7 text-white sm:p-10">
              <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border-[35px] border-white/10" />
              <div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-white/70">Une relation transparente</p><h2 className="mt-4 max-w-sm font-display text-3xl font-extrabold leading-tight">Vous décidez en toute confiance.</h2></div>
              <p className="mt-8 text-xs font-bold text-white/80">Pas de paiement sur le site · Échange préalable avec CTS</p>
            </div>
            <div className="p-7 sm:p-10">
              <p className="section-kicker">Votre sérénité d’abord</p>
              <h3 className="mt-4 max-w-xl font-display text-2xl font-extrabold">Vous gardez la main à chaque étape.</h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5d6682]">{config.depositNotice}</p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2"><TrustLine icon={BadgeCheck} text="Prix et caractéristiques vérifiés" /><TrustLine icon={ShieldCheck} text="Aucun règlement sur le site" /><TrustLine icon={PackageCheck} text="Demande suivie par CTS" /><TrustLine icon={Headphones} text="Un conseiller vous répond" /></div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:pb-24">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce} className="shop-final-cta relative mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#10152f] px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14">
            <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-cts-red/25 blur-[90px]" />
            <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_auto]">
              <div><p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-[#ff627b]">Votre projet commence ici</p><h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold sm:text-4xl">Prêt à passer à la mobilité électrique ?</h2><p className="mt-3 max-w-xl text-sm leading-7 text-white/65">Parlez-nous de vos besoins. Notre équipe vous guide sans engagement.</p></div>
              <button type="button" onClick={() => openReservation()} className="shine inline-flex items-center justify-center gap-2 rounded-xl bg-cts-red px-6 py-4 text-sm font-extrabold text-white shadow-glow transition hover:bg-[#c80027]">Demander à rejoindre le groupage <ArrowRight size={17} /></button>
            </div>
          </motion.div>
        </section>
      </main>
      <ShopFooter phone={config.supportPhone} whatsapp={config.whatsapp} />
      <ShopAppointmentModal product={appointmentProduct ?? featured} open={Boolean(appointmentProduct)} onClose={() => setAppointmentProduct(null)} />
      <ReservationModal product={reservationProduct ?? featured} open={Boolean(reservationProduct)} onClose={() => setReservationProduct(null)} />
    </div>
  );
}

function HeroProof({ icon: Icon, label }: { icon: typeof BadgeCheck; label: string }) {
  return <span className="inline-flex items-center gap-2"><Icon size={15} className="text-[#ff627b]" />{label}</span>;
}

function HeroStat({ icon: Icon, value, label }: { icon: typeof Zap; value: string; label: string }) {
  return <div className="rounded-xl border border-white/15 bg-black/25 px-3 py-3 backdrop-blur-md"><Icon size={16} className="text-[#ff627b]" /><b className="mt-2 block text-[10px] sm:text-xs">{value}</b><span className="mt-1 block text-[8px] font-semibold uppercase tracking-wide text-white/55">{label}</span></div>;
}

function BenefitCard({ icon: Icon, number, title, text }: { icon: typeof Zap; number: string; title: string; text: string }) {
  return <motion.article variants={cardRise} initial="hidden" whileInView="visible" viewport={viewportOnce} className="group relative rounded-2xl border border-[#10152f]/[.08] bg-white p-5 shadow-[0_8px_30px_rgba(16,21,47,.04)] transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-[0_18px_45px_rgba(16,21,47,.09)]">
    <span className="absolute right-5 top-5 font-display text-xs font-bold tracking-widest text-[#aeb6c8]">{number}</span><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-cts-red"><Icon size={20} /></span><h3 className="mt-5 font-display text-base font-extrabold text-[#10152f]">{title}</h3><p className="mt-2 text-xs leading-6 text-[#68718d]">{text}</p>
  </motion.article>;
}

function TrustMetric({ icon: Icon, title, text }: { icon: typeof Zap; title: string; text: string }) {
  return <div className="flex items-center justify-center gap-4 md:justify-start md:px-7 md:first:pl-0 md:not(:last-child):border-r md:not(:last-child):border-[#10152f]/10"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-cts-red"><Icon size={19} /></span><div><p className="text-xs font-extrabold text-[#10152f]">{title}</p><p className="mt-1 text-[10px] text-[#68718d]">{text}</p></div></div>;
}

function ProductShowcase({ product, index, onRequest }: { product: ShopProduct; index: number; onRequest: () => void }) {
  const availability = product.availability === "limited" ? "Places limitées" : product.availability === "closed" ? "Bientôt disponible" : "Disponible en groupage";
  return <motion.article variants={cardRise} initial="hidden" whileInView="visible" viewport={viewportOnce} transition={{ delay: index * .08 }} className="group overflow-hidden rounded-[24px] border border-[#10152f]/10 bg-white shadow-[0_12px_38px_rgba(16,21,47,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(16,21,47,.13)]">
    <a href={shopProductPath(product.slug)} className="block">
      <div className="product-media relative h-64 overflow-hidden bg-[#eef1f6] sm:h-[285px]">
        <img src={product.imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10152f]/75 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#10152f]">{availability}</span>
        <div className="absolute inset-x-5 bottom-4 flex items-end justify-between text-white"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/70">{product.eyebrow}</p><p className="mt-1 font-display text-xl font-extrabold">{product.name}</p></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-cts-red text-white shadow-lg transition group-hover:translate-x-1"><ArrowUpRight size={18} /></span></div>
      </div>
    </a>
    <div className="p-5 sm:p-6">
      <p className="min-h-[48px] text-xs leading-6 text-[#68718d]">{product.shortDescription}</p>
      <div className="mt-5 grid grid-cols-3 divide-x divide-[#10152f]/10 border-y border-[#10152f]/[.08] py-4">
        <ProductStat icon={BatteryCharging} value={`${product.rangeKm} km`} label="Autonomie" />
        <ProductStat icon={Zap} value={`${product.maxSpeedKmh} km/h`} label="Vitesse max" />
        <ProductStat icon={Clock3} value={`${product.chargeHours} h`} label="Recharge" />
      </div>
      <div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#78819b]">Prix groupage</p><p className="mt-1 font-display text-xl font-extrabold text-[#10152f]">{formatCfa(product.priceCfa)}</p><p className="mt-1 text-[10px] font-semibold text-[#68718d]">Acompte dès {formatCfa(product.depositCfa)}</p></div><a href={shopProductPath(product.slug)} className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-cts-red">Détails <ChevronRight size={14} /></a></div>
      <button type="button" onClick={onRequest} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cts-red px-4 py-3.5 text-xs font-extrabold text-white shadow-glow transition hover:bg-[#c80027]">Demander à rejoindre le groupage <ArrowRight size={15} /></button>
      <p className="mt-2 text-center text-[10px] text-[#68718d]">Gratuit, sans paiement en ligne et sans engagement.</p>
    </div>
  </motion.article>;
}

function ProductStat({ icon: Icon, value, label }: { icon: typeof Zap; value: string; label: string }) {
  return <div className="px-2 text-center first:pl-0 last:pr-0"><Icon size={16} className="mx-auto text-cts-red" /><b className="mt-2 block text-xs font-extrabold text-[#10152f]">{value}</b><span className="mt-1 block text-[8px] font-bold uppercase tracking-wide text-[#7a8298]">{label}</span></div>;
}

function ProcessCard({ number, icon: Icon, title, text }: { number: string; icon: typeof Zap; title: string; text: string }) {
  return <motion.article variants={listItem} className="relative rounded-2xl border border-white/10 bg-white/[.045] p-6 transition hover:border-rose-300/40 hover:bg-white/[.075]"><span className="absolute right-5 top-4 font-display text-4xl font-extrabold text-white/[.07]">{number}</span><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cts-red/15 text-[#ff627b]"><Icon size={20} /></span><h3 className="mt-5 font-display text-base font-extrabold">{title}</h3><p className="mt-2 max-w-xs text-xs leading-6 text-white/60">{text}</p></motion.article>;
}

function TrustLine({ icon: Icon, text }: { icon: typeof Zap; text: string }) {
  return <p className="flex items-center gap-3 text-xs font-bold text-[#34405e]"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Icon size={15} /></span>{text}</p>;
}
