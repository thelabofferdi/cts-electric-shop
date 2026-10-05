import { motion } from "framer-motion";
import { ArrowRight, BatteryCharging, Gauge, Route } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCfa } from "@/lib/format";
import { cardHover, cardRise, viewportCards } from "@/lib/motion";
import type { ShopProduct } from "@/types";
import { shopProductPath } from "@/lib/paths";

export default function ProductCard({ product, index = 0 }: { product: ShopProduct; index?: number }) {
  const availability = product.availability === "limited" ? "Dernières places" : product.availability === "closed" ? "Groupage fermé" : "Demandes ouvertes";

  return (
    <motion.article
      variants={cardRise}
      initial="hidden"
      whileInView="visible"
      viewport={viewportCards}
      transition={{ delay: index * 0.08, duration: 0.55, ease: "easeOut" }}
      whileHover={cardHover}
      style={{ transformPerspective: 1000 }}
      className="product-card group overflow-hidden rounded-[24px] border border-white/10 bg-[#151a38] shadow-card transition-colors hover:border-cts-red/35"
    >
      <Link to={shopProductPath(product.slug)} className="block">
        <div className="product-media img-zoom relative h-60 overflow-hidden bg-[#11162f] sm:h-64">
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d22]/90 via-transparent to-black/10" />
          <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[.11em] backdrop-blur-md">{availability}</div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
            <div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/55">Visuel indicatif</p><p className="mt-1 text-xs font-bold">{product.groupLabel}</p></div>
            {product.remainingUnits !== undefined && product.availability !== "closed" && <span className="rounded-lg border border-white/20 bg-black/35 px-2.5 py-1.5 text-[10px] font-bold backdrop-blur-md">{product.remainingUnits} places</span>}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-cts-red">{product.eyebrow}</p>
          <div className="mt-2 flex items-start justify-between gap-3"><h3 className="font-display text-xl font-extrabold sm:text-2xl">{product.name}</h3><motion.span whileHover={{ scale: 1.15 }} whileTap={{ scale: .94 }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cts-red text-white shadow-glow"><ArrowRight size={16} /></motion.span></div>
          <p className="mt-3 min-h-[44px] text-sm leading-6 text-cts-mist">{product.shortDescription}</p>

          <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/10 py-4">
            <Spec icon={Route} value={`${product.rangeKm} km`} label="Autonomie" />
            <Spec icon={Gauge} value={`${product.maxSpeedKmh} km/h`} label="Vitesse" />
            <Spec icon={BatteryCharging} value={`${product.chargeHours} h`} label="Recharge" />
          </div>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div>{product.compareAtPriceCfa && <p className="text-xs text-cts-mist line-through">{formatCfa(product.compareAtPriceCfa)}</p>}<p className="font-display text-xl font-extrabold">{formatCfa(product.priceCfa)}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-cts-mist">Acompte dès {formatCfa(product.depositCfa)}</p></div>
            <span className="text-[10px] font-extrabold uppercase tracking-[.1em] text-cts-red">Voir le modèle</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function Spec({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return <div className="text-center"><Icon className="mx-auto text-cts-red" size={16} /><b className="mt-1.5 block text-xs">{value}</b><span className="text-[10px] uppercase text-cts-mist">{label}</span></div>;
}
