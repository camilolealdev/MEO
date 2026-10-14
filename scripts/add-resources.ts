// Inserta `resources:` en el frontmatter de cada MDX de content/frameworks.
// Idempotente: si ya tiene resources, lo omite.
import fs from "node:fs";
import path from "node:path";

const R = {
  gsc: ["Google Search Central", "https://developers.google.com/search", "Documentación oficial de SEO de Google"],
  starter: ["Guía de inicio de SEO (Google)", "https://developers.google.com/search/docs/fundamentals/seo-starter-guide"],
  howsearch: ["Cómo funciona la Búsqueda de Google", "https://developers.google.com/search/docs/fundamentals/how-search-works"],
  gscAbout: ["Google Search Console", "https://search.google.com/search-console/about", "Mide tu presencia en los resultados de Búsqueda"],
  searchblog: ["Blog oficial de Google Search", "https://developers.google.com/search/blog", "Novedades de Búsqueda y la Search API"],
  schema: ["Schema.org", "https://schema.org/", "Vocabulario estándar de datos estructurados"],
  gStructured: ["Datos estructurados (Google)", "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data"],
  moz: ["Beginner's Guide to SEO (Moz)", "https://moz.com/beginners-guide-to-seo", "La guía clásica de SEO, gratuita"],
  ahrefs: ["Ahrefs SEO Basics", "https://ahrefs.com/seo/seo-basics"],
  ahrefsBlog: ["Blog de Ahrefs", "https://ahrefs.com/blog/"],
  ahrefsCourse: ["Curso gratuito de SEO (Ahrefs Academy)", "https://ahrefs.com/academy/seo-training-course"],
  semrush: ["Semrush Blog", "https://www.semrush.com/blog/"],
  gads: ["Centro de ayuda de Google Ads", "https://support.google.com/google-ads/supporthub?hl=en"],
  metaBusiness: ["Meta for Business", "https://www.facebook.com/business"],
  metaHelp: ["Centro de ayuda de Meta Business", "https://www.facebook.com/business/help/support"],
  ga: ["Ayuda de Google Analytics", "https://support.google.com/analytics"],
  gaDev: ["Google Analytics Developer docs", "https://developers.google.com/analytics"],
  tagmanager: ["Google Tag Manager", "https://developers.google.com/tag-manager"],
  nng: ["Artículos de NN/g", "https://www.nngroup.com/articles/"],
  nngMethods: ["Qué métodos de investigación UX usar (NN/g)", "https://www.nngroup.com/articles/which-ux-research-methods/"],
  nngTopic: ["Research methods (NN/g)", "https://www.nngroup.com/topic/research-methods/"],
  ama: ["American Marketing Association", "https://www.ama.org/"],
  amaTopic: ["Recursos de estrategia de marketing (AMA)", "https://www.ama.org/topics/marketing-strategy/"],
  amaFrameworks: ["Marketing frameworks, modelos y ejemplos (AMA)", "https://www.ama.org/marketing-news/ultimate-guide-to-marketing-frameworks-models-examples-and-step-by-step-applications/"],
  amaNews: ["Marketing News (AMA)", "https://www.ama.org/marketing-news/"],
  hubspotCourse: ["Inbound Marketing (HubSpot Academy)", "https://academy.hubspot.com/courses/inbound_marketing"],
  hubspotDigital: ["Digital Marketing (HubSpot Academy)", "https://academy.hubspot.com/courses/digital_marketing"],
  hubspotBlog: ["Blog de marketing de HubSpot", "https://blog.hubspot.com/marketing"],
  hubspotAcademy: ["Catálogo de cursos (HubSpot Academy)", "https://academy.hubspot.com/courses"],
  cmi: ["Content Marketing Institute", "https://contentmarketinginstitute.com/"],
  buffer: ["Recursos de Buffer", "https://buffer.com/resources/"],
  wai: ["W3C Web Accessibility Initiative", "https://www.w3.org/WAI/"],
  c2pa: ["C2PA / Content Credentials", "https://c2pa.org/", "Estándar abierto de procedencia de contenido"],
  w3c: ["W3C", "https://www.w3.org/"],
  mailchimp: ["Recursos de marketing (Mailchimp)", "https://mailchimp.com/"],
  iab: ["IAB", "https://www.iab.com/"],
  fbGraph: ["Marketing API de Meta (developers)", "https://developers.facebook.com/docs/marketing-api/"],
  linkedin: ["LinkedIn Marketing Solutions", "https://business.linkedin.com/marketing-solutions"],
  salesforce: ["Recursos de marketing (Salesforce)", "https://www.salesforce.com/marketing/"],
  copyblogger: ["Copyblogger", "https://copyblogger.com/"],
  ctia: ["Wikipedia: Call-to-action", "https://en.wikipedia.org/wiki/Call_to_action"],
  idf: ["Interaction Design Foundation", "https://www.interaction-design.org/"],
  contentmarketing: ["Wikipedia: Content marketing", "https://en.wikipedia.org/wiki/Content_marketing"],
  fourPs: ["Wikipedia: Marketing mix (4Ps)", "https://en.wikipedia.org/wiki/Marketing_mix"],
  modelo7p: ["Wikipedia: Extended marketing mix (7Ps)", "https://en.wikipedia.org/wiki/Marketing_mix#Extended_marketing_mix"],
  jarvis: ["Wikipedia: AIDA", "https://en.wikipedia.org/wiki/AIDA_(marketing)"],
  carolyn: ["Wikipedia: StoryBrand", "https://en.wikipedia.org/wiki/StoryBrand"],
  tonyrobbins: ["Wikipedia: Customer centricity", "https://en.wikipedia.org/wiki/Customer_centricity"],
  porter: ["Wikipedia: Porter's Five Forces", "https://en.wikipedia.org/wiki/Porter%27s_five_forces"],
  blueOcean: ["Wikipedia: Blue Ocean Strategy", "https://en.wikipedia.org/wiki/Blue_Ocean_Strategy"],
  jtbd: ["Wikipedia: Jobs to be done", "https://en.wikipedia.org/wiki/Jobs_to_be_done"],
  bcg: ["Wikipedia: Growth–share matrix (BCG)", "https://en.wikipedia.org/wiki/Growth%E2%80%93share_matrix"],
  ansoff: ["Wikipedia: Ansoff Matrix", "https://en.wikipedia.org/wiki/Ansoff_Matrix"],
  permat: ["Wikipedia: PESTLE analysis", "https://en.wikipedia.org/wiki/PESTLE_analysis"],
  swot: ["Wikipedia: SWOT analysis", "https://en.wikipedia.org/wiki/SWOT_analysis"],
  stp: ["Wikipedia: Segmentation, targeting and positioning", "https://en.wikipedia.org/wiki/Segmentation,_targeting_and_positioning"],
  dilts: ["Wikipedia: Levels of belief (Dilts)", "https://en.wikipedia.org/wiki/Robert_Dilts_logical_levels"],
  storyt: ["Wikipedia: Storytelling", "https://en.wikipedia.org/wiki/Storytelling"],
  leadGen: ["Wikipedia: Lead generation", "https://en.wikipedia.org/wiki/Lead_generation"],
  linkedinB2b: ["Wikipedia: Account-based marketing", "https://en.wikipedia.org/wiki/Account-based_marketing"],
  freemium: ["Wikipedia: Freemium", "https://en.wikipedia.org/wiki/Freemium"],
  ycombinator: ["Wikipedia: Growth hacking", "https://en.wikipedia.org/wiki/Growth_hacking"],
  referral: ["Wikipedia: Referral marketing", "https://en.wikipedia.org/wiki/Referral_marketing"],
  nft: ["Wikipedia: Scarcity (marketing)", "https://en.wikipedia.org/wiki/Scarcity_(marketing)"],
  llms: ["Wikipedia: Large language model", "https://en.wikipedia.org/wiki/Large_language_model"],
  spamBrain: ["Google: Spam policies for webmasters", "https://developers.google.com/search/docs/essentials/spam-policies"],
  structuredVoice: ["Google: Speakable structured data", "https://developers.google.com/search/docs/appearance/structured-data/speakable"],
  wcag: ["WAI: Web Content Accessibility Guidelines (WCAG)", "https://www.w3.org/WAI/standards-guidelines/wcag/"],
  erisa: ["Wikipedia: Voice search optimization", "https://en.wikipedia.org/wiki/Voice_search"],
  brandRep: ["Wikipedia: Online reputation management", "https://en.wikipedia.org/wiki/Online_reputation_management"],
  webPerf: ["web.dev", "https://web.dev/"],
  privacyAds: ["Google Ads policies", "https://support.google.com/google-ads/answer/1361344"],
  trendReport: ["Tendencias de marketing (AMA)", "https://www.ama.org/topic/digital-marketing/"],
  martech: ["Chief Marketing Technologist (martech.org)", "https://martech.org/"],
  experiment: ["Wikipedia: A/B testing", "https://en.wikipedia.org/wiki/A/B_testing"],
  analyticsPredict: ["Wikipedia: Predictive analytics", "https://en.wikipedia.org/wiki/Predictive_analytics"],
  consent: ["Wikipedia: Consent management", "https://en.wikipedia.org/wiki/Consent_management"],
  googleAnalytics4: ["Google Analytics 4 (Ayuda)", "https://support.google.com/analytics/answer/10089681"],
  brandLift: ["Wikipedia: Brand equity", "https://en.wikipedia.org/wiki/Brand_equity"],
  socialProof: ["Wikipedia: Social proof", "https://en.wikipedia.org/wiki/Social_proof"],
  onlineComm: ["Wikipedia: Online community", "https://en.wikipedia.org/wiki/Online_community"],
  partnerships: ["Wikipedia: Strategic alliance", "https://en.wikipedia.org/wiki/Strategic_alliance"],
  clientLifecycle: ["Wikipedia: Customer lifecycle", "https://en.wikipedia.org/wiki/Customer_lifecycle"],
  youtube: ["YouTube (Ayuda)", "https://support.google.com/youtube/"],
  seoAgent: ["Wikipedia: Web crawler", "https://en.wikipedia.org/wiki/Web_crawler"],
  checklist: ["Google: SEO starter checklist", "https://developers.google.com/search/docs/fundamentals/seo-starter-guide"],
  wordOfMouth: ["Wikipedia: Word-of-mouth marketing", "https://en.wikipedia.org/wiki/Word-of-mouth_marketing"],
  viral: ["Wikipedia: Viral marketing", "https://en.wikipedia.org/wiki/Viral_marketing"],
  popups: ["Wikipedia: Growth loop", "https://en.wikipedia.org/wiki/Growth_loop"],
  revOps: ["Wikipedia: Revenue operations", "https://en.wikipedia.org/wiki/Revenue_operations"],
} as const;

type Key = keyof typeof R;
type Res = readonly [string, string] | readonly [string, string, string];

// Slug (sin el prefijo numérico-tema) -> claves de recursos
const MAP: Record<string, Key[]> = {
  // ---------- core-meo ----------
  "seo-search-engine-optimization": ["gsc", "starter", "moz"],
  "aeo-answer-engine-optimization": ["searchblog", "llms"],
  "aio-artificial-intelligence-optimization": ["searchblog", "howsearch"],
  "geo-geoposicionamiento-ia-local": ["gsc", "metaBusiness"],
  "llmo-llm-optimization": ["llms", "searchblog"],
  "llmo-large-language-model-optimization": ["llms", "searchblog"],
  "sem-search-engine-marketing": ["gads", "metaBusiness"],
  "uxo-user-experience-optimization": ["nng", "nngMethods"],
  "sxo-search-experience-optimization": ["nng", "webPerf"],

  // ---------- estrategico ----------
  "aidaaidar-model": ["jarvis", "amaFrameworks"],
  "stp": ["stp", "amaFrameworks"],
  "stp-model-segmentation-targeting-positioning": ["stp", "amaFrameworks"],
  "7ps9ps": ["fourPs", "modelo7p"],
  "7ps9ps-marketing-mix": ["fourPs", "modelo7p"],
  "sostac": ["amaTopic", "amaFrameworks"],
  "sostac-framework": ["amaTopic", "amaFrameworks"],
  "peso": ["permat", "amaFrameworks"],
  "peso-model-paid-earned-shared-owned": ["permat", "amaFrameworks"],
  "aarrr": ["ycombinator", "amaFrameworks"],
  "aarrr-framework-pirate-metrics": ["ycombinator", "amaFrameworks"],
  "race": ["amaTopic", "amaFrameworks"],
  "race-framework": ["amaTopic", "amaFrameworks"],
  "flywheel": ["hubspotBlog", "amaFrameworks"],
  "flywheel-model": ["hubspotBlog", "amaFrameworks"],
  "north-star-metric-nsm": ["amaTopic", "amaFrameworks"],

  // ---------- emergente (SEO) ----------
  "entity-seo": ["gStructured", "gsc"],
  "multi-modal-seo-mum": ["searchblog", "howsearch"],
  "gseo": ["searchblog", "gsc"],
  "gseo-generative-search-engine-optimization": ["searchblog", "gsc"],
  "hyper-intelligence-seo": ["searchblog", "howsearch"],
  "visual-seo-arvr-optimization": ["gStructured", "webPerf"],
  "voice-search-optimization-vso": ["structuredVoice", "erisa"],
  "cro-conversion-rate-optimization": ["experiment", "nng"],
  "brand-reputation-seo": ["brandRep", "gsc"],
  "tangential-seo": ["ahrefsBlog", "semrush"],
  "privacy-first-seo": ["privacyAds", "consent"],
  "blockchain-seo": ["spamBrain", "gsc"],
  "alternative-search-optimization": ["searchblog", "llms"],
  "vibe-marketing": ["trendReport", "hubspotBlog"],
  "agentic-commerce-optimization": ["searchblog", "llms"],
  "ai-visibility-measurement": ["searchblog", "gsc"],
  "ai-disclosure-provenance": ["c2pa", "searchblog"],

  // ---------- especializado ----------
  "blue-ocean-strategy": ["blueOcean", "amaFrameworks"],
  "jobs-to-be-done-jtbd": ["jtbd", "amaFrameworks"],
  "growth-hacking-framework": ["ycombinator", "referral"],
  "lean-canvas-model": ["jtbd", "amaFrameworks"],
  "customer-value-journey": ["hubspotBlog", "amaTopic"],
  "heros-journey": ["storyt", "amaFrameworks"],
  "storybrand-framework": ["carolyn", "hubspotBlog"],
  "see-think-do-care-framework": ["amaTopic", "amaFrameworks"],
  "community-driven-growth": ["onlineComm", "wordOfMouth"],
  "intent-led-expansion-framework": ["amaTopic", "hubspotBlog"],

  // ---------- complementario ----------
  "smo-social-media-optimization": ["metaBusiness", "buffer"],
  "aso-app-store-optimization": ["freemium", "hubspotBlog"],
  "data-analytics-frameworks": ["ga", "gaDev"],
  "attribution-modeling": ["googleAnalytics4", "ga"],
  "imc": ["amaTopic", "amaFrameworks"],
  "imc-integrated-marketing-communications": ["amaTopic", "amaFrameworks"],
  "agile-marketing-framework": ["amaTopic", "experiment"],

  // ---------- clasico ----------
  "inbound-marketing-framework": ["hubspotCourse", "hubspotBlog"],
  "inbound-marketing": ["hubspotCourse", "hubspotBlog"],
  "funnel-de-ventas-tradicional": ["leadGen", "amaFrameworks"],
  "lead-generation-framework": ["leadGen", "hubspotBlog"],
  "content-marketing-funnel": ["contentmarketing", "cmi"],
  "4ps-marketing-classic-mix": ["fourPs", "amaFrameworks"],
  "modelo-7ps-extendido": ["modelo7p", "amaFrameworks"],
  "purchase-decision-journey": ["stp", "amaFrameworks"],
  "customer-lifecycle-marketing": ["clientLifecycle", "hubspotBlog"],
  "market-segmentation-strategies": ["stp", "amaFrameworks"],
  "competitive-positioning": ["porter", "amaFrameworks"],
  "account-based-marketing-abm": ["linkedinB2b", "linkedin"],
  "behavioral-segmentation-framework": ["stp", "amaFrameworks"],
  "predictive-analytics-framework": ["analyticsPredict", "ga"],
  "conversational-marketing-framework": ["hubspotBlog", "metaBusiness"],
  "mobile-first-marketing-framework": ["webPerf", "gsc"],
  "machine-learning-powered-optimization": ["llms", "analyticsPredict"],
  "micro-moment-marketing": ["hubspotBlog", "trendReport"],
  "customer-retention-framework": ["clientLifecycle", "hubspotBlog"],
  "personalization-at-scale": ["hubspotBlog", "ga"],
  "ecosystem-marketing-framework": ["partnerships", "amaTopic"],
  "ecosystem-marketing": ["partnerships", "amaTopic"],
  "smarketing-salesmarketing-alignment": ["salesforce", "hubspotBlog"],
  "brand-storytelling-framework": ["storyt", "amaTopic"],
  "emotional-marketing-framework": ["socialProof", "nng"],
  "contextual-marketing-framework": ["ga", "hubspotBlog"],
  "customer-feedback-loop-framework": ["nngTopic", "nngMethods"],
  "digital-pr-outreach": ["brandRep", "semrush"],
  "voice-of-customer-voc-program": ["nngMethods", "nngTopic"],
  "customer-success-framework": ["clientLifecycle", "salesforce"],
  "viral-marketing-framework": ["viral", "wordOfMouth"],
  "influence-network-mapping": ["socialProof", "wordOfMouth"],
  "competitive-intelligence-framework": ["porter", "amaTopic"],
  "marketing-mix-modeling-mmm": ["analyticsPredict", "gaDev"],
  "data-orchestration-framework": ["gaDev", "martech"],
  "marketing-automation-maturity-model": ["martech", "hubspotBlog"],

  // ---------- avanzado ----------
  "full-funnel-marketing-framework": ["funnelReference" as Key, "amaFrameworks"],
  "brand-funnel-integration": ["brandLift", "amaFrameworks"],
  "unified-measurement-framework": ["googleAnalytics4", "ga"],
  "marketing-operations-framework": ["martech", "amaTopic"],
  "martech-stack-framework": ["martech", "hubspotBlog"],
  "holistic-marketing": ["amaTopic", "amaFrameworks"],
  "marketing-governance-framework": ["amaTopic", "amaFrameworks"],
  "marketing-resource-management": ["martech", "salesforce"],
  "performance-excellence-framework": ["experiment", "amaTopic"],
  "conversion-centered-design-ccd": ["experiment", "nng"],
  "usability-accessibility-framework": ["wcag", "wai"],
  "behavioral-economics-applied-to-marketing": ["socialProof", "nng"],
  "before-after-bridge-bab-copywriting": ["copyblogger", "hubspotBlog"],
  "feature-advantage-benefit-fab-framework": ["copyblogger", "ctia"],
  "client-lifecycle-management": ["clientLifecycle", "salesforce"],
  "agency-growth-scaling": ["hubspotBlog", "amaTopic"],
  "crm-based-marketing-automation": ["salesforce", "hubspotBlog"],
  "lead-management-framework": ["leadGen", "hubspotBlog"],
  "performance-marketing-framework": ["gads", "metaBusiness"],
  "meta-ads-paid-social-integration": ["metaHelp", "fbGraph"],
  "holistic-marketing-framework": ["amaTopic", "amaFrameworks"],
  "sustainable-marketing-strategies": ["amaTopic", "amaFrameworks"],
  "ethical-marketing-framework": ["amaTopic", "amaFrameworks"],
  "green-marketing-framework": ["amaTopic", "amaFrameworks"],
  "social-impact-marketing": ["amaTopic", "amaFrameworks"],
  "crisis-communication-framework": ["amaTopic", "brandRep"],
  "influencer-marketing-framework": ["metaBusiness", "wordOfMouth"],
  "affiliate-marketing-strategy": ["referral", "hubspotBlog"],
  "video-marketing-strategy": ["youtube", "buffer"],
  "podcast-marketing-framework": ["hubspotBlog", "cmi"],
  "community-building-advocacy": ["onlineComm", "wordOfMouth"],
  "partnership-co-marketing": ["partnerships", "amaTopic"],
  "porters-five-forces": ["porter", "amaFrameworks"],
  "feedback-loops-automatizados": ["nngTopic", "experiment"],
  "cross-channel-orchestration": ["tagmanager", "martech"],
  "cdp-integration-unified-data": ["gaDev", "martech"],
  "ai-driven-decision-making": ["analyticsPredict", "ga"],
  "protocolos-modulares-adaptativos": ["searchblog", "llms"],
};
// recurso de referencia para full-funnel (evitar clave inexistente)
(R as Record<string, Res>)["funnelReference"] = [
  "Wikipedia: Marketing funnel",
  "https://en.wikipedia.org/wiki/Marketing_funnel",
];

const DIR = path.join(process.cwd(), "content", "frameworks");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort();

let added = 0;
const skipped: string[] = [];

// Limpia cualquier rastro previo de resources (frontmatter + líneas huérfanas en body).
function strip(raw: string): string {
  return raw
    .split("\n")
    .filter((ln) => {
      const t = ln.replace(/\r$/, "");
      if (/^resources:$/.test(t)) return false;
      if (/^  - title: "/.test(t)) return false;
      if (/^    (url|desc): "/.test(t)) return false;
      return true;
    })
    .join("\n");
}

for (const file of files) {
  const full = path.join(DIR, file);
  const raw = strip(fs.readFileSync(full, "utf8"));
  // slug = campo slug del frontmatter
  const m = raw.match(/^slug:\s*["']?([^"'\r\n]+)["']?/m);
  const slug = m ? m[1].trim() : "";
  const keys = MAP[slug];
  if (!keys || keys.length === 0) {
    skipped.push(`SIN MAPA: ${file} (${slug})`);
    continue;
  }
  if (!fs.existsSync(full)) continue;
  const entries = keys.map((k) => R[k]).filter(Boolean);
  const lines = ["resources:"];
  for (const e of entries) {
    const [title, url, desc] = e as readonly string[];
    lines.push(`  - title: "${title.replace(/"/g, "'")}"`);
    lines.push(`    url: "${url}"`);
    if (desc) lines.push(`    desc: "${desc}"`);
  }
  // insertar justo antes del cierre REAL del frontmatter:
  // primera línea `---` es la apertura (índice 0); el cierre es la siguiente línea `---`.
  const out = raw.split("\n");
  let closeIdx = -1;
  for (let i = 1; i < out.length; i++) {
    if (out[i].replace(/\r$/, "").trim() === "---") {
      closeIdx = i;
      break;
    }
  }
  if (closeIdx === -1) {
    skipped.push(`SIN FM: ${file}`);
    continue;
  }
  out.splice(closeIdx, 0, lines.join("\n"));
  fs.writeFileSync(full, out.join("\n"), "utf8");
  added++;
}

console.log(`Insertados: ${added}`);
console.log(`Omitidos (${skipped.length}):`);
for (const s of skipped) console.log("  -", s);
