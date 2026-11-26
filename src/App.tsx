import {
  Leaf,
  ShieldCheck,
  TreePine,
  Droplets,
  Ruler,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ChevronRight,
  Lock,
  Fence,
  Hammer,
  Sprout,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AdminLoginModal = lazy(() => import("./components/AdminLoginModal"));
import { Toaster, toast } from "react-hot-toast";
import { FAQ } from "./seoContent";
import { FOOTER_GROUPS, HEADER_LINKS } from "./pages/nav";

const pageHref = (slug: string) => `${import.meta.env.BASE_URL}${slug}/`;

const HOME_PRODUCTS = [
  { slug: "produtos/mourao-de-eucalipto-tratado", name: "Mourão de eucalipto tratado", size: "2,20 m · 4 a 14 cm", desc: "A linha da cerca rural, do refugo ao super grosso, além de lasca." },
  { slug: "produtos/esticador-de-eucalipto-tratado", name: "Esticador de eucalipto tratado", size: "2,50 m · 10 a 32 cm", desc: "Para cantos, porteiras e pontos de tensão do arame." },
  { slug: "produtos/palanque-de-eucalipto-tratado", name: "Palanque de eucalipto tratado", size: "3,20 m a 7 m · 10 a 32 cm", desc: "Currais, mangueiras, porteiras e esteios de galpão." },
  { slug: "produtos/poste-de-eucalipto-tratado", name: "Poste de eucalipto tratado", size: "8 m a 12 m · 10 a 32 cm", desc: "Galpões, barracões, coberturas e estruturas de grande carga." },
  { slug: "produtos/vara-de-eucalipto-tratado", name: "Vara de eucalipto tratado", size: "2,50 m a 8 m · 4 a 12 cm", desc: "Pergolados, cercas leves, paisagismo e cultivo." },
  { slug: "produtos/madeira-serrada-de-eucalipto", name: "Madeira serrada de eucalipto", size: "Caibro, viga, prancha e ripa", desc: "Também ripão, balancim e esteira de bambu tratado." },
];

const getSupabase = async () => (await import("./supabase")).supabase;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
  }
}

export function handleSupabaseError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: SupabaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: undefined,
      email: undefined,
    },
    operationType,
    path
  }
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface GalleryItem {
  id: string;
  url: string;
  category: string;
  order: number;
  createdAt: Date;
}

export interface SiteImages {
  hero: string;
  about: string;
  sust1: string;
  medicao: string;
  promotion?: {
    id?: string;
    url: string;
    active: boolean;
    link?: string;
  };
  _allSiteContent?: {
    id: string;
    url: string;
    type: string;
    createdAt: Date;
    active?: boolean;
  }[];
  gallery: {
    rural: GalleryItem[];
    civil: GalleryItem[];
    paisagismo: GalleryItem[];
    ideias: GalleryItem[];
  };
}

const HERO_IMAGE = `${import.meta.env.BASE_URL}hero-800.webp`;
const HERO_IMAGE_480 = `${import.meta.env.BASE_URL}hero-480.webp`;
const HERO_IMAGE_1200 = `${import.meta.env.BASE_URL}hero-1200.webp`;
const CITRIODORA_IMAGE = `${import.meta.env.BASE_URL}citriodora-optimized.webp`;
const CITRIODORA_IMAGE_480 = `${import.meta.env.BASE_URL}citriodora-480.webp`;

const initialImages: SiteImages = {
  hero: HERO_IMAGE,
  about: CITRIODORA_IMAGE,
  sust1: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1964&auto=format&fit=crop",
  medicao: "https://images.unsplash.com/photo-1503387762-592dee58c160?q=80&w=2070&auto=format&fit=crop",
  gallery: {
    rural: [],
    civil: [],
    paisagismo: [],
    ideias: []
  }
};

const unsplashVariant = (source: string, width: number): string | null => {
  try {
    const url = new URL(source);
    if (url.hostname !== "images.unsplash.com") return null;
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", "60");
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    return url.toString();
  } catch {
    return null;
  }
};

// Keep the CMS photo while serving a correctly encoded, lightweight copy.
const optimizedStoredImage = (source: string) => {
  if (source.includes("/site/1782393303287-7hfx4.webp")) return CITRIODORA_IMAGE;
  if (source.includes("photo-1542273917363-3b1817f69a2d")) return HERO_IMAGE;
  return source;
};

const responsiveImage = (source: string, widths: number[]) => {
  const displaySource = optimizedStoredImage(source);
  if (displaySource === CITRIODORA_IMAGE) {
    return {
      src: CITRIODORA_IMAGE,
      srcSet: `${CITRIODORA_IMAGE_480} 480w, ${CITRIODORA_IMAGE} 640w`,
    };
  }
  if (displaySource === HERO_IMAGE) {
    return {
      src: HERO_IMAGE,
      srcSet: `${HERO_IMAGE_480} 480w, ${HERO_IMAGE} 800w, ${HERO_IMAGE_1200} 1200w`,
    };
  }
  return {
    src: unsplashVariant(displaySource, widths[Math.min(1, widths.length - 1)]) ?? displaySource,
    srcSet: unsplashVariant(displaySource, widths[0])
      ? widths.map(width => `${unsplashVariant(displaySource, width)} ${width}w`).join(", ")
      : undefined,
  };
};

const Logo = ({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="flex flex-col justify-between h-[24px] w-[28px]" aria-hidden="true">
      <div className="h-[5px] w-full bg-[#A1C913]"></div>
      <div className="h-[5px] w-full bg-[#A1C913]"></div>
      <div className="h-[5px] w-full bg-[#A1C913]"></div>
    </div>
    <div className="flex flex-col justify-center">
      <span className={`${tone === "light" ? "text-[#4a4037]" : "text-[#FDF8E7]"} font-black text-[19px] leading-[0.85] tracking-wide`} style={{ fontFamily: 'Arial, sans-serif' }}>EUCALYPTUS</span>
      <span className={`${tone === "light" ? "text-[#7d5a2f]" : "text-[#D8B990]"} text-[9px] font-normal tracking-[0.45em] leading-none ml-[2px] mt-[3px]`} style={{ fontFamily: 'Arial, sans-serif' }}>TRATADOS</span>
    </div>
  </div>
);

const PromotionModal = ({ promo, onClose }: { promo: NonNullable<SiteImages['promotion']>, onClose: () => void }) => {
  if (!promo.active || !promo.url) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative aspect-[4/5] w-full">
          <img
            src={promo.url}
            alt="Promoção"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#e9c46a] text-[#183e26] text-[10px] font-bold uppercase rounded">Destaque</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Confira nossa oferta especial!</h3>
            <div className="flex gap-3">
              <a
                href="https://wa.me/5518996354444"
                onClick={() => { if (typeof window !== "undefined" && (window as any).dataLayer) (window as any).dataLayer.push({ event: "whatsapp_click", source: "promotion" }); }}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#A1C913] hover:bg-[#8eb111] text-[#183e26] py-3 rounded-xl font-bold text-center transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Aproveitar Agora
              </a>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors backdrop-blur-md"
              >
                Depois
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [siteImages, setSiteImages] = useState<SiteImages>(initialImages);
  const [activeGalleryTab, setActiveGalleryTab] = useState<"rural" | "civil" | "paisagismo" | "ideias">("rural");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState({ site: false, gallery: false });

  // Visit tracking is intentionally delayed so it never competes with the hero.
  useEffect(() => {
    const trackVisit = async () => {
      // Only track once per session to avoid noise
      const hasVisited = sessionStorage.getItem('site_visited');
      if (hasVisited) return;

      try {
        let regionData = { region: 'Desconhecido', city: 'Desconhecido', country: 'Desconhecido' };
        try {
          // Using a free geolocation API with a timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

          const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            regionData = {
              region: data.region || 'Desconhecido',
              city: data.city || 'Desconhecido',
              country: data.country_name || 'Desconhecido'
            };
          }
        } catch (e) {
          console.warn('Could not fetch geolocation or timeout reached', e);
        }

        const supabase = await getSupabase();
        if (supabase) {
          await supabase.from('visits').insert([{
            user_agent: navigator.userAgent,
            ...regionData
          }]);
        }
        sessionStorage.setItem('site_visited', 'true');
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };

    const timer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => void trackVisit(), { timeout: 4000 });
      } else {
        void trackVisit();
      }
    }, 5000);

    return () => window.clearTimeout(timer);
  }, []);

  // Authentication is only needed for the restricted area, so initialize it
  // after the public hero has painted.
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;
    let cancelled = false;

    const initializeAuth = async () => {
      const supabase = await getSupabase();
      if (!supabase || cancelled) {
        setIsAuthReady(true);
        return;
      }

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const user = session?.user;
        if (user && user.email !== 'fazendajt@gmail.com') {
          void supabase.auth.signOut();
          setIsAdminLoggedIn(false);
          setUserEmail(undefined);
          toast.error("Acesso negado. Apenas o administrador autorizado pode acessar esta área.", {
            id: "auth-denied"
          });
        } else {
          setIsAdminLoggedIn(!!user);
          setUserEmail(user?.email);
        }
        setIsAuthReady(true);
      });
      subscription = data.subscription;
    };

    const timer = window.setTimeout(() => void initializeAuth(), 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      subscription?.unsubscribe();
    };
  }, []);

  const fetchSiteContent = async () => {
    try {
      console.log("Fetching site content from Supabase...");
      const supabase = await getSupabase();
      let docs: any[] = [];

      if (supabase) {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        docs = data.map(d => ({
          ...d,
          createdAt: new Date(d.created_at)
        }));
      } else {
        console.warn("Supabase client not initialized, cannot fetch site content.");
        setIsDataLoaded(prev => ({ ...prev, site: true }));
        return;
      }

      let latestImages: Partial<SiteImages> = {};
      const foundTypes = new Set();
      const foundActive = new Set();

      const allContent = docs.map((data: any) => {
        const type = data.type as keyof SiteImages;
        const item = {
          ...data,
          active: data.active || false
        };

        if (type === 'promotion') {
          if (data.active) {
            latestImages.promotion = {
              id: data.id,
              url: data.url,
              active: true,
              link: data.link
            };
          }
        } else if (type) {
          if (data.active) {
            if (!latestImages[type] || !foundActive.has(type)) {
              (latestImages as any)[type] = data.url;
              foundActive.add(type);
            }
          } else if (!foundActive.has(type) && !foundTypes.has(type)) {
            (latestImages as any)[type] = data.url;
            foundTypes.add(type);
          }
        }
        return item;
      });

      setSiteImages(prev => ({
        ...prev,
        ...latestImages,
        _allSiteContent: allContent
      }));
      setIsDataLoaded(prev => ({ ...prev, site: true }));
    } catch (error: any) {
      console.error("Error loading site content from Supabase:", error);
      setIsDataLoaded(prev => ({ ...prev, site: true }));
    }
  };

  const fetchGallery = async () => {
    try {
      console.log("Fetching gallery from Supabase...");
      const supabase = await getSupabase();
      let allItems: GalleryItem[] = [];

      if (supabase) {
        const { data, error } = await supabase
          .from('gallery')
          .select('*');

        if (error) throw error;
        allItems = data.map(d => ({
          ...d,
          createdAt: new Date(d.created_at),
          order: d.order ?? 999999
        }));
      } else {
        console.warn("Supabase client not initialized, cannot fetch gallery.");
        setIsDataLoaded(prev => ({ ...prev, gallery: true }));
        return;
      }

      const newGallery = {
        rural: [] as GalleryItem[],
        civil: [] as GalleryItem[],
        paisagismo: [] as GalleryItem[],
        ideias: [] as GalleryItem[],
      };

      allItems.sort((a: any, b: any) => {
        if (a.order !== b.order) return a.order - b.order;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      allItems.forEach(item => {
        if (item.category in newGallery) {
          (newGallery as any)[item.category].push(item);
        }
      });

      setSiteImages(prev => ({
        ...prev,
        gallery: newGallery
      }));
      setIsDataLoaded(prev => ({ ...prev, gallery: true }));
    } catch (error: any) {
      console.error("Error loading gallery:", error);
      if (error?.message?.includes("Quota exceeded")) {
        toast.error("Limite de visualizações da galeria atingido por hoje.", {
          duration: 10000,
          id: "quota-error-gallery"
        });
      }
      setIsDataLoaded(prev => ({ ...prev, gallery: true }));
    }
  };

  useEffect(() => {
    const contentTimer = window.setTimeout(() => void fetchSiteContent(), 600);
    const galleryTimer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => void fetchGallery(), { timeout: 4000 });
      } else {
        void fetchGallery();
      }
    }, 2200);

    return () => {
      window.clearTimeout(contentTimer);
      window.clearTimeout(galleryTimer);
    };
  }, []);

  const [isPromoOpen, setIsPromoOpen] = useState(false);

  useEffect(() => {
    if (isDataLoaded.site && siteImages.promotion?.active) {
      const hasSeenPromo = sessionStorage.getItem('promo_seen');
      if (!hasSeenPromo) {
        const timer = setTimeout(() => {
          setIsPromoOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isDataLoaded.site, siteImages.promotion]);

  const handleClosePromo = () => {
    setIsPromoOpen(false);
    sessionStorage.setItem('promo_seen', 'true');
  };

  const handleLogout = async () => {
    try {
      const supabase = await getSupabase();
      if (supabase) {
        await supabase.auth.signOut();
      }
      setIsAdminLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isAdminLoggedIn && isAuthReady) {
    return (
      <>
        <Toaster position="top-right" />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Abrindo painel...</div>}>
          <AdminDashboard
            onLogout={handleLogout}
            siteImages={siteImages}
            setSiteImages={setSiteImages}
            refreshSiteContent={fetchSiteContent}
            refreshGallery={fetchGallery}
            userEmail={userEmail}
          />
        </Suspense>
      </>
    );
  }

  // Mola criticamente amortecida (sem overshoot), como nas interfaces da Apple
  const fadeIn = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { type: "spring" as const, bounce: 0, duration: 0.8 },
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen text-[#1d1d1f]">

      <AnimatePresence>
        {isPromoOpen && siteImages.promotion && (
          <PromotionModal promo={siteImages.promotion} onClose={handleClosePromo} />
        )}
      </AnimatePresence>


      <Toaster position="top-right" />
      {/* Navigation: material translúcido claro */}
      <nav className="ap-nav fixed top-0 w-full z-50">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="flex justify-between h-14 items-center">
            <a href={import.meta.env.BASE_URL} aria-label="Eucalyptus Tratados, página inicial" className="flex-shrink-0 flex items-center">
              <Logo tone="light" />
            </a>

            <div className="hidden lg:flex gap-7 items-center">
              {HEADER_LINKS.map((link) => (
                <a key={link.slug} href={pageHref(link.slug)} className="ap-nav-link">
                  {link.name}
                </a>
              ))}
              <a href="#contato" className="ap-pill">
                Orçamento
              </a>
            </div>

            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#1d1d1f] p-2.5 -mr-2.5 rounded-lg"
                aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden px-5 pb-6 pt-2"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            >
              {HEADER_LINKS.map((link) => (
                <a
                  key={link.slug}
                  href={pageHref(link.slug)}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 text-[1.5rem] font-semibold tracking-[-0.015em] text-[#1d1d1f] border-b border-black/5"
                >
                  {link.name}
                </a>
              ))}
              <a href="#contato" onClick={() => setIsMenuOpen(false)} className="ap-pill mt-5 w-full">
                Pedir orçamento
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main id="main-content">
      {/* Hero */}
      <section id="sobre" className="relative min-h-[100svh] flex items-center pt-24 pb-20 overflow-hidden">
        {siteImages.hero !== initialImages.hero && (
          <div className="absolute inset-0 z-0">
            <img
              {...responsiveImage(siteImages.hero, [480, 800, 1200, 1600])}
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        )}

        <div className="max-w-[1080px] mx-auto px-5 sm:px-6 relative z-10 w-full">
          <motion.div
            className="text-center max-w-[820px] mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.8 }}
          >
            <p className="text-[1.0625rem] sm:text-[1.1875rem] font-semibold text-[#A1C913] mb-4 tracking-[-0.005em]">
              Desde 1992 em Laranjal Paulista
            </p>
            <h1 className="ap-h1 text-white mb-6">
              Eucalipto Citriodora Tratado
            </h1>
            <p className="ap-lead !text-[#e8e8ed] max-w-[680px] mx-auto mb-10">
              A Eucalyptus Tratados, em Laranjal Paulista (SP), fornece postes,
              mourões, palanques e madeira serrada de eucalipto citriodora
              tratado em autoclave com CCA, conforme a ABNT NBR 9480, com 10
              anos de garantia.
            </p>
            <div className="flex flex-col sm:flex-row gap-x-8 gap-y-3 justify-center items-center">
              <a href="#contato" className="ap-pill ap-pill-lime">
                Pedir orçamento
              </a>
              <a href={pageHref("produtos")} className="ap-link !text-white">
                Ver produtos e medidas
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Números */}
      <section className="py-16 sm:py-20 bg-white" aria-label="A Eucalyptus Tratados em números">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {[
            { n: "30+", l: "anos de experiência no mercado" },
            { n: "10 anos", l: "de garantia nos produtos" },
            { n: "100%", l: "madeira de reflorestamento" },
          ].map((s) => (
            <motion.div key={s.n} {...fadeIn}>
              <div className="text-[clamp(2.75rem,6vw,4rem)] font-semibold tracking-[-0.03em] leading-none text-[#1d1d1f]">{s.n}</div>
              <div className="ap-body mt-3">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Produtos */}
      <section id="produtos" className="ap-section ap-alt">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <motion.div className="text-center max-w-[760px] mx-auto mb-14" {...fadeIn}>
            <p className="ap-eyebrow mb-3">Linha completa</p>
            <h2 className="ap-h2 mb-5">
              Produtos de Eucalipto Citriodora Tratado
            </h2>
            <p className="ap-lead">
              Peças roliças e serradas tratadas em autoclave, com medidas pela
              NBR 9480 e 10 anos de garantia. Veja medidas e pesos de cada linha.
            </p>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_PRODUCTS.map((product) => (
              <a key={product.slug} href={pageHref(product.slug)} className="ap-card group flex flex-col">
                <div className="text-[.9375rem] text-[#6e6e73] mb-2">{product.size}</div>
                <h3 className="ap-h3 mb-3">{product.name}</h3>
                <p className="ap-body mb-6 flex-1">{product.desc}</p>
                <span className="ap-link !py-0">Ver medidas</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Citriodora */}
      <section id="citriodora" className="ap-section bg-white">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <motion.div {...fadeIn}>
              <p className="ap-eyebrow mb-3">A espécie mais resistente do Brasil</p>
              <h2 className="ap-h2 mb-6">
                Por que trabalhamos com Eucalyptus Citriodora?
              </h2>
              <p className="ap-lead mb-8">
                O Eucalyptus Citriodora é reconhecido como a espécie mais
                resistente e durável do mercado brasileiro. Suas características
                únicas o tornam a escolha ideal para tratamento em autoclave.
              </p>
              <ul className="ap-rows">
                {[
                  "Fibras retorcidas que aumentam a resistência estrutural",
                  "Maior resistência a trincas e rachaduras",
                  "Melhor absorção do tratamento preservativo CCA",
                  "Durabilidade superior a 20-30 anos, em contato com solo (Padrão ABNT, NBR 9480)",
                  "Laudos de tratamento aprovado pelo IPT (Instituto de Pesquisas Tecnológicas)",
                  "Densidade e resistência mecânica superiores",
                  "Ideal para uso em ambientes externos e rurais",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 py-3.5 text-[1.0625rem] text-[#1d1d1f]">
                    <CheckCircle2 className="h-5 w-5 mt-[3px] text-[#2f6b3f] flex-shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6">
                <a href={pageHref("eucalipto-citriodora")} className="ap-link">Por que o citriodora racha menos que outros eucaliptos</a>
              </p>
            </motion.div>

            <motion.div className="ap-media relative aspect-[4/5] lg:aspect-[4/5]" {...fadeIn}>
              <img
                {...responsiveImage(siteImages.about, [480, 800, 1200])}
                sizes="(min-width: 1024px) 50vw, 100vw"
                loading="lazy"
                decoding="async"
                alt="Carga de toras de eucalipto citriodora tratado em autoclave com CCA"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Processo */}
      <section id="processo" className="ap-section ap-alt">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <motion.div className="text-center max-w-[760px] mx-auto mb-14" {...fadeIn}>
            <p className="ap-eyebrow mb-3">Quatro etapas, sem atalhos</p>
            <h2 className="ap-h2 mb-5">
              Processo de Tratamento em Autoclave
            </h2>
            <p className="ap-lead">
              Nosso processo de imunização segue rigorosamente as normas ABNT e
              NBR 9480, garantindo máxima proteção contra cupins, fungos e
              umidade.
            </p>
          </motion.div>

          <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { title: "Seleção e Preparo", desc: "Eucalipto Citriodora selecionado de áreas certificadas. Madeira cortada sob medida e descascada artesanalmente." },
              { title: "Secagem", desc: "30 a 60 dias de secagem controlada ao ar livre para atingir o nível ideal de umidade antes do tratamento." },
              { title: "Autoclave (Célula Cheia)", desc: "Remoção do ar e umidade das células. Alta pressão de até 18 kg/cm² para injeção do preservativo CCA." },
              { title: "Fixação e Garantia", desc: "20 dias de repouso para fixação completa. Eucalipto tratado com 10 anos de garantia, pronto para uso." },
            ].map((step, index) => (
              <motion.li
                key={step.title}
                className="ap-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", bounce: 0, duration: 0.7, delay: index * 0.06 }}
              >
                <div className="text-[2.5rem] font-semibold tracking-[-0.03em] leading-none text-[#2f6b3f] mb-6" aria-hidden="true">{index + 1}</div>
                <h3 className="ap-h3 mb-3">{step.title}</h3>
                <p className="ap-body">{step.desc}</p>
              </motion.li>
            ))}
          </ol>
          <p className="text-center mt-10">
            <a href={pageHref("tratamento-em-autoclave")} className="ap-link">Veja o processo completo de tratamento em autoclave</a>
          </p>
        </div>
      </section>

      {/* Normas (seção escura) */}
      <section id="normas" className="ap-section ap-dark">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <motion.div {...fadeIn}>
              <p className="ap-eyebrow mb-3 flex items-center gap-2"><Ruler className="h-5 w-5" aria-hidden="true" /> Medida honesta</p>
              <h2 className="ap-h2 mb-6">
                Padrão ABNT NBR 9480
              </h2>
              <p className="ap-lead mb-8">
                Todas as nossas medidas seguem rigorosamente a norma ABNT NBR
                9480 para medição de postes de madeira.
              </p>
              <div className="ap-rows">
                {[
                  { t: "Medição pelo Topo", d: "Esta é a medida de venda. Sempre medimos pelo diâmetro da ponta mais fina do poste (topo), seguindo a NBR 9480." },
                  { t: "Variação da Base", d: "A base é naturalmente mais grossa e varia conforme o crescimento da árvore. Não é usada como medida padrão." },
                  { t: "Laudos IPT", d: "Nossos laudos de tratamento são aprovados pelo IPT (Instituto de Pesquisas Tecnológicas), garantindo a eficácia da imunização." },
                ].map((item) => (
                  <div key={item.t} className="py-5">
                    <h3 className="ap-h3 !text-[1.1875rem] mb-1.5">{item.t}</h3>
                    <p className="ap-body">{item.d}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6">
                <a href={pageHref("norma-nbr-9480")} className="ap-link">Como medir postes e mourões pela NBR 9480</a>
              </p>
            </motion.div>
            <motion.div className="ap-media !bg-white/5 aspect-[4/3]" {...fadeIn}>
              <img
                {...responsiveImage(siteImages.medicao, [480, 800, 1200])}
                sizes="(min-width: 1024px) 50vw, 100vw"
                loading="lazy"
                decoding="async"
                alt="Medição de poste de eucalipto pelo diâmetro do topo, conforme a NBR 9480"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compromisso ambiental */}
      <section className="ap-section bg-white">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <motion.div className="ap-media aspect-[16/11] order-last lg:order-first" {...fadeIn}>
              <img
                {...responsiveImage(siteImages.sust1, [480, 800, 1200])}
                sizes="(min-width: 1024px) 50vw, 100vw"
                loading="lazy"
                decoding="async"
                alt="Área de reflorestamento de eucalipto"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.div {...fadeIn}>
              <p className="ap-eyebrow mb-3 flex items-center gap-2"><Leaf className="h-5 w-5" aria-hidden="true" /> Reflorestamento</p>
              <h2 className="ap-h2 mb-6">
                Compromisso Ambiental
              </h2>
              <p className="ap-lead mb-8">
                Toda nossa madeira é proveniente de áreas de reflorestamento
                certificadas, contribuindo para a preservação do meio ambiente.
              </p>
              <ul className="ap-rows">
                {[
                  "Madeira 100% de áreas de reflorestamento certificadas",
                  "Recurso renovável com ciclo sustentável do cultivo à colheita",
                  "Retira e retém dióxido de carbono da atmosfera",
                  "Diminui a pressão sobre matas nativas brasileiras",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 py-3.5 text-[1.0625rem] text-[#1d1d1f]">
                    <CheckCircle2 className="h-5 w-5 mt-[3px] text-[#2f6b3f] flex-shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section id="galeria" className="ap-section ap-alt">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <motion.div className="text-center max-w-[760px] mx-auto mb-10" {...fadeIn}>
            <h2 className="ap-h2 mb-5">
              Nossa Estrutura e Produtos
            </h2>
            <p className="ap-lead">
              Conheça um pouco mais sobre o nosso processo de tratamento e a
              qualidade da madeira que entregamos.
            </p>
          </motion.div>

          <div className="flex justify-center mb-10">
            <div className="ap-segmented" role="group" aria-label="Categorias de fotos">
              {[
                { id: "rural", label: "Construção Rural" },
                { id: "civil", label: "Construção Civil" },
                { id: "paisagismo", label: "Paisagismo" },
                { id: "ideias", label: "Nossas Madeiras" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={activeGalleryTab === tab.id}
                  onClick={() => setActiveGalleryTab(tab.id as any)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {siteImages.gallery[activeGalleryTab].map((item, idx) => (
              <motion.div
                key={item.id}
                className="relative aspect-square rounded-[22px] overflow-hidden bg-white"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", bounce: 0, duration: 0.6, delay: idx * 0.04 }}
              >
                <img
                  src={item.url}
                  loading="lazy"
                  decoding="async"
                  alt={`Eucalipto citriodora tratado em ${({ rural: "construção rural", civil: "construção civil", paisagismo: "paisagismo", ideias: "projetos" } as const)[activeGalleryTab]}, foto ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
            {siteImages.gallery[activeGalleryTab].length === 0 && (
              <div className="col-span-full py-12 text-center ap-body">
                Nenhuma imagem nesta categoria.
              </div>
            )}
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-x-10 gap-y-1 justify-center items-center">
            <a href={pageHref("cerca-de-eucalipto-tratado")} className="ap-link">Guia: como fazer cerca de eucalipto tratado</a>
            <a href={pageHref("construcoes-com-eucalipto-tratado")} className="ap-link">Galpões, currais e pergolados com eucalipto</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="perguntas" className="ap-section bg-white">
        <div className="max-w-[820px] mx-auto px-5 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="ap-h2 mb-5">
              Perguntas Frequentes sobre Eucalipto Tratado
            </h2>
            <p className="ap-lead">
              Tudo o que você precisa saber antes de comprar postes, mourões e
              madeira de eucalipto citriodora tratado.
            </p>
          </div>
          <div className="ap-faq">
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>
                  <h3>{item.q}</h3>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <p className="text-center mt-8">
            <a href={pageHref("perguntas-frequentes")} className="ap-link">
              Ver todas as perguntas frequentes
            </a>
          </p>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="ap-section ap-alt">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div {...fadeIn}>
              <p className="ap-eyebrow mb-3">Resposta rápida pelo WhatsApp</p>
              <h2 className="ap-h2 mb-6">
                Solicite seu Orçamento
              </h2>
              <p className="ap-lead mb-10">
                Preencha o formulário ou entre em contato diretamente. Nossa
                equipe está pronta para atender você com as melhores soluções em
                eucalipto tratado.
              </p>

              <div className="ap-rows">
                {[
                  { href: "https://wa.me/5515996854945", label: "Telefone / WhatsApp", value: "(15) 3283-1253 / (15) 99685-4945", icon: <Phone className="h-5 w-5" />, wa: true },
                  { href: "mailto:vendas@eucalyptustratados.com.br", label: "Email", value: "vendas@eucalyptustratados.com.br", icon: <Mail className="h-5 w-5" /> },
                  { href: "https://maps.app.goo.gl/6pimRc4R7dyMVghZ7?g_st=ic", label: "Endereço", value: "Estrada do Moinho Km 2.1, Laranjal Paulista", icon: <MapPin className="h-5 w-5" /> },
                ].map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onClick={c.wa ? () => { if (typeof window !== "undefined" && (window as any).dataLayer) (window as any).dataLayer.push({ event: "whatsapp_click", source: "contact_section" }); } : undefined}
                    className="flex items-center gap-4 py-4 group"
                  >
                    <span className="text-[#2f6b3f]" aria-hidden="true">{c.icon}</span>
                    <span>
                      <span className="block text-[.9375rem] text-[#6e6e73]">{c.label}</span>
                      <span className="block text-[1.0625rem] font-semibold text-[#1d1d1f] group-hover:underline underline-offset-4 [overflow-wrap:anywhere]">{c.value}</span>
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div className="bg-white p-7 sm:p-10 rounded-[28px]" {...fadeIn}>
              <form
                className="space-y-5"
                action="https://formsubmit.co/madeiratratada@icloud.com"
                method="POST"
                onSubmit={() => {
                  if (typeof window !== 'undefined' && (window as any).dataLayer) {
                    (window as any).dataLayer.push({ event: 'form_submit_attempt', form_name: 'orcamento' });
                  }
                }}
              >
                {/* Configurações do FormSubmit */}
                <input type="hidden" name="_subject" value="Novo Orçamento pelo Site!" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_cc" value="contatoeucaliptotratado@gmail.com" />

                <div>
                  <label htmlFor="nome" className="ap-label">Nome Completo</label>
                  <input type="text" id="nome" name="nome" autoComplete="name" required className="ap-input" placeholder="Seu nome" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="telefone" className="ap-label">Telefone / WhatsApp</label>
                    <input type="tel" id="telefone" name="telefone" autoComplete="tel" required className="ap-input" placeholder="(15) 99685-4945" />
                  </div>
                  <div>
                    <label htmlFor="email" className="ap-label">Email</label>
                    <input type="email" id="email" name="email" autoComplete="email" required className="ap-input" placeholder="seu@email.com" />
                  </div>
                </div>
                <div>
                  <label htmlFor="cidade" className="ap-label">Cidade</label>
                  <input type="text" id="cidade" name="cidade" autoComplete="address-level2" required className="ap-input" placeholder="Sua cidade" />
                </div>
                <div>
                  <label htmlFor="mensagem" className="ap-label">Mensagem</label>
                  <textarea id="mensagem" name="mensagem" required rows={4} className="ap-input resize-none" placeholder="Descreva o que você precisa... (medidas, quantidade, aplicação)"></textarea>
                </div>
                <button type="submit" className="ap-pill w-full !min-h-[52px]">
                  Enviar pedido de orçamento
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      </main>
      {/* Rodapé claro */}
      <footer className="ap-footer py-12">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo tone="light" />
              <p className="mt-4">Estrada do Moinho Km 2.1<br />Laranjal Paulista - SP</p>
              <p className="mt-2 flex flex-col items-start">
                <a href="https://wa.me/5515996854945">WhatsApp (15) 99685-4945</a>
                <a href="tel:+551532831253">Tel. (15) 3283-1253</a>
                <a className="[overflow-wrap:anywhere]" href="mailto:vendas@eucalyptustratados.com.br">vendas@eucalyptustratados.com.br</a>
              </p>
            </div>
            {FOOTER_GROUPS.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2>{group.title}</h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.slug}>
                      <a href={pageHref(link.slug)}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="mt-10 pt-5 border-t border-[#d2d2d7] flex flex-col md:flex-row justify-between items-center gap-3 text-[.8125rem]">
            <div>Qualidade e confiabilidade desde 1992</div>
            <div className="flex items-center gap-2">
              © 2026 Eucalyptus Tratados. Todos os direitos reservados.
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="opacity-70 hover:opacity-100 transition-opacity p-2 -m-1" aria-label="Acesso restrito"
                title="Acesso Restrito"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {isLoginModalOpen && (
        <Suspense fallback={null}>
          <AdminLoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={() => setIsAdminLoggedIn(true)}
          />
        </Suspense>
      )}


      {/* Floating WhatsApp Button */}
      <aside aria-label="Contato rápido pelo WhatsApp">
      <a
        href="https://wa.me/5515996854945?text=Olá! Gostaria de solicitar um orçamento."
        onClick={(e) => {
          e.preventDefault();
          if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({ event: 'whatsapp_click', source: 'floating_button' });
          }
          window.open('https://wa.me/5515996854945?text=Olá! Gostaria de solicitar um orçamento.', '_blank');
        }}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#1ebe5b] transition-transform duration-100 active:scale-95 flex items-center justify-center group"
        aria-label="Falar com um vendedor no WhatsApp"
        title="Falar com um vendedor"
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          className="w-6 h-6"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span className="absolute right-full mr-3 bg-white text-stone-900 px-3 py-1 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-stone-100 pointer-events-none">
          Falar com um vendedor
        </span>
      </a>
      </aside>
    </div>
    </MotionConfig>
  );
}
