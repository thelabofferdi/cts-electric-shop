import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { shopAnchor, shopHomePath } from "@/lib/paths";

export default function ShopFooter({ phone = "+229 01 59 10 47 05", whatsapp = "2290159104705" }: { phone?: string; whatsapp?: string }) {
  return (
    <footer className="border-t border-white/10 bg-[#080b1a] text-white">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_.7fr_1fr]">
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3"><img src="/logo-tcs.png" alt="CTS" className="h-20 w-14 object-contain brightness-125" /><div><h3 className="font-display font-extrabold">CTS <span className="text-cts-red">Electric Shop</span></h3><p className="mt-1 text-[9px] font-bold uppercase tracking-[.18em] text-cts-mist">Une offre China Trade Services</p></div></div>
          <p className="mt-4 max-w-md text-sm leading-7 text-cts-mist">Des motos électriques proposées en groupage avec un accompagnement humain, de la demande jusqu'à la livraison au Bénin.</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[10px] font-bold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Aucun paiement sur le site</div>
        </motion.div>
        <motion.div variants={fadeUp}><h4 className="font-display text-sm font-bold">Navigation</h4><div className="mt-5 flex flex-col gap-3 text-sm text-cts-mist"><Link className="transition hover:translate-x-1 hover:text-white" to={shopHomePath}>Accueil</Link><a className="transition hover:translate-x-1 hover:text-white" href={shopAnchor("catalogue")}>Catalogue</a><a className="transition hover:translate-x-1 hover:text-white" href={shopAnchor("processus")}>Processus</a><a className="transition hover:translate-x-1 hover:text-white" href="https://www.chinatradeservice.site" target="_blank" rel="noreferrer">Site CTS</a></div></motion.div>
        <motion.div variants={fadeUp}><h4 className="font-display text-sm font-bold">China Trade Services</h4><div className="mt-5 space-y-3 text-sm text-cts-mist"><p className="flex gap-2"><Phone size={16} className="text-cts-red" />{phone}</p><p className="flex gap-2 text-cts-mist"><span className="h-4 w-4" />Réservez votre échange depuis le bouton rendez-vous.</p><p className="flex min-w-0 gap-2"><Mail size={16} className="shrink-0 text-cts-red" /><span className="break-all">chinaservicetrade@gmail.com</span></p><p className="flex gap-2"><MapPin size={16} className="text-cts-red" />Calavi Bidossessi, Bénin</p></div></motion.div>
      </motion.div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-cts-mist">© 2026 China Trade Services · Groupage de motos électriques</div>
    </footer>
  );
}
