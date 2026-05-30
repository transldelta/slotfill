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

test('i18n: zh-CN,zh;q=0.8 → zh', () => {
  assert.equal(detectLocaleFromAcceptLanguage('zh-CN,zh;q=0.8'), 'zh');
});

test('i18n: hi-IN,hi;q=0.8 → hi', () => {
  assert.equal(detectLocaleFromAcceptLanguage('hi-IN,hi;q=0.8'), 'hi');
});

test('i18n: bn-BD,bn;q=0.8 → bn', () => {
  assert.equal(detectLocaleFromAcceptLanguage('bn-BD,bn;q=0.8'), 'bn');
});

test('i18n: ru-RU,ru;q=0.8 → ru', () => {
  assert.equal(detectLocaleFromAcceptLanguage('ru-RU,ru;q=0.8'), 'ru');
});

test('i18n: unbekannter Header → de (defaultLocale)', () => {
  assert.equal(detectLocaleFromAcceptLanguage('xx-XX,xx;q=0.9'), 'de');
});

test('i18n: null → de (defaultLocale)', () => {
  assert.equal(detectLocaleFromAcceptLanguage(null), 'de');
});

// ── Locale-Konfiguration ────────────────────────────────────────────────────

test('i18n: genau 10 Locales', () => {
  assert.equal(locales.length, 10);
});

test('i18n: de ist defaultLocale', () => {
  assert.equal(defaultLocale, 'de');
});

test('i18n: alle erwarteten Locales vorhanden', () => {
  const expected = ['de', 'en', 'zh', 'hi', 'es', 'ar', 'fr', 'pt', 'bn', 'ru'];
  for (const l of expected) {
    assert.ok(locales.includes(l as never), `Locale fehlt: ${l}`);
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
