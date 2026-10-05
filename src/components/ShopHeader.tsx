import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { ArrowUpRight, Bike, ExternalLink, Home, Menu, Waypoints, X } from "lucide-react";
import { shopAnchor, shopHomePath } from "@/lib/paths";

const navLinks = [
  { label: "Accueil", id: "", icon: Home },
  { label: "Les motos", id: "catalogue", icon: Bike },
  { label: "Comment ça marche", id: "processus", icon: Waypoints },
];

export default function ShopHeader({ announcement }: { announcement?: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("");
  const location = useLocation();
  const { scrollY } = useScroll();
  const home = location.pathname === shopHomePath;

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (value) => setScrolled(value > 30));
    setScrolled(window.scrollY > 30);
    return unsubscribe;
  }, [scrollY]);

  useEffect(() => {
    if (!home) return;
    const sections = navLinks
      .filter((link) => link.id)
      .map((link) => document.getElementById(link.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: [0, 0.25, 0.5, 0.75] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [home]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const hrefFor = (id: string) => shopAnchor(id);

  return (
    <>
      <motion.div
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-[70] flex h-10 items-center overflow-hidden bg-cts-red text-[10px] font-extrabold uppercase tracking-[.14em] text-white"
      >
        <div className="marquee-track flex min-w-max items-center gap-9 whitespace-nowrap px-5">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-9">
              <span>{announcement || "Groupage motos électriques ouvert — places limitées"}</span>
              <span className="text-white/55">◆</span>
              <span>Aucun paiement en ligne</span>
              <span className="text-white/55">◆</span>
              <span>Accompagnement Chine → Bénin</span>
              <span className="text-white/55">◆</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed inset-x-0 top-10 z-[60] border-b backdrop-blur-xl transition-[height,background-color,border-color,box-shadow] duration-300 ${
          scrolled
            ? "h-16 border-[#10152f]/15 bg-white/95 shadow-xl"
            : "h-[76px] border-[#10152f]/15 bg-white/95 shadow-lg"
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="CTS Electric Shop">
            <img
              src="/logo-tcs.png"
              alt="CTS"
              className={`w-12 object-contain brightness-125 contrast-125 transition-all duration-300 ${scrolled ? "h-14" : "h-[68px]"}`}
            />
            <div className="min-w-0">
              <div className="font-display text-sm font-extrabold tracking-tight text-[#10152f] sm:text-base">
                CTS <span className="text-cts-red">ELECTRIC</span>
              </div>
              <div className="mt-1 truncate text-[8px] font-bold uppercase tracking-[.22em] text-cts-mist">
                Une offre China Trade Services
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            {navLinks.map((link, index) => {
              const active = home && (link.id ? activeId === link.id : activeId === "");
              const href = hrefFor(link.id);
              const content = (
                <>
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="shop-nav-active"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-cts-red"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              );

              return (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.07 }}
                >
                  {link.id ? (
                    <a className={`relative transition-colors ${active ? "text-[#10152f]" : "text-[#34405e] hover:text-[#10152f]"}`} href={href}>
                      {content}
                    </a>
                  ) : (
                    <Link className={`relative transition-colors ${active ? "text-[#10152f]" : "text-[#34405e] hover:text-[#10152f]"}`} to={href}>
                      {content}
                    </Link>
                  )}
                </motion.div>
              );
            })}
            <motion.a
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48 }}
              className="relative text-[#34405e] transition-colors hover:text-[#10152f]"
              href="https://www.chinatradeservice.site"
              target="_blank"
              rel="noreferrer"
            >
              Site CTS
            </motion.a>
          </nav>

          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            className="hidden items-center md:flex"
          >
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              href={hrefFor("catalogue")}
              className="shine inline-flex h-10 items-center gap-2 rounded-xl bg-cts-red px-4 text-xs font-extrabold text-white shadow-glow"
            >
              Voir les motos et leurs prix <ArrowUpRight size={14} />
            </motion.a>
          </motion.div>

          <button
            className="relative z-[10000] flex h-10 w-10 flex-col items-center justify-center text-[#10152f] md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            <span className={`block h-0.5 w-6 rounded bg-[#10152f] transition-all duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`mt-1.5 block h-0.5 w-6 rounded bg-[#10152f] transition-all duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`mt-1.5 block h-0.5 w-6 rounded bg-[#10152f] transition-all duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[80] bg-black/65 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-[90] flex h-full w-[min(82vw,320px)] flex-col border-l border-[#10152f]/15 bg-white md:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <img src="/logo-tcs.png" alt="CTS" className="h-14 w-10 object-contain brightness-125" />
                  <div>
                    <p className="font-display text-sm font-extrabold">CTS <span className="text-cts-red">ELECTRIC</span></p>
                    <p className="mt-1 text-[8px] font-bold uppercase tracking-[.18em] text-cts-mist">Boutique officielle</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/75 transition hover:bg-white/5 hover:text-white" aria-label="Fermer">
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-5">
                {navLinks.map(({ label, id, icon: Icon }, index) => {
                  const active = home && (id ? activeId === id : activeId === "");
                  const classes = `mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                    active ? "bg-cts-red/12 text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
                  }`;
                  const inner = (
                    <>
                      <Icon size={18} className={active ? "text-cts-red" : "text-cts-mist"} />
                      <span>{label}</span>
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cts-red" />}
                    </>
                  );
                  return (
                    <motion.div key={label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + index * 0.06 }}>
                      {id ? (
                        <a href={hrefFor(id)} onClick={() => setOpen(false)} className={classes}>{inner}</a>
                      ) : (
                        <Link to="/" onClick={() => setOpen(false)} className={classes}>{inner}</Link>
                      )}
                    </motion.div>
                  );
                })}
                <motion.a
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.24 }}
                  href="https://www.chinatradeservice.site"
                  target="_blank"
                  rel="noreferrer"
                  className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-cts-mist transition-colors hover:bg-white/5 hover:text-white"
                >
                  <ExternalLink size={18} /> Site China Trade Services
                </motion.a>
              </nav>

              <div className="border-t border-white/10 p-4">
                <motion.a
                  whileTap={{ scale: 0.97 }}
                  href={hrefFor("catalogue")}
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cts-red px-5 py-3.5 text-sm font-extrabold text-white shadow-glow"
                >
                  Voir les motos et leurs prix <ArrowUpRight size={16} />
                </motion.a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
