// Builds the DVCS website into static HTML. No dependencies.
//   node build.mjs            -> dist/     (clean URLs, for hosting)
//   node build.mjs --preview  -> preview/  (explicit index.html links, for file/preview viewing)
import { mkdirSync, writeFileSync, copyFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const PREVIEW = process.argv.includes('--preview');
const OUT = PREVIEW ? 'preview' : 'dist';
// Keep search engines out until the site goes live. Set to false at go-live.
const NOINDEX = false;
const SITE = 'https://datavisiontech.de';
const EMAIL = 'contact@datavisiontech.de';
const PHONE = '+49 151 7530 0618';
const PHONE_LINK = '+4915175300618';
const YEAR = new Date().getFullYear();

const PAGES = ['', 'services', 'products', 'training', 'about', 'contact', 'impressum', 'datenschutz'];

// ---------- text ----------
const T = {
  en: {
    htmlLang: 'en',
    nav: { services: 'Services', products: 'Products', training: 'Training', about: 'About', contact: 'Contact' },
    langSwitch: 'Deutsch', langSwitchLabel: 'Diese Seite auf Deutsch',
    menu: 'Menu', skip: 'Skip to content',
    preview: 'Trial version – not yet live',
    cta: 'Talk to us', ctaDemo: 'Request a demo', ctaTraining: 'Request training', ctaQuote: 'Request a quote',
    onRequest: 'Price on request',
    footerAbout: 'Siemens Teamcenter and Active Workspace services from Nürnberg. Customization, integration, upgrades and support.',
    footerPages: 'Pages', footerLegal: 'Legal', footerContact: 'Contact',
    impressum: 'Legal notice (Impressum)', privacy: 'Privacy policy',
    company: 'Data Vision Consulting & Services UG (haftungsbeschränkt)',
  },
  de: {
    htmlLang: 'de',
    nav: { services: 'Leistungen', products: 'Produkte', training: 'Schulungen', about: 'Über uns', contact: 'Kontakt' },
    langSwitch: 'English', langSwitchLabel: 'This page in English',
    menu: 'Menü', skip: 'Zum Inhalt springen',
    preview: 'Testversion – noch nicht live',
    cta: 'Gespräch vereinbaren', ctaDemo: 'Demo anfragen', ctaTraining: 'Schulung anfragen', ctaQuote: 'Angebot anfragen',
    onRequest: 'Preis auf Anfrage',
    footerAbout: 'Siemens Teamcenter und Active Workspace aus Nürnberg. Anpassung, Integration, Upgrades und Support.',
    footerPages: 'Seiten', footerLegal: 'Rechtliches', footerContact: 'Kontakt',
    impressum: 'Impressum', privacy: 'Datenschutzerklärung',
    company: 'Data Vision Consulting & Services UG (haftungsbeschränkt)',
  },
};

const SERVICES = {
  en: [
    { k: 'k1', h: 'Customization and implementation', p: 'New Teamcenter installations, or changes to the system you already have. We keep customizations separate from the standard, so upgrades stay simple.',
      li: ['Data model, workflows and business rules', 'Active Workspace (AWC) user interface and configuration', 'Change, configuration and document management', 'Testing and user training'] },
    { k: 'k2', h: 'Integrations', p: 'Connect Teamcenter with CAD, ERP, ECAD and your other business systems, so data moves without manual copying.',
      li: ['Teamcenter and SAP / ERP', 'CAD and ECAD integrations', 'APIs for legacy systems', 'On-premise, cloud or hybrid setups'] },
    { k: 'k3', h: 'Upgrade and data migration', p: 'Move to a current Teamcenter release with a clear plan and checked data. Time & material or fixed price.',
      li: ['Release upgrades with little downtime', 'Data migration from legacy systems', 'Data integrity checks', 'Support after the upgrade'] },
    { k: 'k4', h: 'Support and reporting', p: 'Administration, configuration and support for running Teamcenter systems. Reporting with Teamcenter Reporting and Analytics (TcRA).',
      li: ['Administration and configuration', 'Health checks and preventive maintenance', 'TcRA reports and dashboards', 'Support packages that fit your team'] },
  ],
  de: [
    { k: 'k1', h: 'Anpassung und Einführung', p: 'Neue Teamcenter-Einführungen oder Änderungen an Ihrem bestehenden System. Anpassungen bleiben vom Standard getrennt, damit Upgrades einfach bleiben.',
      li: ['Datenmodell, Workflows und Geschäftsregeln', 'Oberfläche und Konfiguration von Active Workspace (AWC)', 'Änderungs-, Konfigurations- und Dokumentenmanagement', 'Tests und Anwenderschulung'] },
    { k: 'k2', h: 'Integrationen', p: 'Teamcenter verbunden mit CAD, ERP, ECAD und Ihren anderen Systemen – Daten fließen ohne manuelles Kopieren.',
      li: ['Teamcenter und SAP / ERP', 'CAD- und ECAD-Integrationen', 'Schnittstellen zu Altsystemen', 'On-Premise, Cloud oder hybrid'] },
    { k: 'k3', h: 'Upgrade und Datenmigration', p: 'Wechsel auf ein aktuelles Teamcenter-Release mit klarem Plan und geprüften Daten. Nach Aufwand oder zum Festpreis.',
      li: ['Release-Upgrades mit kurzer Ausfallzeit', 'Datenmigration aus Altsystemen', 'Prüfung der Datenintegrität', 'Betreuung nach dem Upgrade'] },
    { k: 'k4', h: 'Support und Reporting', p: 'Administration, Konfiguration und Support für laufende Teamcenter-Systeme. Berichte mit Teamcenter Reporting and Analytics (TcRA).',
      li: ['Administration und Konfiguration', 'Systemprüfungen und vorbeugende Wartung', 'TcRA-Berichte und Dashboards', 'Supportpakete passend zu Ihrem Team'] },
  ],
};

const PRODUCTS = {
  en: [
    { id: 'dvlca4plm', h: 'DVLCA4PLM', tag: 'Life cycle assessment inside your PLM system',
      p: 'Calculate the environmental impact of your products from the data you already have in PLM. Materials come from CAD and the BOM. They are mapped once to ecoinvent activities and reused.',
      li: ['Works with Siemens Teamcenter, PTC Windchill, Dassault ENOVIA and SAP PLM', 'More than 20 impact categories, not only CO₂', 'Supports EN 15804+A2', 'Results and dashboards stored back in PLM', 'Unlimited users, on-premise'] },
    { id: 'license-monitor', h: 'DVCS TC License Monitor', tag: 'See how your Teamcenter licenses are used',
      p: 'Track Teamcenter license usage over time. Find unused licenses and plan renewals with real numbers.',
      li: ['Usage history and peaks', 'Reports for IT and management', 'Runs in your own environment'] },
  ],
  de: [
    { id: 'dvlca4plm', h: 'DVLCA4PLM', tag: 'Ökobilanz direkt in Ihrem PLM-System',
      p: 'Berechnen Sie die Umweltwirkung Ihrer Produkte aus den Daten, die bereits im PLM liegen. Materialien kommen aus CAD und Stückliste. Sie werden einmal ecoinvent-Aktivitäten zugeordnet und wiederverwendet.',
      li: ['Für Siemens Teamcenter, PTC Windchill, Dassault ENOVIA und SAP PLM', 'Mehr als 20 Wirkungskategorien, nicht nur CO₂', 'Unterstützt EN 15804+A2', 'Ergebnisse und Dashboards zurück im PLM', 'Unbegrenzte Anwender, On-Premise'] },
    { id: 'license-monitor', h: 'DVCS TC License Monitor', tag: 'Sehen, wie Ihre Teamcenter-Lizenzen genutzt werden',
      p: 'Verfolgen Sie die Nutzung Ihrer Teamcenter-Lizenzen über die Zeit. Finden Sie ungenutzte Lizenzen und planen Sie Verlängerungen mit echten Zahlen.',
      li: ['Nutzungsverlauf und Spitzen', 'Berichte für IT und Management', 'Läuft in Ihrer eigenen Umgebung'] },
  ],
};

const COURSES = {
  en: [
    ['Teamcenter Basics – User', 'End users', 'Daily work in Teamcenter: search, items, revisions, workflows.'],
    ['Teamcenter Advanced – Admin', 'Administrators', 'Organization, access, preferences, workflows and system administration.'],
    ['Active Workspace Customization', 'Developers', 'Declarative UI, view models, commands and styling in AWC.'],
    ['Active Integration Technical', 'Developers, integrators', 'Technical setup and extension of Active Integration.'],
  ],
  de: [
    ['Teamcenter Basics – Anwender', 'Anwender', 'Tägliche Arbeit in Teamcenter: Suche, Items, Revisionen, Workflows.'],
    ['Teamcenter Advanced – Admin', 'Administratoren', 'Organisation, Zugriffsrechte, Preferences, Workflows und Systemadministration.'],
    ['Active Workspace Customization', 'Entwickler', 'Deklarative Oberfläche, View Models, Commands und Styling in AWC.'],
    ['Active Integration Technical', 'Entwickler, Integratoren', 'Technische Einrichtung und Erweiterung von Active Integration.'],
  ],
};

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const depthOf = (lang, page) => (lang === 'de' ? 1 : 0) + (page ? 1 : 0);
function href(fromLang, fromPage, toLang, toPage, hash = '') {
  const up = '../'.repeat(depthOf(fromLang, fromPage));
  const path = (toLang === 'de' ? 'de/' : '') + (toPage ? toPage + '/' : '');
  const file = PREVIEW ? 'index.html' : '';
  let out = up + path + file;
  if (!out) out = './';
  return out + hash;
}
const asset = (lang, page, f) => '../'.repeat(depthOf(lang, page)) + 'assets/' + f;

function layout(lang, page, title, desc, main) {
  const t = T[lang];
  const L = (p, h) => href(lang, page, lang, p, h);
  const other = lang === 'en' ? 'de' : 'en';
  const navItem = (p) => `<a href="${L(p)}"${page === p ? ' aria-current="page"' : ''}>${t.nav[p]}</a>`;
  const canonical = SITE + '/' + (lang === 'de' ? 'de/' : '') + (page ? page + '/' : '');
  const alt = (l) => SITE + '/' + (l === 'de' ? 'de/' : '') + (page ? page + '/' : '');
  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${NOINDEX ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${alt('en')}">
<link rel="alternate" hreflang="de" href="${alt('de')}">
<link rel="alternate" hreflang="x-default" href="${alt('en')}">
<link rel="icon" href="${asset(lang, page, 'favicon.png')}" type="image/png">
<link rel="apple-touch-icon" href="${asset(lang, page, 'apple-touch-icon.png')}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/assets/og-image.png">
<link rel="stylesheet" href="${asset(lang, page, 'site.css')}">
</head>
<body>
<a class="skip" href="#main">${t.skip}</a>
${NOINDEX ? `<div class="preview-note">${t.preview}</div>\n` : ''}<header class="site-header">
  <div class="wrap">
    <a class="brand" href="${L('')}"><img src="${asset(lang, page, 'logo.png')}" width="171" height="44" alt="Data Vision – simplifying complexity"></a>
    <button class="menu-btn" aria-expanded="false" aria-controls="site-nav" aria-label="${t.menu}"><img src="${asset(lang, page, 'menu-mark.png')}" width="42" height="44" alt=""></button>
    <nav class="nav" id="site-nav" aria-label="Main">
      ${['services', 'products', 'training', 'about', 'contact'].map(navItem).join('\n      ')}
      <a class="lang" href="${href(lang, page, other, page)}" hreflang="${other}" lang="${other}" title="${t.langSwitchLabel}">${t.langSwitch}</a>
    </nav>
  </div>
</header>
<main id="main">
${main}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div>
      <div class="footer-bars" aria-hidden="true"><i></i><i></i><i></i></div>
      <p>${t.footerAbout}</p>
    </div>
    <div>
      <h2>${t.footerPages}</h2>
      <ul>${['services', 'products', 'training', 'about', 'contact'].map((p) => `<li><a href="${L(p)}">${t.nav[p]}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2>${t.footerContact}</h2>
      <ul>
        <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
        <li><a href="tel:${PHONE_LINK}">${PHONE}</a></li>
        <li>Osterhausenstr. 12A, 90459 Nürnberg</li>
      </ul>
    </div>
    <div class="footer-base">
      <span>© ${YEAR} ${t.company}</span>
      <span><a href="${L('impressum')}">${t.impressum}</a> &nbsp; <a href="${L('datenschutz')}">${t.privacy}</a></span>
    </div>
  </div>
</footer>
<script src="${asset(lang, page, 'site.js')}"></script>
</body>
</html>
`;
}

const ctaBand = (lang, page) => {
  const L = (p) => href(lang, page, lang, p);
  const h = lang === 'en' ? 'Have a Teamcenter project in mind?' : 'Sie planen ein Teamcenter-Projekt?';
  const p = lang === 'en' ? 'Tell us what you need. You get a clear scope and price.' : 'Sagen Sie uns, was Sie brauchen. Sie erhalten einen klaren Umfang und Preis.';
  return `<section class="section section-ink cta-band"><div class="wrap"><div><h2>${h}</h2><p>${p}</p></div><a class="btn" href="${L('contact')}">${T[lang].cta}</a></div></section>`;
};

const serviceList = (lang) => `<div class="services">${SERVICES[lang].map((s) => `
  <article class="service ${s.k}">
    <h3>${s.h}</h3>
    <p>${s.p}</p>
    <ul>${s.li.map((x) => `<li>${x}</li>`).join('')}</ul>
  </article>`).join('')}
</div>`;

// ---------- pages ----------
function home(lang) {
  const L = (p, h) => href(lang, '', lang, p, h);
  const en = lang === 'en';
  const main = `
<section class="hero">
  <div class="wrap">
    <div>
      <h1>${en ? 'Teamcenter that fits the way you work' : 'Teamcenter, das zu Ihrer Arbeitsweise passt'}</h1>
      <p class="lead">${en
        ? 'We customize, integrate, upgrade and support Siemens Teamcenter and Active Workspace. Close to 20 years of PLM experience, based in Nürnberg.'
        : 'Wir passen Siemens Teamcenter und Active Workspace an, integrieren, aktualisieren und betreuen es. Fast 20 Jahre PLM-Erfahrung, mit Sitz in Nürnberg.'}</p>
      <div class="actions">
        <a class="btn" href="${L('contact')}">${T[lang].cta}</a>
        <a class="btn btn-quiet" href="${L('services')}">${en ? 'See our services' : 'Unsere Leistungen'}</a>
      </div>
    </div>
    <div class="bars" aria-hidden="true"><span></span><span></span><span></span></div>
  </div>
</section>

<section class="section section-mist">
  <div class="wrap">
    <div class="section-head">
      <h2>${en ? 'What we do' : 'Was wir tun'}</h2>
      <p class="lead">${en ? 'Four kinds of work, one team that knows Teamcenter from the data model to the user interface.' : 'Vier Arten von Arbeit, ein Team, das Teamcenter vom Datenmodell bis zur Oberfläche kennt.'}</p>
    </div>
    ${serviceList(lang)}
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div>
      <h2>${en ? 'Our products' : 'Unsere Produkte'}</h2>
      <p>${en ? 'Software we built from real project needs. Each one is installed and set up by us.' : 'Software, entstanden aus echten Projektanforderungen. Wir installieren und richten sie für Sie ein.'}</p>
      <p><a href="${L('products')}">${en ? 'Read about our products' : 'Mehr zu unseren Produkten'}</a></p>
    </div>
    <dl class="facts" style="grid-template-columns:1fr">
      ${PRODUCTS[lang].map((p) => `<div><dt>${p.h}</dt><dd>${p.tag}</dd></div>`).join('\n      ')}
    </dl>
  </div>
</section>

<section class="section section-mist">
  <div class="wrap split">
    <div>
      <h2>${en ? 'Training' : 'Schulungen'}</h2>
      <p>${en ? 'Courses for users, administrators and developers. Held at your site, online or in Nürnberg.' : 'Kurse für Anwender, Administratoren und Entwickler. Bei Ihnen vor Ort, online oder in Nürnberg.'}</p>
      <p><a href="${L('training')}">${en ? 'See all courses' : 'Alle Schulungen ansehen'}</a></p>
    </div>
    <div>
      <h2>${en ? 'Industries' : 'Branchen'}</h2>
      <ul class="tags">${(en ? ['Automotive', 'Defence', 'Semiconductor', 'Building and construction', 'Research and development'] : ['Automobil', 'Verteidigung', 'Halbleiter', 'Bauwesen', 'Forschung und Entwicklung']).map((x) => `<li>${x}</li>`).join('')}</ul>
    </div>
  </div>
</section>
${ctaBand(lang, '')}`;
  return layout(lang, '', en ? 'DVCS – Siemens Teamcenter and Active Workspace services' : 'DVCS – Siemens Teamcenter und Active Workspace',
    en ? 'Teamcenter customization, integration, upgrade and support from Nürnberg.' : 'Teamcenter-Anpassung, Integration, Upgrade und Support aus Nürnberg.', main);
}

function services(lang) {
  const en = lang === 'en';
  const main = `
<section class="page-head"><div class="wrap">
  <h1>${T[lang].nav.services}</h1>
  <p class="lead">${en ? 'From a first installation to years of support. We work at your pace, on time & material or fixed price.' : 'Von der ersten Installation bis zum langjährigen Support. In Ihrem Tempo, nach Aufwand oder zum Festpreis.'}</p>
</div></section>
<section class="section"><div class="wrap">${serviceList(lang)}</div></section>
<section class="section section-mist"><div class="wrap">
  <h2>${en ? 'How a project runs' : 'So läuft ein Projekt'}</h2>
  <dl class="facts">
    <div><dt>${en ? '1. Understand' : '1. Verstehen'}</dt><dd>${en ? 'Workshops to agree requirements and scope.' : 'Workshops, um Anforderungen und Umfang festzulegen.'}</dd></div>
    <div><dt>${en ? '2. Build and test' : '2. Umsetzen und testen'}</dt><dd>${en ? 'Delivery in steps. You accept each step in writing.' : 'Lieferung in Schritten. Sie nehmen jeden Schritt schriftlich ab.'}</dd></div>
    <div><dt>${en ? '3. Go live and support' : '3. Produktivstart und Support'}</dt><dd>${en ? 'Training, go-live help and support afterwards.' : 'Schulung, Hilfe beim Start und Support danach.'}</dd></div>
  </dl>
</div></section>
${ctaBand(lang, 'services')}`;
  return layout(lang, 'services', (en ? 'Services' : 'Leistungen') + ' – DVCS',
    en ? 'Teamcenter customization, integrations, upgrades, data migration, support and TcRA reporting.' : 'Teamcenter-Anpassung, Integrationen, Upgrades, Datenmigration, Support und TcRA-Reporting.', main);
}

function products(lang) {
  const en = lang === 'en';
  const L = (p) => href(lang, 'products', lang, p);
  const main = `
<section class="page-head"><div class="wrap">
  <h1>${T[lang].nav.products}</h1>
  <p class="lead">${en ? 'Each product comes with installation, setup and training. Prices depend on your setup, so we send you a quote.' : 'Zu jedem Produkt gehören Installation, Einrichtung und Schulung. Der Preis hängt von Ihrer Umgebung ab – Sie erhalten ein Angebot.'}</p>
</div></section>
<section class="section"><div class="wrap">
${PRODUCTS[lang].map((p) => `  <article class="product" id="${p.id}">
    <div>
      <h2>${p.h}</h2>
      <p class="tag">${p.tag}</p>
      <div class="actions"><a class="btn" href="${L('contact')}?topic=${encodeURIComponent(p.h)}">${T[lang].ctaDemo}</a></div>
    </div>
    <div>
      <p>${p.p}</p>
      <ul>${p.li.map((x) => `<li>${x}</li>`).join('')}</ul>
      <p class="tag" style="margin-top:16px">${T[lang].onRequest}</p>
    </div>
  </article>`).join('\n')}
</div></section>
${ctaBand(lang, 'products')}`;
  return layout(lang, 'products', (en ? 'Products' : 'Produkte') + ' – DVCS',
    en ? 'DVLCA4PLM life cycle assessment in PLM, and DVCS TC License Monitor.' : 'DVLCA4PLM Ökobilanz im PLM und DVCS TC License Monitor.', main);
}

function training(lang) {
  const en = lang === 'en';
  const L = (p) => href(lang, 'training', lang, p);
  const main = `
<section class="page-head"><div class="wrap">
  <h1>${T[lang].nav.training}</h1>
  <p class="lead">${en ? 'Hands-on courses by people who use Teamcenter every day. We adapt each course to your system and your team.' : 'Praxisnahe Kurse von Leuten, die täglich mit Teamcenter arbeiten. Wir passen jeden Kurs an Ihr System und Ihr Team an.'}</p>
</div></section>
<section class="section"><div class="wrap">
  <table class="courses">
    <thead><tr><th>${en ? 'Course' : 'Kurs'}</th><th>${en ? 'For' : 'Für'}</th><th>${en ? 'Content' : 'Inhalt'}</th></tr></thead>
    <tbody>
${COURSES[lang].map((c) => `      <tr><td>${c[0]}</td><td>${c[1]}</td><td>${c[2]}</td></tr>`).join('\n')}
    </tbody>
  </table>
  <p style="margin-top:28px">${en ? 'Format: at your site, online or in Nürnberg. Language: English or German.' : 'Format: bei Ihnen vor Ort, online oder in Nürnberg. Sprache: Deutsch oder Englisch.'} ${T[lang].onRequest}.</p>
  <div class="actions"><a class="btn" href="${L('contact')}?topic=${encodeURIComponent(en ? 'Training' : 'Schulung')}">${T[lang].ctaTraining}</a></div>
</div></section>`;
  return layout(lang, 'training', (en ? 'Training' : 'Schulungen') + ' – DVCS',
    en ? 'Teamcenter and Active Workspace training for users, administrators and developers.' : 'Teamcenter- und Active-Workspace-Schulungen für Anwender, Administratoren und Entwickler.', main);
}

function about(lang) {
  const en = lang === 'en';
  const main = `
<section class="page-head"><div class="wrap">
  <h1>${T[lang].nav.about}</h1>
  <p class="lead">${en ? 'Data Vision Consulting & Services (DVCS) is a Teamcenter consultancy in Nürnberg. We are small on purpose: you work directly with the experts who do the work.' : 'Data Vision Consulting & Services (DVCS) ist ein Teamcenter-Beratungshaus in Nürnberg. Wir sind bewusst klein: Sie arbeiten direkt mit den Experten, die die Arbeit machen.'}</p>
</div></section>
<section class="section"><div class="wrap split">
  <div>
    <h2>${en ? 'Founder' : 'Gründer'}</h2>
    <h3>Chinar Gokul Kakutsey</h3>
    <p>${en
      ? 'Chinar has worked with PLM and Teamcenter for close to 20 years. He specializes in Active Workspace customization and configuration, and in Teamcenter Reporting and Analytics (TcRA). He also works hands-on with Python, data science and machine learning.'
      : 'Chinar arbeitet seit fast 20 Jahren mit PLM und Teamcenter. Seine Schwerpunkte sind Anpassung und Konfiguration von Active Workspace sowie Teamcenter Reporting and Analytics (TcRA). Außerdem arbeitet er praktisch mit Python, Data Science und Machine Learning.'}</p>
  </div>
  <div>
    <h2>${en ? 'Career' : 'Werdegang'}</h2>
    <ol class="timeline">
      <li><span>${en ? '2020 – today' : '2020 – heute'}</span>${en ? 'Founder, DVCS' : 'Gründer, DVCS'}</li>
      <li><span>2013 – 2020</span>Accenture GmbH</li>
      <li><span>2010 – 2013</span>PRION PLM</li>
      <li><span>2006 – 2010</span>Mahindra & Mahindra</li>
    </ol>
  </div>
</div></section>
<section class="section section-mist"><div class="wrap">
  <h2>${en ? 'What we know well' : 'Was wir gut können'}</h2>
  <dl class="facts">
    <div><dt>Teamcenter</dt><dd>${en ? 'Implementation, customization, upgrade and migration.' : 'Einführung, Anpassung, Upgrade und Migration.'}</dd></div>
    <div><dt>Active Workspace</dt><dd>${en ? 'UI customization, configuration and condition migration.' : 'Oberflächenanpassung, Konfiguration und Migration von Conditions.'}</dd></div>
    <div><dt>${en ? 'Processes' : 'Prozesse'}</dt><dd>${en ? 'Change, configuration and document management, life cycle assessment.' : 'Änderungs-, Konfigurations- und Dokumentenmanagement, Ökobilanz.'}</dd></div>
  </dl>
</div></section>
${ctaBand(lang, 'about')}`;
  return layout(lang, 'about', (en ? 'About us' : 'Über uns') + ' – DVCS',
    en ? 'DVCS is a Siemens Teamcenter consultancy in Nürnberg, founded by Chinar Gokul Kakutsey.' : 'DVCS ist ein Siemens-Teamcenter-Beratungshaus in Nürnberg, gegründet von Chinar Gokul Kakutsey.', main);
}

function contact(lang) {
  const en = lang === 'en';
  const L = (p) => href(lang, 'contact', lang, p);
  const topics = en
    ? ['General question', 'Customization and implementation', 'Integrations', 'Upgrade and data migration', 'Support and reporting', 'DVLCA4PLM', 'DVCS TC License Monitor', 'Training']
    : ['Allgemeine Frage', 'Anpassung und Einführung', 'Integrationen', 'Upgrade und Datenmigration', 'Support und Reporting', 'DVLCA4PLM', 'DVCS TC License Monitor', 'Schulung'];
  const main = `
<section class="page-head"><div class="wrap">
  <h1>${T[lang].nav.contact}</h1>
  <p class="lead">${en ? 'Tell us about your system and what you need. We reply within one working day.' : 'Erzählen Sie uns von Ihrem System und Ihrem Bedarf. Wir antworten innerhalb eines Werktags.'}</p>
</div></section>
<section class="section"><div class="wrap contact-grid">
  <form id="contact-form" data-to="${EMAIL}">
    <label for="f-topic">${en ? 'Topic' : 'Thema'}</label>
    <select id="f-topic" name="topic">${topics.map((x) => `<option>${x}</option>`).join('')}</select>
    <label for="f-name">${en ? 'Name' : 'Name'}</label>
    <input id="f-name" name="name" autocomplete="name" required>
    <label for="f-company">${en ? 'Company' : 'Firma'}</label>
    <input id="f-company" name="company" autocomplete="organization">
    <label for="f-email">${en ? 'Email' : 'E-Mail'}</label>
    <input id="f-email" name="email" type="email" autocomplete="email" required>
    <label for="f-phone">${en ? 'Phone (optional)' : 'Telefon (optional)'}</label>
    <input id="f-phone" name="phone" type="tel" autocomplete="tel">
    <label for="f-msg">${en ? 'Your message' : 'Ihre Nachricht'}</label>
    <textarea id="f-msg" name="message" required></textarea>
    <label class="check"><input type="checkbox" required> <span>${en
      ? `I have read the <a href="${L('datenschutz')}">privacy policy</a>.`
      : `Ich habe die <a href="${L('datenschutz')}">Datenschutzerklärung</a> gelesen.`}</span></label>
    <button class="btn" type="submit">${en ? 'Send message' : 'Nachricht senden'}</button>
    <p class="form-note">${en ? 'This opens your email program with the message ready to send.' : 'Dadurch öffnet sich Ihr E-Mail-Programm mit der fertigen Nachricht.'}</p>
  </form>
  <div>
    <h2>${en ? 'Direct contact' : 'Direkter Kontakt'}</h2>
    <address class="address">
      Data Vision Consulting & Services UG<br>
      Osterhausenstr. 12A<br>
      90459 Nürnberg, ${en ? 'Germany' : 'Deutschland'}<br><br>
      <a href="mailto:${EMAIL}">${EMAIL}</a><br>
      <a href="tel:${PHONE_LINK}">${PHONE}</a>
    </address>
  </div>
</div></section>
<script>
(function(){var t=new URLSearchParams(location.search).get('topic');if(!t)return;var s=document.getElementById('f-topic');for(var i=0;i<s.options.length;i++){if(s.options[i].text===t){s.selectedIndex=i;return;}}})();
</script>`;
  return layout(lang, 'contact', (en ? 'Contact' : 'Kontakt') + ' – DVCS',
    en ? 'Contact DVCS in Nürnberg for Teamcenter projects, products and training.' : 'Kontakt zu DVCS in Nürnberg für Teamcenter-Projekte, Produkte und Schulungen.', main);
}

const TODO = (s) => `<span class="todo">[${s}]</span>`;

function impressum(lang) {
  const en = lang === 'en';
  const main = `
<section class="page-head"><div class="wrap"><h1>Impressum</h1>${en ? '<p class="lead">Legal notice according to § 5 DDG (German law). Shown in German.</p>' : ''}</div></section>
<section class="section legal"${en ? ' lang="de"' : ''}><div class="wrap">
  ${NOINDEX ? `<p class="draft-note">${en ? 'Draft. Please have it checked before go-live.' : 'Entwurf. Bitte vor dem Livegang prüfen lassen.'}</p>` : ''}
  <h2>Angaben gemäß § 5 DDG</h2>
  <p>Data Vision Consulting &amp; Services UG (haftungsbeschränkt)<br>Osterhausenstr. 12A<br>90459 Nürnberg<br>Deutschland</p>
  <h2>Vertreten durch</h2>
  <p>Geschäftsführer: Chinar Gokul Kakutsey</p>
  <h2>Kontakt</h2>
  <p>Telefon: ${PHONE}<br>E-Mail: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
  <h2>Registereintrag</h2>
  <p>Registergericht: Amtsgericht Nürnberg<br>Registernummer: HRB 42382</p>
  <h2>Umsatzsteuer-ID</h2>
  <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE368127134</p>
  <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
  <p>Chinar Gokul Kakutsey, Anschrift wie oben</p>
  <h2>Verbraucherstreitbeilegung</h2>
  <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
</div></section>`;
  return layout(lang, 'impressum', 'Impressum – DVCS', 'Impressum der Data Vision Consulting & Services UG.', main);
}

function datenschutz(lang) {
  const en = lang === 'en';
  const main = `
<section class="page-head"><div class="wrap"><h1>${en ? 'Privacy policy' : 'Datenschutzerklärung'}</h1>${en ? '<p class="lead">Shown in German.</p>' : ''}</div></section>
<section class="section legal"${en ? ' lang="de"' : ''}><div class="wrap">
  ${NOINDEX ? `<p class="draft-note">${en ? 'Draft. Please have it checked before go-live.' : 'Entwurf. Bitte vor dem Livegang prüfen lassen.'}</p>` : ''}
  <h2>1. Verantwortlicher</h2>
  <p>Data Vision Consulting &amp; Services UG (haftungsbeschränkt), Osterhausenstr. 12A, 90459 Nürnberg, E-Mail: <a href="mailto:${EMAIL}">${EMAIL}</a>, Telefon: ${PHONE}</p>
  <h2>2. Hosting über GitHub Pages</h2>
  <p>Diese Website wird über GitHub Pages gehostet. Anbieter ist die GitHub, Inc., 88 Colin P. Kelly Jr. St., San Francisco, CA 94107, USA. Die Website besteht nur aus statischen Seiten. Wir selbst speichern dabei keine Daten über Besucher.</p>
  <p>Beim Aufruf der Website verarbeitet GitHub technisch notwendige Daten, um die Seiten auszuliefern. Nach Angaben von GitHub wird dabei die IP-Adresse der Besucher aus Sicherheitsgründen protokolliert und gespeichert. GitHub nennt dafür keine Speicherdauer. Wir haben keinen Zugriff auf diese Daten.</p>
  <p>Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und zuverlässigen Bereitstellung der Website (Art. 6 Abs. 1 lit. f DSGVO).</p>
  <p>Dabei können Daten in die USA übertragen werden. GitHub gibt an, das EU-U.S. Data Privacy Framework einzuhalten, und nutzt zusätzlich die Standardvertragsklauseln der EU-Kommission. Mehr dazu in der <a href="https://docs.github.com/site-policy/privacy-policies/github-privacy-statement">Datenschutzerklärung von GitHub</a>.</p>
  <h2>3. Cookies und Tracking</h2>
  <p>Diese Website setzt keine Cookies und verwendet keine Analyse- oder Tracking-Werkzeuge. Schriften werden nicht von externen Servern geladen.</p>
  <h2>4. Kontakt per E-Mail und Kontaktformular</h2>
  <p>Das Kontaktformular öffnet Ihr eigenes E-Mail-Programm. Es werden dabei keine Daten über diese Website übertragen. Wenn Sie uns eine E-Mail senden, verarbeiten wir Ihre Angaben, um Ihre Anfrage zu beantworten (Art. 6 Abs. 1 lit. b DSGVO bei vorvertraglichen Anfragen, sonst lit. f). Wir löschen die Daten, wenn sie nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
  <h2>5. Ihre Rechte</h2>
  <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO). Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel beim Bayerischen Landesamt für Datenschutzaufsicht (BayLDA).</p>
  <h2>6. Stand</h2>
  <p>12. November 2026</p>
</div></section>`;
  return layout(lang, 'datenschutz', (en ? 'Privacy policy' : 'Datenschutzerklärung') + ' – DVCS', 'Datenschutzerklärung der Data Vision Consulting & Services UG.', main);
}

const RENDER = { '': home, services, products, training, about, contact, impressum, datenschutz };

function notFound() {
  const main = `
<section class="page-head"><div class="wrap">
  <h1>Page not found</h1>
  <p class="lead">This page does not exist or has moved. <span lang="de">Diese Seite gibt es nicht oder sie wurde verschoben.</span></p>
  <div class="actions"><a class="btn" href="/">Go to the home page</a><a class="btn btn-quiet" href="/de/" lang="de">Zur Startseite</a></div>
</div></section>`;
  // GitHub Pages serves 404.html for any path, so all links must start at the site root.
  return layout('en', '', 'Page not found – DVCS', 'This page does not exist.', main)
    .replace(/(href|src)="(?!https?:|mailto:|tel:|#|\/)(?:\.\/)?([^"]*)"/g, '$1="/$2"')
    .replace(/<link rel="canonical"[^>]*>\n/, '')
    .replace(/<link rel="alternate"[^>]*>\n/g, '');
}

// Old WordPress addresses that other sites or search engines may still link to.
const REDIRECTS = {
  'about-us': 'about/',
  'contacts': 'contact/',
  'product/dvlca4plm': 'products/#dvlca4plm',
};
const redirectPage = (to) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Moved – DVCS</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${SITE}/${to}">
<meta http-equiv="refresh" content="0; url=/${to}">
</head><body><p>This page has moved: <a href="/${to}">${SITE}/${to}</a></p></body></html>
`;

// ---------- write ----------
rmSync(OUT, { recursive: true, force: true });
for (const lang of ['en', 'de']) {
  for (const page of PAGES) {
    const file = join(OUT, lang === 'de' ? 'de' : '', page, 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, RENDER[page](lang));
  }
}
if (!PREVIEW) {
  writeFileSync(join(OUT, '404.html'), notFound());
  for (const [from, to] of Object.entries(REDIRECTS)) {
    mkdirSync(join(OUT, from), { recursive: true });
    writeFileSync(join(OUT, from, 'index.html'), redirectPage(to));
  }
  writeFileSync(join(OUT, '.nojekyll'), '');
  writeFileSync(join(OUT, 'CNAME'), 'datavisiontech.de\n');
}
mkdirSync(join(OUT, 'assets'), { recursive: true });
for (const f of readdirSync('src/assets')) copyFileSync(join('src/assets', f), join(OUT, 'assets', f));
writeFileSync(join(OUT, 'robots.txt'), NOINDEX ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
const urls = ['en', 'de'].flatMap((l) => PAGES.map((p) => `${SITE}/${l === 'de' ? 'de/' : ''}${p ? p + '/' : ''}`));
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Built ${urls.length} pages into ${OUT}/`);
