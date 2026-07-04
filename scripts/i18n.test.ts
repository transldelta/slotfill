import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectLocaleFromAcceptLanguage } from '../lib/detect-locale';
import { locales, defaultLocale } from '../i18n/routing';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ── Accept-Language Parser Tests ────────────────────────────────────────────

test('i18n: de-DE,de;q=0.9 → de', () => {
  assert.equal(detectLocaleFromAcceptLanguage('de-DE,de;q=0.9'), 'de');
});

test('i18n: en-US,en;q=0.9 → en', () => {
  assert.equal(detectLocaleFromAcceptLanguage('en-US,en;q=0.9'), 'en');
});

test('i18n: es-MX,es;q=0.8 → es', () => {
  assert.equal(detectLocaleFromAcceptLanguage('es-MX,es;q=0.8'), 'es');
});

test('i18n: pt-BR,pt;q=0.8 → pt', () => {
  assert.equal(detectLocaleFromAcceptLanguage('pt-BR,pt;q=0.8'), 'pt');
});

// Stillgelegte Sprachen (zh, hi, bn, ru) sind nicht mehr öffentlich aktiv →
// Accept-Language fällt auf die defaultLocale (en) zurück.
test('i18n: zh-CN,zh;q=0.8 → en (stillgelegt)', () => {
  assert.equal(detectLocaleFromAcceptLanguage('zh-CN,zh;q=0.8'), 'en');
});

test('i18n: hi-IN,hi;q=0.8 → en (stillgelegt)', () => {
  assert.equal(detectLocaleFromAcceptLanguage('hi-IN,hi;q=0.8'), 'en');
});

test('i18n: bn-BD,bn;q=0.8 → en (stillgelegt)', () => {
  assert.equal(detectLocaleFromAcceptLanguage('bn-BD,bn;q=0.8'), 'en');
});

test('i18n: ru-RU,ru;q=0.8 → en (stillgelegt)', () => {
  assert.equal(detectLocaleFromAcceptLanguage('ru-RU,ru;q=0.8'), 'en');
});

test('i18n: fr-FR,fr;q=0.8 → fr', () => {
  assert.equal(detectLocaleFromAcceptLanguage('fr-FR,fr;q=0.8'), 'fr');
});

test('i18n: unbekannter Header → en (defaultLocale)', () => {
  assert.equal(detectLocaleFromAcceptLanguage('xx-XX,xx;q=0.9'), 'en');
});

test('i18n: null → en (defaultLocale)', () => {
  assert.equal(detectLocaleFromAcceptLanguage(null), 'en');
});

// ── Locale-Konfiguration ────────────────────────────────────────────────────

test('i18n: genau 5 öffentliche Locales', () => {
  assert.equal(locales.length, 5);
});

test('i18n: en ist defaultLocale (Zielmärkte international, kein DE-Default)', () => {
  assert.equal(defaultLocale, 'en');
});

test('i18n: nur EN/DE/FR/ES/PT sind aktiv', () => {
  const expected = ['de', 'en', 'fr', 'es', 'pt'];
  for (const l of expected) {
    assert.ok(locales.includes(l as never), `Locale fehlt: ${l}`);
  }
  // Stillgelegte Sprachen dürfen nicht mehr aktiv sein.
  for (const l of ['ar', 'hi', 'bn', 'ru', 'zh']) {
    assert.equal(locales.includes(l as never), false, `stillgelegte Locale noch aktiv: ${l}`);
  }
});

// ── Message-Dateien ─────────────────────────────────────────────────────────

test('i18n: alle message-Dateien existieren', () => {
  for (const locale of locales) {
    const path = resolve(process.cwd(), `messages/${locale}.json`);
    assert.ok(existsSync(path), `messages/${locale}.json fehlt`);
  }
});

test('i18n: alle message-Dateien haben nav-Key', () => {
  for (const locale of locales) {
    const path = resolve(process.cwd(), `messages/${locale}.json`);
    if (!existsSync(path)) continue;
    const messages = JSON.parse(readFileSync(path, 'utf8'));
    assert.ok(messages.nav, `messages/${locale}.json fehlt nav-Key`);
  }
});

// ── Safety ──────────────────────────────────────────────────────────────────

test('i18n: keine message-Datei enthält Secrets (sk_, re_, whsec_)', () => {
  for (const locale of locales) {
    const path = resolve(process.cwd(), `messages/${locale}.json`);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, 'utf8');
    assert.ok(
      !/(sk_|re_|whsec_|AC[0-9a-fA-F]{8})/.test(content),
      `Mögliches Secret in messages/${locale}.json`,
    );
  }
});

test('i18n: keine message-Datei enthält "DSGVO-konform"', () => {
  for (const locale of locales) {
    const path = resolve(process.cwd(), `messages/${locale}.json`);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, 'utf8');
    assert.ok(
      !content.includes('DSGVO-konform'),
      `"DSGVO-konform" in messages/${locale}.json gefunden`,
    );
  }
});

test('i18n: LanguageSwitcher-Komponente existiert', () => {
  const path = resolve(process.cwd(), 'components/language-switcher.tsx');
  assert.ok(existsSync(path), 'components/language-switcher.tsx fehlt');
});

test('i18n: detect-locale.ts exportiert detectLocaleFromAcceptLanguage', () => {
  // Bereits implizit durch die vorherigen Tests geprüft
  assert.ok(typeof detectLocaleFromAcceptLanguage === 'function');
});

// ── Locale-Routen: Dateien existieren ───────────────────────────────────────

test('i18n: app/[locale]/page.tsx existiert', () => {
  const path = resolve(process.cwd(), 'app/[locale]/page.tsx');
  assert.ok(existsSync(path), 'app/[locale]/page.tsx fehlt – /en würde 404 zeigen');
});

test('i18n: app/[locale]/layout.tsx existiert', () => {
  const path = resolve(process.cwd(), 'app/[locale]/layout.tsx');
  assert.ok(existsSync(path), 'app/[locale]/layout.tsx fehlt');
});

test('i18n: app/[locale]/pricing/page.tsx existiert', () => {
  const path = resolve(process.cwd(), 'app/[locale]/pricing/page.tsx');
  assert.ok(existsSync(path), 'app/[locale]/pricing/page.tsx fehlt – /en/pricing würde 404 zeigen');
});

test('i18n: app/[locale]/blog/page.tsx existiert', () => {
  const path = resolve(process.cwd(), 'app/[locale]/blog/page.tsx');
  assert.ok(existsSync(path), 'app/[locale]/blog/page.tsx fehlt – /en/blog würde 404 zeigen');
});

test('i18n: app/[locale]/blog/[slug]/page.tsx existiert', () => {
  const path = resolve(process.cwd(), 'app/[locale]/blog/[slug]/page.tsx');
  assert.ok(existsSync(path), 'app/[locale]/blog/[slug]/page.tsx fehlt');
});

// ── Middleware: createIntlMiddleware wird genutzt ────────────────────────────

test('i18n: middleware.ts importiert next-intl/middleware (createIntlMiddleware)', () => {
  const path = resolve(process.cwd(), 'middleware.ts');
  assert.ok(existsSync(path), 'middleware.ts fehlt');
  const content = readFileSync(path, 'utf8');
  assert.ok(
    content.includes('next-intl/middleware'),
    'middleware.ts nutzt nicht next-intl/middleware – /en könnte 404 zeigen',
  );
});

test('i18n: middleware.ts schützt /admin und /dashboard (Auth-Check)', () => {
  const content = readFileSync(resolve(process.cwd(), 'middleware.ts'), 'utf8');
  assert.ok(content.includes('"/admin"'), 'Auth-Schutz für /admin fehlt in middleware.ts');
  assert.ok(content.includes('"/dashboard"'), 'Auth-Schutz für /dashboard fehlt in middleware.ts');
});

test('i18n: middleware.ts leitet /admin NICHT auf /de/admin um', () => {
  const content = readFileSync(resolve(process.cwd(), 'middleware.ts'), 'utf8');
  // AUTH_PROTECTED must be handled BEFORE handleIntl – check structure
  const authIdx = content.indexOf('AUTH_PROTECTED');
  const intlIdx = content.indexOf('handleIntl(request)');
  assert.ok(authIdx > -1, 'AUTH_PROTECTED nicht in middleware.ts');
  assert.ok(intlIdx > -1, 'handleIntl nicht in middleware.ts');
  assert.ok(authIdx < intlIdx, '/admin muss vor dem intl-Redirect geprüft werden');
});

test('i18n: middleware.ts enthält breiten Matcher für öffentliche Routen', () => {
  const content = readFileSync(resolve(process.cwd(), 'middleware.ts'), 'utf8');
  // Der Matcher darf nicht nur /dashboard und /admin enthalten
  assert.ok(
    !content.includes('matcher: ["/dashboard/:path*", "/admin/:path*"]'),
    'Alter enger Matcher gefunden – öffentliche Locale-Routen würden nie erreichbar sein',
  );
  assert.ok(content.includes('matcher'), 'Kein Matcher in middleware.ts');
});

// ── Keine Cookies für Sprachpräferenz ────────────────────────────────────────

test('i18n: middleware.ts setzt keine Sprach-Cookies (NEXT_LOCALE)', () => {
  const content = readFileSync(resolve(process.cwd(), 'middleware.ts'), 'utf8');
  assert.ok(
    !content.toLowerCase().includes('next_locale'),
    'middleware.ts setzt NEXT_LOCALE-Cookie – widerspricht der No-Cookie-Anforderung',
  );
});

// ── Blog-Lokalisierung ────────────────────────────────────────────────────────

test('i18n: blog-translations.ts exportiert getLocalizedBlogPosts und getLocalizedPost', () => {
  const path = resolve(process.cwd(), 'lib/blog-translations.ts');
  assert.ok(existsSync(path), 'lib/blog-translations.ts fehlt');
  const content = readFileSync(path, 'utf8');
  assert.ok(content.includes('getLocalizedBlogPosts'), 'getLocalizedBlogPosts nicht exportiert');
  assert.ok(content.includes('getLocalizedPost'), 'getLocalizedPost nicht exportiert');
});

test('i18n: /de/blog zeigt deutschen Titel (STATIC_BLOG_POSTS)', async () => {
  // Dynamischer Import – node:test unterstützt ESM async
  const { getLocalizedBlogPosts } = await import('../lib/blog-translations');
  const posts = getLocalizedBlogPosts('de');
  assert.ok(posts.length > 0, 'Keine deutschen Blog-Posts');
  const first = posts[0];
  // Deutsch: Titel enthält kein englisches Wort wie "Appointment" oder "Medical"
  assert.ok(!first.title.includes('Appointment') && !first.title.includes('Medical'),
    `Deutscher Post hat englischen Titel: ${first.title}`);
});

test('i18n: /en/blog zeigt englischen Titel (nicht Deutsch)', async () => {
  const { getLocalizedBlogPosts } = await import('../lib/blog-translations');
  const posts = getLocalizedBlogPosts('en');
  assert.ok(posts.length > 0, 'Keine englischen Blog-Posts');
  const slugFound = posts.find((p) => p.slug === 'warteliste-arztpraxis-terminluecken');
  assert.ok(slugFound, 'Slug warteliste-arztpraxis-terminluecken nicht in EN-Posts');
  // Englisch: muss englischen Titel haben
  assert.ok(
    !slugFound.title.includes('Warteliste') && !slugFound.title.includes('Arztpraxis'),
    `EN-Post hat deutschen Titel: ${slugFound.title}`,
  );
});

test('i18n: /es/blog zeigt spanischen Titel (nicht Deutsch)', async () => {
  const { getLocalizedBlogPosts } = await import('../lib/blog-translations');
  const posts = getLocalizedBlogPosts('es');
  assert.ok(posts.length > 0, 'Keine spanischen Blog-Posts');
  const allGerman = posts.every((p) => p.title.includes('Warteliste') || p.title.includes('Terminausfälle'));
  assert.ok(!allGerman, 'ES-Posts zeigen noch deutsche Titel');
});

test('i18n: /ar/blog zeigt arabischen Titel (nicht Deutsch)', async () => {
  const { getLocalizedBlogPosts } = await import('../lib/blog-translations');
  const posts = getLocalizedBlogPosts('ar');
  assert.ok(posts.length > 0, 'Keine arabischen Blog-Posts');
  // Arabisch enthält Unicode-Zeichen, kein lateinisches Alphabet für Haupttitel
  const first = posts[0];
  assert.ok(
    !first.title.includes('Warteliste') && !first.title.includes('Arztpraxis'),
    `AR-Post hat deutschen Titel: ${first.title}`,
  );
});

test('i18n: /fr/blog zeigt französischen Titel (nicht Deutsch)', async () => {
  const { getLocalizedBlogPosts } = await import('../lib/blog-translations');
  const posts = getLocalizedBlogPosts('fr');
  assert.ok(posts.length > 0, 'Keine französischen Blog-Posts');
  const allGerman = posts.every((p) => p.title.startsWith('Warteliste') || p.title.startsWith('Terminausfälle'));
  assert.ok(!allGerman, 'FR-Posts zeigen noch deutsche Titel');
});

test('i18n: Unbekannte Locale → DE-Fallback bei getLocalizedBlogPosts', async () => {
  const { getLocalizedBlogPosts } = await import('../lib/blog-translations');
  const posts = getLocalizedBlogPosts('xx');
  assert.ok(posts.length > 0, 'Kein Fallback auf DE für unbekannte Locale');
});

test('i18n: getLocalizedPost gibt null für unbekannten Slug zurück', async () => {
  const { getLocalizedPost } = await import('../lib/blog-translations');
  const post = getLocalizedPost('nicht-vorhandener-slug', 'en');
  assert.equal(post, null, 'getLocalizedPost soll null für unbekannten Slug liefern');
});

test('i18n: Blog-Artikel enthalten kein "DSGVO-konform"', () => {
  const path = resolve(process.cwd(), 'lib/blog-translations.ts');
  const content = readFileSync(path, 'utf8');
  assert.ok(
    !content.includes('DSGVO-konform'),
    'blog-translations.ts enthält verbotenen Text "DSGVO-konform"',
  );
});

test('i18n: Blog-Artikel enthalten keine Secrets (sk_, re_, whsec_)', () => {
  const path = resolve(process.cwd(), 'lib/blog-translations.ts');
  const content = readFileSync(path, 'utf8');
  assert.ok(
    !/(sk_|re_|whsec_|AC[0-9a-fA-F]{8})/.test(content),
    'Mögliches Secret in lib/blog-translations.ts',
  );
});

test('i18n: blog/page.tsx verwendet getLocalizedBlogPosts', () => {
  const path = resolve(process.cwd(), 'app/[locale]/blog/page.tsx');
  const content = readFileSync(path, 'utf8');
  assert.ok(
    content.includes('getLocalizedBlogPosts'),
    'app/[locale]/blog/page.tsx nutzt nicht getLocalizedBlogPosts – Blog zeigt immer Deutsch',
  );
});

test('i18n: blog/[slug]/page.tsx verwendet getLocalizedPost', () => {
  const path = resolve(process.cwd(), 'app/[locale]/blog/[slug]/page.tsx');
  const content = readFileSync(path, 'utf8');
  assert.ok(
    content.includes('getLocalizedPost'),
    'app/[locale]/blog/[slug]/page.tsx nutzt nicht getLocalizedPost – Blogartikel zeigt immer Deutsch',
  );
});
