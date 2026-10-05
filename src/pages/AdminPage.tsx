import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BarChart3, Bike, CalendarClock, Check, ChevronDown, CircleDollarSign, ExternalLink, Eye, EyeOff, FileText, ImagePlus, KeyRound, LayoutDashboard, Loader2, Lock, LogOut, Menu, PackagePlus, Pencil, Plus, Save, Search, Settings, ShieldCheck, ShoppingBag, Trash2, UploadCloud, Users, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { shopApi } from "@/lib/api";
import { defaultConfig, defaultProducts } from "@/lib/defaults";
import { formatCfa, whatsappUrl } from "@/lib/format";
import type { ShopAppointment, ShopAppointmentConfig, ShopConfig, ShopProduct } from "@/types";
import { shopHomePath } from "@/lib/paths";

const emptyProduct: ShopProduct = { name: "", slug: "", eyebrow: "Moto électrique", shortDescription: "", description: "", imageUrl: "", galleryUrls: [], priceCfa: 0, depositCfa: 0, rangeKm: 0, maxSpeedKmh: 0, motorPowerW: 0, chargeHours: 0, batteryLabel: "", colors: [], features: [], availability: "open", groupLabel: "Groupage en cours", deliveryEstimate: "Livraison estimée sous 8 à 10 semaines après clôture", featured: false, published: false, sortOrder: 10 };
const statusLabels: Record<string, string> = { new: "Nouvelle", contacted: "Contactée", deposit_pending: "Acompte attendu", deposit_paid: "Acompte payé", confirmed: "Confirmée", cancelled: "Annulée", completed: "Terminée" };
export default function AdminPage() {
  useEffect(() => {
    const previousTitle = document.title;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    const previousRobots = robots.content;
    document.title = "Administration | CTS Electric Shop";
    robots.content = "noindex, nofollow, noarchive";
    return () => {
      document.title = previousTitle;
      if (created) robots?.remove();
      else if (robots) robots.content = previousRobots;
    };
  }, []);
  const demo = import.meta.env.VITE_SHOP_DEMO === "true";
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(shopApi.viewer, demo || !isAuthenticated ? "skip" : {}) as { role?: string; email?: string } | null | undefined;
  const isAdmin = demo || viewer?.role === "admin" || viewer?.role === "developer";
  if (!demo && (isLoading || (isAuthenticated && viewer === undefined))) return <Loading />;
  if (!isAuthenticated && !demo) return <AdminLogin />;
  if (!isAdmin) return <Unauthorized email={viewer?.email} />;
  return <AdminDashboard demo={demo} viewer={viewer} />;
}

function Loading() { return <div className="shop-shell flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-cts-red" size={34} /></div>; }

function AdminLogin() {
  const { signIn } = useAuthActions();
  const [form, setForm] = useState({ email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [flowMode, setFlowMode] = useState<"login" | "forgot" | "reset-verify">("login");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginBlocked, setLoginBlocked] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (loginBlocked) {
      toast.error("Accès temporairement bloqué.");
      return;
    }

    if (flowMode === "login") {
      if (!form.email.trim() || !form.password) {
        toast.error("Email et mot de passe requis.");
        return;
      }
      setLoading(true);
      try {
        await signIn("password", { email: form.email.trim(), password: form.password, flow: "signIn" });
        toast.success("Connexion réussie");
      } catch {
        const attempts = loginAttempts + 1;
        setLoginAttempts(attempts);
        if (attempts >= 5) {
          setLoginBlocked(true);
          toast.error("Accès bloqué pendant 5 minutes.");
        } else {
          toast.error(`Identifiants incorrects (${5 - attempts} essai${5 - attempts > 1 ? "s" : ""} restant${5 - attempts > 1 ? "s" : ""})`);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (flowMode === "forgot") {
      if (!form.email.trim()) {
        toast.error("Veuillez saisir votre adresse e-mail.");
        return;
      }
      setLoading(true);
      try {
        await signIn("password", { email: form.email.trim(), flow: "reset" });
      } catch {
        // Keep the response identical so the form cannot be used to discover
        // which email addresses have a CTS account.
      } finally {
        setFlowMode("reset-verify");
        toast.success("Si ce compte existe, un code de réinitialisation lui a été envoyé.");
        setLoading(false);
      }
      return;
    }

    if (!verificationCode.trim() || !form.password) {
      toast.error("Code de vérification et nouveau mot de passe requis.");
      return;
    }
    if (form.password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    try {
      await signIn("password", {
        email: form.email.trim(),
        code: verificationCode.trim(),
        newPassword: form.password,
        flow: "reset-verification",
      });
      setFlowMode("login");
      setForm((current) => ({ ...current, password: "" }));
      setConfirmPassword("");
      setVerificationCode("");
      toast.success("Votre mot de passe a été réinitialisé !");
    } catch {
      toast.error("Le code saisi est incorrect ou a expiré.");
    } finally {
      setLoading(false);
    }
  }

  const loginTitle = flowMode === "login" ? "Espace Administrateur" : flowMode === "forgot" ? "Mot de passe oublié" : "Nouveau mot de passe";

  return (
    <div className="shop-shell grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src="/products/e-rider-pro-electric.jpg" alt="Moto électrique CTS" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-[#0b0f24]/20 to-[#0b0f24]" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-12 left-12 max-w-lg">
          <div className="inline-flex rounded-full bg-cts-red px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.18em]">CTS Electric Shop</div>
          <h1 className="mt-5 font-display text-5xl font-extrabold">Pilotez le groupage depuis un seul cockpit.</h1>
          <p className="mt-4 text-sm leading-7 text-cts-mist">Produits, demandes clients, acomptes et configuration de la boutique.</p>
        </motion.div>
      </div>

      <div className="relative flex items-center justify-center overflow-hidden px-5 py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(230,0,45,0.12),transparent_35%)]" />
        <div className="relative w-full max-w-md">
          <Link to={shopHomePath} className="inline-flex items-center gap-2 text-xs font-bold text-cts-mist transition hover:text-white">
            <ArrowLeft size={14} /> Retour à la boutique
          </Link>
          <AnimatePresence mode="wait">
              <motion.div key="login" initial={{ opacity: 0, scale: 0.96, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="mt-8 rounded-[28px] border border-white/10 bg-[#151a38] p-7 shadow-card sm:p-9">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cts-red/10 text-cts-red">
                  {flowMode === "forgot" ? <KeyRound size={27} /> : <ShieldCheck size={27} />}
                </div>
                <h1 className="mt-6 font-display text-3xl font-extrabold">{loginTitle}</h1>
                <p className="mt-2 text-sm leading-6 text-cts-mist">Utilisez le même compte que sur l'administration CTS principale.</p>

                {loginBlocked ? (
                  <div className="mt-7 rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-center">
                    <Lock className="mx-auto text-red-300" size={24} />
                    <p className="mt-3 text-sm font-bold text-red-300">Accès temporairement bloqué</p>
                    <p className="mt-1 text-xs text-cts-mist">Réessayez dans quelques minutes.</p>
                  </div>
                ) : (
                  <form onSubmit={submit} className="mt-7 space-y-4">
                    {(flowMode === "login" || flowMode === "forgot") && (
                      <label className="block text-xs font-bold">
                        Adresse e-mail
                        <input required type="email" autoComplete="email" className="field mt-2" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                      </label>
                    )}

                    {flowMode === "reset-verify" && (
                      <label className="block text-xs font-bold">
                        Code de vérification
                        <input required type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={8} placeholder="Code à 8 chiffres" className="field mt-2 text-center font-mono text-lg tracking-[.25em]" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 8))} />
                      </label>
                    )}

                    {(flowMode === "login" || flowMode === "reset-verify") && (
                      <label className="block text-xs font-bold">
                        {flowMode === "reset-verify" ? "Nouveau mot de passe" : "Mot de passe"}
                        <div className="relative mt-2">
                          <input required type={show ? "text" : "password"} autoComplete={flowMode === "login" ? "current-password" : "new-password"} className="field pr-12" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute right-3 top-1/2 -translate-y-1/2 text-cts-mist transition hover:text-white">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                        </div>
                      </label>
                    )}

                    {flowMode === "reset-verify" && (
                      <>
                        <label className="block text-xs font-bold">
                          Confirmer le nouveau mot de passe
                          <input required type={show ? "text" : "password"} autoComplete="new-password" className="field mt-2" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                        </label>
                        <p className="rounded-xl border border-white/10 bg-white/[.03] px-3 py-2.5 text-[10px] leading-5 text-cts-mist">
                          Le code est envoyé uniquement à l'adresse du compte, expire après 15 minutes et ne peut être utilisé qu'une seule fois.
                        </p>
                      </>
                    )}

                    {flowMode === "login" && (
                      <div className="text-right">
                        <button type="button" onClick={() => setFlowMode("forgot")} className="text-xs font-bold text-cts-red hover:underline">Mot de passe oublié ?</button>
                      </div>
                    )}

                    <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cts-red px-5 py-4 text-sm font-extrabold shadow-glow disabled:opacity-60">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <>{flowMode === "login" ? "Accéder au tableau de bord" : flowMode === "forgot" ? "Envoyer le code" : "Réinitialiser le mot de passe"} <ShieldCheck size={16} /></>}
                    </button>
                  </form>
                )}

                {flowMode !== "login" && (
                  <button type="button" onClick={() => setFlowMode("login")} className="mt-6 w-full border-t border-white/10 pt-5 text-center text-xs font-bold text-cts-red hover:underline">Retour à la connexion</button>
                )}
              </motion.div>
          </AnimatePresence>
          <p className="mt-4 text-center text-[10px] uppercase tracking-[.16em] text-cts-mist/50">Connexion chiffrée · China Trade Services</p>
        </div>
      </div>
    </div>
  );
}

function Unauthorized({ email }: { email?: string }) { const { signOut } = useAuthActions(); return <div className="shop-shell flex min-h-screen items-center justify-center p-5"><div className="max-w-md rounded-[28px] border border-red-400/20 bg-[#151a38] p-8 text-center"><ShieldCheck className="mx-auto text-cts-red" size={34}/><h1 className="mt-5 font-display text-2xl font-extrabold">Accès non autorisé</h1><p className="mt-3 text-sm leading-6 text-cts-mist">Le compte {email || "connecté"} n'a pas un rôle administrateur CTS.</p><button onClick={()=>signOut()} className="mt-6 rounded-xl bg-cts-red px-5 py-3 text-sm font-bold">Changer de compte</button></div></div>; }

function AdminDashboard({ demo, viewer }: { demo: boolean; viewer: any }) {
  const { signOut } = useAuthActions();
  const remote = useQuery(shopApi.getAdminOverview, demo ? "skip" : {}) as { config?: ShopConfig; products?: ShopProduct[]; reservations?: any[]; stats?: any } | undefined;
  const initialize = useMutation(shopApi.initializeCatalog);
  const saveProduct = useMutation(shopApi.saveProduct);
  const removeProduct = useMutation(shopApi.removeProduct);
  const updateReservation = useMutation(shopApi.updateReservation);
  const saveConfig = useMutation(shopApi.saveConfig);
  const appointments = (useQuery(shopApi.getShopAppointments, demo ? "skip" : {}) ?? []) as ShopAppointment[];
  const appointmentConfigRemote = useQuery(shopApi.getShopAppointmentConfig, demo ? "skip" : {}) as ShopAppointmentConfig | undefined;
  const updateShopAppointment = useMutation(shopApi.updateShopAppointment);
  const saveShopAppointmentConfig = useMutation(shopApi.saveShopAppointmentConfig);
  const products = (remote?.products?.length ? remote.products : defaultProducts) as ShopProduct[];
  const reservations = (demo ? [] : remote?.reservations ?? []) as any[];
  const stats = remote?.stats ?? { products: products.length, published: products.filter((p)=>p.published).length, requests: reservations.length, newRequests: reservations.filter((r)=>r.status==="new").length, depositsPaid: reservations.filter((r)=>["deposit_paid","confirmed","completed"].includes(r.status)).length, pipelineCfa: reservations.reduce((s,r)=>s+r.productPriceCfa*r.quantity,0) };
  const [tab, setTab] = useState<"overview"|"products"|"requests"|"appointments"|"settings">("overview");
  const [menu, setMenu] = useState(false);
  const [productModal, setProductModal] = useState<ShopProduct | null>(null);
  const [config, setConfig] = useState<ShopConfig>((remote?.config ?? defaultConfig) as ShopConfig);
  const [search, setSearch] = useState("");
  const [appointmentConfig, setAppointmentConfig] = useState<ShopAppointmentConfig | null>(null);
  const filteredReservations = useMemo(()=>reservations.filter((r)=>`${r.fullName} ${r.whatsapp} ${r.productName}`.toLowerCase().includes(search.toLowerCase())),[reservations,search]);
  useEffect(() => { if (remote?.config) setConfig(remote.config as ShopConfig); }, [remote?.config]);
  useEffect(() => {
    if (!appointmentConfigRemote) return;
    setAppointmentConfig({
      ...appointmentConfigRemote,
      appointmentTypes: appointmentConfigRemote.appointmentTypes?.length ? appointmentConfigRemote.appointmentTypes : [
        { key: "showroom", label: "Visite du showroom", enabled: true },
        { key: "demonstration", label: "Démonstration d’une moto", enabled: true },
        { key: "consultation", label: "Échange sur mon projet", enabled: true },
        { key: "whatsapp", label: "Appel WhatsApp planifié", enabled: true },
      ],
      whatsappMessageTemplate: appointmentConfigRemote.whatsappMessageTemplate || "Bonjour {nom}, nous revenons vers vous concernant votre rendez-vous CTS Electric du {date} à {heure}.",
    });
  }, [appointmentConfigRemote]);
  const nav = [["overview",LayoutDashboard,"Vue d'ensemble"],["products",Bike,"Produits"],["requests",Users,"Demandes"],["appointments",CalendarClock,"Rendez-vous"],["settings",Settings,"Paramètres"]] as const;
  async function seed() { try { if (demo) return toast.success("Catalogue de démonstration déjà actif"); const result=await initialize({}); toast.success(`${result.created ?? 0} produits créés`); } catch(e:any){toast.error(e.message);} }
  async function changeStatus(id:string,status:string,adminNotes?:string){ try { if(demo)return toast.success("Statut modifié en mode démo"); await updateReservation({id,status,adminNotes}); toast.success("Demande mise à jour"); }catch(e:any){toast.error(e.message);} }
  async function deleteProduct(id?:string){if(!id)return; if(!confirm("Supprimer définitivement ce produit ?"))return; try{await removeProduct({id});toast.success("Produit supprimé");}catch(e:any){toast.error(e.message)}}
  async function persistConfig(){try{if(demo)return toast.success("Configuration simulée en mode démo");await saveConfig({value:config});toast.success("Boutique mise à jour");}catch(e:any){toast.error(e.message)}}
  async function changeAppointment(id: string, patch: { status?: string; requestedAt?: string; adminNotes?: string }) { try { if (demo) return toast.success("Rendez-vous simulé en mode démo"); await updateShopAppointment({ id: id as any, ...patch }); toast.success("Rendez-vous mis à jour"); } catch (e: any) { toast.error(e.message || "Impossible de mettre à jour le rendez-vous."); } }
  async function persistAppointmentConfig() { if (!appointmentConfig) return; try { if (demo) return toast.success("Configuration simulée en mode démo"); await saveShopAppointmentConfig({ value: appointmentConfig }); toast.success("Horaires des rendez-vous publiés"); } catch (e: any) { toast.error(e.message || "Impossible de sauvegarder les horaires."); } }
  return <div className="admin-dashboard min-h-screen bg-[#0b0f24] text-white">
     <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[#0e132c] transition-transform lg:translate-x-0 ${menu?"translate-x-0":"-translate-x-full"}`}><div className="flex h-24 items-center gap-3 border-b border-white/10 px-6"><img src="/logo-tcs.png" className="h-20 w-14 object-contain brightness-125"/><div><b className="font-display">CTS ELECTRIC</b><p className="text-[9px] uppercase tracking-[.18em] text-cts-mist">Administration</p></div><button onClick={()=>setMenu(false)} className="ml-auto lg:hidden"><X/></button></div><nav className="space-y-2 p-4">{nav.map(([key,Icon,label])=><button key={key} onClick={()=>{setTab(key);setMenu(false)}} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${tab===key?"bg-cts-red text-white shadow-glow":"text-cts-mist hover:bg-white/5 hover:text-white"}`}><Icon size={18}/>{label}{key==="requests"&&stats.newRequests>0&&<span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] text-cts-red">{stats.newRequests}</span>}</button>)}</nav><div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="truncate text-xs font-bold">{viewer?.email || "Mode démonstration"}</p><div className="mt-3 flex gap-2"><Link to={shopHomePath} className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-center text-[10px] font-bold text-cts-mist">Voir le shop</Link>{!demo&&<button onClick={()=>signOut()} className="rounded-lg border border-white/10 p-2 text-cts-mist"><LogOut size={15}/></button>}</div></div></aside>
     {menu&&<button className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={()=>setMenu(false)}/>}<div className="lg:pl-72"><header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#0b0f24]/90 px-4 backdrop-blur-xl sm:px-7"><div className="flex items-center gap-3"><button onClick={()=>setMenu(true)} className="rounded-xl border border-white/10 p-2 lg:hidden"><Menu/></button><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-cts-mist">Cockpit boutique</p><h1 className="font-display text-lg font-extrabold">{nav.find(n=>n[0]===tab)?.[2]}</h1></div></div><div className="flex items-center gap-2"><span className={`hidden rounded-full border px-3 py-1.5 text-[10px] font-bold sm:block ${config.enabled?"border-emerald-400/20 bg-emerald-400/5 text-emerald-300":"border-amber-400/20 bg-amber-400/5 text-amber-200"}`}>● {config.enabled?"Boutique en ligne":"Boutique masquée"}</span><Link to={shopHomePath} className="rounded-xl bg-cts-red px-3.5 py-2.5 text-xs font-bold">Ouvrir <ExternalLink className="ml-1 inline" size={13}/></Link></div></header>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-7">
        {tab==="overview"&&<Overview stats={stats} reservations={reservations} products={products} setTab={setTab}/>}
        {tab==="products"&&<section><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-display text-2xl font-extrabold">Catalogue</h2><p className="mt-1 text-sm text-cts-mist">Gérez les modèles, prix, acomptes et disponibilités.</p></div><div className="flex gap-2">{remote?.products?.length===0&&<button onClick={seed} className="rounded-xl border border-white/15 px-4 py-3 text-xs font-bold"><PackagePlus className="mr-2 inline" size={15}/>Initialiser</button>}<button onClick={()=>setProductModal({...emptyProduct})} className="rounded-xl bg-cts-red px-4 py-3 text-xs font-bold"><Plus className="mr-2 inline" size={15}/>Ajouter une moto</button></div></div><div className="mt-7 grid gap-4 xl:grid-cols-2">{products.map(p=><div key={p.slug} className="overflow-hidden rounded-2xl border border-white/10 bg-[#151a38]"><div className="flex gap-4 p-4"><img src={p.imageUrl} className="h-28 w-32 rounded-xl object-cover"/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${p.published?"bg-emerald-400/10 text-emerald-300":"bg-white/5 text-cts-mist"}`}>{p.published?"Publié":"Brouillon"}</span><h3 className="mt-2 truncate font-display text-lg font-extrabold">{p.name}</h3></div><div className="flex gap-1"><button onClick={()=>setProductModal({...p})} className="rounded-lg border border-white/10 p-2 text-cts-mist hover:text-white"><Pencil size={15}/></button>{p._id&&<button onClick={()=>deleteProduct(p._id)} className="rounded-lg border border-red-400/10 p-2 text-red-300"><Trash2 size={15}/></button>}</div></div><p className="mt-1 text-sm font-bold">{formatCfa(p.priceCfa)}</p><p className="mt-2 text-[10px] text-cts-mist">{p.groupLabel} · {p.remainingUnits ?? "—"} places</p></div></div></div>)}</div></section>}
        {tab==="requests"&&<Requests reservations={filteredReservations} search={search} setSearch={setSearch} changeStatus={changeStatus}/>}
        {tab==="appointments"&&<ShopAppointments appointments={appointments} config={appointmentConfig} setConfig={setAppointmentConfig} saveConfig={persistAppointmentConfig} changeAppointment={changeAppointment}/>}
        {tab==="settings"&&<SettingsPanel config={config} setConfig={setConfig} save={persistConfig}/>}
      </main>
    </div>
    <AnimatePresence>
      {productModal && (
        <ProductEditor
          product={productModal}
          demo={demo}
          onClose={() => setProductModal(null)}
          save={async (product: ShopProduct) => {
            try {
              if (demo) {
                toast.success("Produit simulé en mode démo");
                setProductModal(null);
                return true;
              }
              const { _id, ...input } = product;
              await saveProduct({
                id: _id,
                product: {
                  name: input.name,
                  slug: input.slug,
                  eyebrow: input.eyebrow,
                  shortDescription: input.shortDescription,
                  description: input.description,
                  imageStorageId: input.imageStorageId,
                  imageUrl: input.imageStorageId ? undefined : input.imageUrl || undefined,
                  galleryUrls: input.galleryUrls || [],
                  priceCfa: input.priceCfa,
                  compareAtPriceCfa: input.compareAtPriceCfa,
                  depositCfa: input.depositCfa,
                  rangeKm: input.rangeKm,
                  maxSpeedKmh: input.maxSpeedKmh,
                  motorPowerW: input.motorPowerW,
                  chargeHours: input.chargeHours,
                  batteryLabel: input.batteryLabel,
                  colors: input.colors,
                  features: input.features,
                  availability: input.availability,
                  groupLabel: input.groupLabel,
                  deliveryEstimate: input.deliveryEstimate,
                  remainingUnits: input.remainingUnits,
                  featured: input.featured,
                  published: input.published,
                  sortOrder: input.sortOrder,
                },
              });
              toast.success("Produit sauvegardé");
              setProductModal(null);
              return true;
            } catch (error: any) {
              toast.error(error?.message || "Impossible de sauvegarder le produit.");
              return false;
            }
          }}
        />
      )}
    </AnimatePresence>
  </div>;
}

function Overview({stats,reservations,products,setTab}:any){return <section><div className="rounded-[26px] border border-white/10 bg-gradient-to-r from-[#171d41] to-[#111631] p-6 sm:p-8"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-cts-red">Aujourd'hui</p><h2 className="mt-2 font-display text-3xl font-extrabold">La boutique en un coup d'œil.</h2><p className="mt-2 text-sm text-cts-mist">Priorité aux nouvelles demandes et aux clients en attente d'acompte.</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[[ShoppingBag,"Produits publiés",stats.published],[Users,"Demandes",stats.requests],[FileText,"À traiter",stats.newRequests],[CircleDollarSign,"Acomptes validés",stats.depositsPaid],[BarChart3,"Pipeline",formatCfa(stats.pipelineCfa)]].map(([Icon,label,value]:any)=><div key={label} className="rounded-2xl border border-white/10 bg-[#151a38] p-5"><Icon className="text-cts-red" size={20}/><p className="mt-5 text-xs text-cts-mist">{label}</p><p className="mt-1 font-display text-2xl font-extrabold">{value}</p></div>)}</div><div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><div className="rounded-2xl border border-white/10 bg-[#151a38] p-5"><div className="flex items-center justify-between"><h3 className="font-display font-extrabold">Demandes récentes</h3><button onClick={()=>setTab("requests")} className="text-xs font-bold text-cts-red">Tout voir</button></div><div className="mt-4 divide-y divide-white/10">{reservations.slice(0,5).map((r:any)=><div key={r._id} className="flex items-center gap-3 py-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 font-bold">{r.fullName[0]}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{r.fullName}</p><p className="truncate text-[10px] text-cts-mist">{r.productName} · {r.city}</p></div><span className="rounded-full bg-cts-red/10 px-2 py-1 text-[9px] font-bold text-rose-200">{statusLabels[r.status]}</span></div>)}{!reservations.length&&<p className="py-10 text-center text-sm text-cts-mist">Aucune demande pour le moment.</p>}</div></div><div className="rounded-2xl border border-white/10 bg-[#151a38] p-5"><h3 className="font-display font-extrabold">Disponibilité catalogue</h3><div className="mt-5 space-y-4">{products.map((p:any)=><div key={p.slug}><div className="flex justify-between text-xs"><span>{p.name}</span><b>{p.remainingUnits??0} places</b></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-cts-red" style={{width:`${Math.min(100,(p.remainingUnits??0)*7)}%`}}/></div></div>)}</div></div></div></section>}

function ShopAppointments({ appointments, config, setConfig, saveConfig, changeAppointment }: { appointments: ShopAppointment[]; config: ShopAppointmentConfig | null; setConfig: (value: ShopAppointmentConfig) => void; saveConfig: () => void; changeAppointment: (id: string, patch: { status?: string; requestedAt?: string; adminNotes?: string }) => void }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const labels: Record<string, string> = { requested: "À traiter", confirmed: "Confirmé", rescheduled: "Replanifié", cancelled: "Annulé", completed: "Terminé", no_show: "Absent" };
  const typeLabels = Object.fromEntries((config?.appointmentTypes ?? []).map((item) => [item.key, item.label]));
  const template = config?.whatsappMessageTemplate || "Bonjour {nom}, nous revenons vers vous concernant votre rendez-vous CTS Electric du {date} à {heure}.";
  const replaceToken = (value: string, token: string, replacement: string) => value.split(token).join(replacement);
  const messageFor = (appointment: ShopAppointment) => {
    let message = template;
    message = replaceToken(message, "{nom}", appointment.visitorName);
    message = replaceToken(message, "{date}", new Date(`${appointment.requestedAt.replace("T", " ")}:00`).toLocaleDateString("fr-FR"));
    message = replaceToken(message, "{heure}", appointment.requestedAt.slice(11, 16));
    message = replaceToken(message, "{motif}", appointment.reason);
    message = replaceToken(message, "{produit}", appointment.productName || "la boutique CTS Electric");
    return message;
  };
  const updateTypes = (appointmentTypes: ShopAppointmentConfig["appointmentTypes"]) => { if (config) setConfig({ ...config, appointmentTypes }); };
  const addType = () => updateTypes([...(config?.appointmentTypes ?? []), { key: `custom-${Date.now()}`, label: "Nouveau motif", enabled: true }]);
  const today = new Date().toISOString().slice(0, 10);
  const filtered = appointments.filter((appointment) => {
    const matchesFilter = filter === "all" || (filter === "today" && appointment.requestedAt.slice(0, 10) === today) || appointment.status === filter;
    const query = search.toLowerCase().trim();
    const matchesSearch = !query || `${appointment.visitorName} ${appointment.phone} ${appointment.city} ${appointment.productName || ""}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  const counts = {
    today: appointments.filter((appointment) => appointment.requestedAt.slice(0, 10) === today).length,
    requested: appointments.filter((appointment) => appointment.status === "requested").length,
    confirmed: appointments.filter((appointment) => appointment.status === "confirmed").length,
    week: appointments.filter((appointment) => {
      const date = new Date(appointment.requestedAt);
      const now = new Date();
      return date >= now && date.getTime() <= now.getTime() + 7 * 86400000;
    }).length,
  };
  const statusClass: Record<string, string> = { requested: "border-amber-400/20 bg-amber-400/10 text-amber-200", confirmed: "border-sky-400/20 bg-sky-400/10 text-sky-200", rescheduled: "border-violet-400/20 bg-violet-400/10 text-violet-200", completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200", cancelled: "border-red-400/20 bg-red-400/10 text-red-200", no_show: "border-white/10 bg-white/5 text-cts-mist" };
  return <section>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><h2 className="font-display text-2xl font-extrabold">Rendez-vous</h2><p className="mt-1 text-sm text-cts-mist">Traitez les demandes, confirmez les créneaux et contactez rapidement les visiteurs.</p></div>
      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-xs font-bold text-emerald-300">{appointments.length} demande(s)</span>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[[CalendarClock, "Aujourd'hui", counts.today, "today"], [FileText, "À traiter", counts.requested, "requested"], [Check, "Confirmés", counts.confirmed, "confirmed"], [CalendarClock, "Cette semaine", counts.week, "all"]].map(([Icon, label, value, key]: any) => <button key={label} type="button" onClick={() => setFilter(key)} className={`rounded-2xl border p-4 text-left transition ${filter === key ? "border-cts-red/50 bg-cts-red/10" : "border-white/10 bg-[#151a38] hover:bg-white/5"}`}><Icon className="text-cts-red" size={18} /><p className="mt-3 text-xs text-cts-mist">{label}</p><p className="mt-1 font-display text-2xl font-extrabold">{value}</p></button>)}
    </div>
    <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">{[["all", "Tous"], ["requested", "À traiter"], ["confirmed", "Confirmés"], ["rescheduled", "Replanifiés"], ["completed", "Terminés"]].map(([key, label]) => <button key={key} type="button" onClick={() => setFilter(key)} className={`rounded-full border px-3 py-2 text-xs font-bold ${filter === key ? "border-cts-red bg-cts-red text-white" : "border-white/10 text-cts-mist hover:text-white"}`}>{label}</button>)}</div>
      <input className="field w-full lg:max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un nom, téléphone, ville…" />
    </div>
    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#151a38]">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-xs"><thead className="border-b border-white/10 bg-white/[.03] text-cts-mist"><tr><th className="px-5 py-4">Visiteur</th><th className="px-5 py-4">Date / heure</th><th className="px-5 py-4">Motif</th><th className="px-5 py-4">Ville</th><th className="px-5 py-4">Statut</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-white/10">{filtered.map((appointment) => <tr key={appointment._id} className="hover:bg-white/[.025]"><td className="px-5 py-4"><p className="font-bold">{appointment.visitorName}</p><p className="mt-1 text-[10px] text-cts-mist">{appointment.phone}</p></td><td className="px-5 py-4 font-semibold">{new Date(`${appointment.requestedAt.replace("T", " ")}:00`).toLocaleString("fr-FR")}</td><td className="px-5 py-4"><p>{typeLabels[appointment.appointmentType] || appointment.appointmentType}</p><p className="mt-1 max-w-40 truncate text-[10px] text-cts-mist">{appointment.productName || appointment.reason}</p></td><td className="px-5 py-4 text-cts-mist">{appointment.city}</td><td className="px-5 py-4"><select value={appointment.status} onChange={(e) => changeAppointment(appointment._id, { status: e.target.value })} className={`rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${statusClass[appointment.status] || statusClass.requested}`}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><a href={whatsappUrl(appointment.phone, messageFor(appointment))} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-500/10 px-2.5 py-2 text-[10px] font-bold text-emerald-300">WhatsApp</a><a href={`tel:${appointment.phone}`} className="rounded-lg border border-white/10 px-2.5 py-2 text-[10px] font-bold text-cts-mist">Appeler</a></div></td></tr>)}</tbody></table>
      </div>
      <div className="space-y-3 p-3 md:hidden">{filtered.map((appointment) => <div key={appointment._id} className="rounded-xl border border-white/10 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{appointment.visitorName}</p><p className="mt-1 text-xs text-cts-mist">{appointment.phone} · {appointment.city}</p></div><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${statusClass[appointment.status] || statusClass.requested}`}>{labels[appointment.status] || appointment.status}</span></div><p className="mt-3 text-sm font-semibold">{new Date(`${appointment.requestedAt.replace("T", " ")}:00`).toLocaleString("fr-FR")}</p><p className="mt-1 text-xs text-cts-mist">{typeLabels[appointment.appointmentType] || appointment.appointmentType} · {appointment.productName || appointment.reason}</p><div className="mt-3 flex gap-2"><a href={whatsappUrl(appointment.phone, messageFor(appointment))} target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-xs font-bold text-emerald-300">WhatsApp</a><a href={`tel:${appointment.phone}`} className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-bold text-cts-mist">Appeler</a></div></div>)} </div>
      {!filtered.length && <p className="p-10 text-center text-sm text-cts-mist">Aucun rendez-vous ne correspond à ces filtres.</p>}
    </div>
    {config ? <div className="mt-6 grid gap-6 xl:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-[#151a38] p-5"><h3 className="font-display text-lg font-extrabold">Motifs</h3><p className="mt-1 text-xs text-cts-mist">Ceux qui sont actifs apparaissent dans le formulaire public.</p><div className="mt-4 space-y-3">{config.appointmentTypes.map((item, index) => <div key={item.key} className="grid grid-cols-[auto_1fr_auto] items-center gap-2"><input type="checkbox" checked={item.enabled} onChange={(e) => updateTypes(config.appointmentTypes.map((current, i) => i === index ? { ...current, enabled: e.target.checked } : current))} className="h-4 w-4 accent-[#e6002d]" /><input className="field" value={item.label} onChange={(e) => updateTypes(config.appointmentTypes.map((current, i) => i === index ? { ...current, label: e.target.value } : current))} /><button type="button" onClick={() => updateTypes(config.appointmentTypes.filter((_, i) => i !== index))} className="rounded-lg border border-red-400/20 px-2.5 py-2 text-xs font-bold text-red-300">Retirer</button></div>)}</div><button type="button" onClick={addType} className="mt-4 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold">Ajouter un motif</button></div>
      <div className="rounded-2xl border border-white/10 bg-[#151a38] p-5"><h3 className="font-display text-lg font-extrabold">Message WhatsApp</h3><p className="mt-1 text-xs text-cts-mist">Lien prérempli sans API WhatsApp.</p><textarea className="field mt-4 min-h-28" value={config.whatsappMessageTemplate} onChange={(e) => setConfig({ ...config, whatsappMessageTemplate: e.target.value })} /><p className="mt-2 text-[10px] leading-5 text-cts-mist">Variables : {"{nom}"} · {"{date}"} · {"{heure}"} · {"{motif}"} · {"{produit}"}</p></div>
      <div className="rounded-2xl border border-white/10 bg-[#151a38] p-5"><h3 className="font-display text-lg font-extrabold">Disponibilités</h3><label className="mt-4 flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={config.enabled} onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} className="h-4 w-4 accent-[#e6002d]" /> Rendez-vous ouverts</label><label className="mt-4 block text-xs font-bold">Lieu<input className="field mt-2" value={config.location} onChange={(e) => setConfig({ ...config, location: e.target.value })} /></label><label className="mt-4 block text-xs font-bold">Durée<input type="number" min="15" step="15" className="field mt-2" value={config.slotMinutes} onChange={(e) => setConfig({ ...config, slotMinutes: Number(e.target.value) || 30 })} /></label><div className="mt-4 space-y-2">{config.businessHours.map((hours, index) => <div key={hours.day} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-xs"><label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={hours.enabled} onChange={(e) => setConfig({ ...config, businessHours: config.businessHours.map((item, i) => i === index ? { ...item, enabled: e.target.checked } : item) })} />{hours.label}</label><input type="time" className="field w-24" value={hours.start} onChange={(e) => setConfig({ ...config, businessHours: config.businessHours.map((item, i) => i === index ? { ...item, start: e.target.value } : item) })} /><input type="time" className="field w-24" value={hours.end} onChange={(e) => setConfig({ ...config, businessHours: config.businessHours.map((item, i) => i === index ? { ...item, end: e.target.value } : item) })} /></div>)}</div><button onClick={saveConfig} className="mt-5 rounded-xl bg-cts-red px-4 py-3 text-xs font-extrabold shadow-glow"><Save className="mr-2 inline" size={15} />Publier</button></div>
    </div> : <div className="mt-6 rounded-2xl border border-white/10 bg-[#151a38] p-5 text-sm text-cts-mist">Chargement des réglages…</div>}
  </section>;
}
function AppointmentRow({ appointment, labels, typeLabel, message, changeAppointment }: { appointment: ShopAppointment; labels: Record<string, string>; typeLabel: string; message: string; changeAppointment: (id: string, patch: { status?: string; requestedAt?: string; adminNotes?: string }) => void }) {
  const [notes, setNotes] = useState(appointment.adminNotes || "");
  const [requestedAt, setRequestedAt] = useState(appointment.requestedAt);
  const phone = appointment.phone.replace(/[^\d+]/g, "");
  return <div className="rounded-2xl border border-white/10 bg-[#151a38] p-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div><div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cts-red/10 text-cts-red"><CalendarClock size={18} /></div><div><p className="font-bold">{appointment.visitorName}</p><p className="text-xs text-cts-mist">{appointment.phone}{appointment.email ? ` · ${appointment.email}` : ""} · {appointment.city}</p></div></div><p className="mt-3 text-sm font-bold">{new Date(`${appointment.requestedAt.replace("T", " ")}:00`).toLocaleString("fr-FR")} · {typeLabel}</p><p className="mt-1 text-xs text-cts-mist">{appointment.productName || "Rendez-vous général"}</p></div>
      <select value={appointment.status} onChange={(e) => changeAppointment(appointment._id, { status: e.target.value, adminNotes: notes })} className="admin-status-select field w-full text-xs lg:w-44">{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    </div>
    <p className="mt-4 text-sm text-cts-mist"><b className="text-white">Motif :</b> {appointment.reason}</p>
    <div className="mt-4 flex flex-wrap gap-2"><a href={whatsappUrl(phone, message)} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-300"><WhatsAppIcon size={15} className="mr-1 inline" /> Envoyer WhatsApp prérempli</a><a href={`tel:${phone}`} className="rounded-xl border border-white/15 px-4 py-3 text-xs font-bold">Appeler le numéro</a></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><label className="text-xs font-bold">Créneau<input type="datetime-local" className="field mt-2" value={requestedAt} onChange={(e) => setRequestedAt(e.target.value)} /></label><button onClick={() => changeAppointment(appointment._id, { requestedAt, adminNotes: notes })} className="rounded-xl border border-white/15 px-4 py-3 text-xs font-bold">Replanifier</button></div>
    <label className="mt-3 block text-xs font-bold">Notes internes<textarea className="field mt-2 min-h-16" value={notes} onChange={(e) => setNotes(e.target.value)} /></label><button onClick={() => changeAppointment(appointment._id, { adminNotes: notes })} className="mt-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold"><Save className="mr-1 inline" size={13} />Enregistrer les notes</button>
  </div>;
}

function Requests({reservations,search,setSearch,changeStatus}:any){return <section><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="font-display text-2xl font-extrabold">Demandes clients</h2><p className="mt-1 text-sm text-cts-mist">Suivez le contact, l'acompte et la confirmation du groupage.</p></div><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cts-mist" size={16}/><input className="field w-full pl-10 sm:w-72" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Nom, WhatsApp, moto…"/></div></div><div className="mt-7 space-y-4">{reservations.map((r:any)=><ReservationRow key={r._id} reservation={r} changeStatus={changeStatus}/>)}</div></section>}
function ReservationRow({reservation:r,changeStatus}:any){const [open,setOpen]=useState(false);const [notes,setNotes]=useState(r.adminNotes||"");return <div className="rounded-2xl border border-white/10 bg-[#151a38]"><div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cts-red/10 font-bold text-cts-red">{r.fullName[0]}</div><div className="min-w-0"><p className="truncate font-bold">{r.fullName}</p><p className="text-xs text-cts-mist">{r.city} · {new Date(r.created_at).toLocaleDateString("fr-FR")}</p></div></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{r.productName}</p><p className="text-xs text-cts-mist">{r.quantity} × {formatCfa(r.productPriceCfa)} · {r.preferredColor||"Couleur à confirmer"}</p></div><select value={r.status} onChange={(e)=>changeStatus(r._id,e.target.value,notes)} className="field w-full text-xs lg:w-44">{Object.entries(statusLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select><div className="flex gap-2"><a href={whatsappUrl(r.whatsapp,`Bonjour ${r.fullName}, nous revenons vers vous concernant votre demande pour la ${r.productName} chez CTS Electric Shop.`)} target="_blank" className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-xs font-bold text-emerald-300"><WhatsAppIcon size={15}/> WhatsApp</a><button onClick={()=>setOpen(!open)} className="rounded-xl border border-white/10 p-2.5 text-cts-mist"><ChevronDown className={open?"rotate-180":""} size={17}/></button></div></div>{open&&<div className="grid gap-4 border-t border-white/10 p-5 lg:grid-cols-2"><div className="space-y-2 text-xs text-cts-mist"><p><b className="text-white">WhatsApp :</b> {r.whatsapp}</p>{r.email&&<p><b className="text-white">E-mail :</b> {r.email}</p>}<p><b className="text-white">Acompte prévu :</b> {formatCfa(r.depositCfa)}</p><p><b className="text-white">Message :</b> {r.notes||"Aucune précision"}</p></div><div><label className="text-xs font-bold">Notes internes<textarea className="field mt-2 min-h-20" value={notes} onChange={(e)=>setNotes(e.target.value)}/></label><button onClick={()=>changeStatus(r._id,r.status,notes)} className="mt-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold"><Save className="mr-1 inline" size={13}/>Enregistrer</button></div></div>}</div>}

function SettingsPanel({config,setConfig,save}:any){return <section className="max-w-4xl"><div><h2 className="font-display text-2xl font-extrabold">Paramètres publics</h2><p className="mt-1 text-sm text-cts-mist">Mettez à jour les textes et contacts affichés sur la boutique.</p></div><div className="mt-7 space-y-5 rounded-[24px] border border-white/10 bg-[#151a38] p-6"><label className="block text-xs font-bold">Bande d'annonce<input className="field mt-2" value={config.announcement} onChange={(e)=>setConfig({...config,announcement:e.target.value})}/></label><label className="block text-xs font-bold">Titre principal<input className="field mt-2" value={config.heroTitle} onChange={(e)=>setConfig({...config,heroTitle:e.target.value})}/></label><label className="block text-xs font-bold">Sous-titre<textarea className="field mt-2 min-h-24" value={config.heroSubtitle} onChange={(e)=>setConfig({...config,heroSubtitle:e.target.value})}/></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-bold">WhatsApp<input className="field mt-2" value={config.whatsapp} onChange={(e)=>setConfig({...config,whatsapp:e.target.value})}/></label><label className="block text-xs font-bold">Téléphone support<input className="field mt-2" value={config.supportPhone} onChange={(e)=>setConfig({...config,supportPhone:e.target.value})}/></label></div><label className="block text-xs font-bold">Information acompte<textarea className="field mt-2 min-h-24" value={config.depositNotice} onChange={(e)=>setConfig({...config,depositNotice:e.target.value})}/></label><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={config.enabled} onChange={(e)=>setConfig({...config,enabled:e.target.checked})} className="h-4 w-4 accent-[#e6002d]"/>Boutique visible au public</label><button onClick={save} className="rounded-xl bg-cts-red px-5 py-3 text-sm font-extrabold shadow-glow"><Save className="mr-2 inline" size={16}/>Publier les modifications</button></div></section>}

function ProductEditor({
  product,
  demo,
  onClose,
  save,
}: {
  product: ShopProduct;
  demo: boolean;
  onClose: () => void;
  save: (product: ShopProduct) => Promise<boolean>;
}) {
  const generateUploadUrl = useMutation(shopApi.generateProductImageUploadUrl);
  const discardImage = useMutation(shopApi.discardProductImage);
  const [form, setForm] = useState<ShopProduct>(product);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(product.imageUrl || "");

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(form.imageUrl || "");
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, form.imageUrl]);

  const set = (key: keyof ShopProduct, value: any) => setForm((current) => ({ ...current, [key]: value }));

  function selectImage(file?: File) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) {
      toast.error("Utilisez une image JPEG, PNG, WebP ou AVIF.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 8 Mo.");
      return;
    }
    setImageFile(file);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!imageFile && !form.imageStorageId && !form.imageUrl) {
      toast.error("Ajoutez une image du produit.");
      return;
    }
    setSaving(true);
    let uploadedStorageId: string | undefined;
    try {
      if (demo) {
        await save({ ...form, imageUrl: previewUrl || form.imageUrl });
        return;
      }
      let nextProduct = form;
      if (imageFile) {
        const uploadUrl = await generateUploadUrl({});
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        if (!response.ok) throw new Error("Le téléversement de l'image a échoué.");
        const result = await response.json();
        uploadedStorageId = result.storageId;
        nextProduct = {
          ...form,
          imageStorageId: uploadedStorageId,
          imageUrl: previewUrl,
        };
      }
      const saved = await save(nextProduct);
      if (!saved && uploadedStorageId) {
        await discardImage({ storageId: uploadedStorageId });
      }
    } catch (error: any) {
      if (uploadedStorageId) {
        try { await discardImage({ storageId: uploadedStorageId }); } catch { /* fichier déjà rattaché ou supprimé */ }
      }
      toast.error(error?.message || "Impossible d'enregistrer l'image.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-5">
      <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-label="Fermer" />
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        onSubmit={submit}
        className="scroll-thin relative max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#121731] p-6 sm:rounded-[28px] sm:p-8"
      >
        <button type="button" onClick={onClose} className="absolute right-5 top-5 text-cts-mist"><X /></button>
        <h2 className="font-display text-2xl font-extrabold">{form._id ? "Modifier le produit" : "Ajouter une moto"}</h2>
        <p className="mt-2 text-xs text-cts-mist">Le visuel est enregistré directement dans le stockage sécurisé de Convex.</p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <Field label="Nom" value={form.name} onChange={(value: string) => set("name", value)} required />
          <Field label="Slug URL" value={form.slug} onChange={(value: string) => set("slug", value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))} required />
          <Field label="Catégorie / accroche" value={form.eyebrow || ""} onChange={(value: string) => set("eyebrow", value)} />

          <div className="sm:col-span-2">
            <p className="text-xs font-bold">Image principale *</p>
            <div className="mt-2 grid overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[.025] sm:grid-cols-[240px_1fr]">
              <div className="relative aspect-[4/3] bg-[#0b0f24] sm:aspect-auto sm:min-h-44">
                {previewUrl ? (
                  <img src={previewUrl} alt="Prévisualisation du produit" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-cts-mist">
                    <ImagePlus size={30} />
                    <span className="text-[10px] font-bold uppercase tracking-[.12em]">Aucun visuel</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center p-5">
                <p className="text-sm font-bold">Choisir le visuel de la moto</p>
                <p className="mt-2 text-xs leading-5 text-cts-mist">JPEG, PNG, WebP ou AVIF. Taille maximale : 8 Mo. Une image horizontale de bonne qualité est recommandée.</p>
                {imageFile && <p className="mt-3 truncate text-xs font-bold text-emerald-300">{imageFile.name} · {(imageFile.size / 1024 / 1024).toFixed(2)} Mo</p>}
                {!imageFile && form.imageStorageId && <p className="mt-3 text-xs font-bold text-emerald-300">Image déjà enregistrée dans Convex Storage</p>}
                <label className="mt-4 inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-extrabold transition hover:border-cts-red/40 hover:bg-cts-red/10">
                  <UploadCloud size={17} className="text-cts-red" />
                  {previewUrl ? "Remplacer l'image" : "Sélectionner une image"}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(event) => selectImage(event.target.files?.[0])} />
                </label>
              </div>
            </div>
          </div>

          <label className="text-xs font-bold sm:col-span-2">Description courte<textarea className="field mt-2 min-h-20" value={form.shortDescription} onChange={(event) => set("shortDescription", event.target.value)} required /></label>
          <label className="text-xs font-bold sm:col-span-2">Description complète<textarea className="field mt-2 min-h-28" value={form.description} onChange={(event) => set("description", event.target.value)} required /></label>
          {[["Prix FCFA", "priceCfa"], ["Ancien prix", "compareAtPriceCfa"], ["Acompte FCFA", "depositCfa"], ["Autonomie km", "rangeKm"], ["Vitesse km/h", "maxSpeedKmh"], ["Puissance W", "motorPowerW"], ["Charge heures", "chargeHours"], ["Places restantes", "remainingUnits"], ["Ordre", "sortOrder"]].map(([label, key]) => (
            <Field key={key} label={label} type="number" value={(form as any)[key] ?? ""} onChange={(value: string) => set(key as keyof ShopProduct, value === "" ? undefined : Number(value))} />
          ))}
          <Field label="Batterie" value={form.batteryLabel} onChange={(value: string) => set("batteryLabel", value)} required />
          <Field label="Groupage" value={form.groupLabel} onChange={(value: string) => set("groupLabel", value)} required />
          <Field label="Délai de livraison" value={form.deliveryEstimate} onChange={(value: string) => set("deliveryEstimate", value)} required />
          <label className="text-xs font-bold">Disponibilité<select className="field mt-2" value={form.availability} onChange={(event) => set("availability", event.target.value)}><option value="open">Ouvert</option><option value="limited">Places limitées</option><option value="closed">Fermé</option></select></label>
          <Field label="Couleurs (séparées par virgules)" value={form.colors.join(", ")} onChange={(value: string) => set("colors", value.split(",").map((item) => item.trim()).filter(Boolean))} />
          <Field label="Équipements (séparés par virgules)" value={form.features.join(", ")} onChange={(value: string) => set("features", value.split(",").map((item) => item.trim()).filter(Boolean))} />
          <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
            <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={form.published} onChange={(event) => set("published", event.target.checked)} className="accent-[#e6002d]" />Publié</label>
            <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={form.featured} onChange={(event) => set("featured", event.target.checked)} className="accent-[#e6002d]" />Mis en avant</label>
          </div>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-xl border border-white/15 px-5 py-3 text-xs font-bold disabled:opacity-50">Annuler</button>
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-cts-red px-5 py-3 text-xs font-extrabold shadow-glow disabled:opacity-60">
            {saving ? <><Loader2 className="animate-spin" size={15} /> Téléversement…</> : <><Save size={15} /> Enregistrer</>}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
function Field({label,value,onChange,type="text",required=false}:any){return <label className="text-xs font-bold">{label}<input type={type} required={required} className="field mt-2" value={value} onChange={(e)=>onChange(e.target.value)}/></label>}
