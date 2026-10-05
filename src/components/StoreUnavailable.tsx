import ShopFooter from "@/components/ShopFooter";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import ShopHeader from "@/components/ShopHeader";
import { whatsappUrl } from "@/lib/format";
import type { ShopConfig } from "@/types";

export default function StoreUnavailable({ config }: { config: ShopConfig }) {
  return (
    <div className="shop-shell flex min-h-screen flex-col pt-[110px]">
      <ShopHeader announcement={config.announcement || "Boutique temporairement indisponible"} />
      <main className="noise grid-lines flex flex-1 items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="max-w-2xl rounded-[32px] border border-white/10 bg-[#151a38]/90 p-8 shadow-card backdrop-blur-xl sm:p-12">
          <img src="/logo-tcs.png" alt="CTS" className="mx-auto h-28 w-20 object-contain brightness-125" />
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[.2em] text-cts-red">CTS Electric Shop</p>
          <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-5xl">Le prochain groupage se prépare.</h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-cts-mist">
            La boutique publique est momentanément fermée pendant la mise à jour du catalogue. L'équipe CTS reste disponible pour vous informer sur les prochains modèles.
          </p>
          <a
            href={whatsappUrl(config.whatsapp, "Bonjour CTS, je souhaite être informé du prochain groupage de motos électriques.")}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-extrabold text-white"
          >
            <WhatsAppIcon size={18} /> Contacter CTS sur WhatsApp
          </a>
        </div>
      </main>
      <ShopFooter phone={config.supportPhone} whatsapp={config.whatsapp} />
    </div>
  );
}
