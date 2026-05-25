import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePhone, sendAppointmentOfferMessage } from "../lib/messaging";

function resetEnv() {
  delete process.env.MESSAGING_PROVIDER;
  delete process.env.MESSAGING_DRY_RUN;
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_SMS_FROM;
  delete process.env.TWILIO_WHATSAPP_FROM;
  delete process.env.TWILIO_WHATSAPP_CONTENT_SID;
}

test("normalizePhone akzeptiert E.164 und lehnt Ungültiges ab", () => {
  assert.equal(normalizePhone("+491701234567"), "+491701234567");
  assert.equal(normalizePhone("+49 170 123 45 67"), "+491701234567");
  assert.equal(normalizePhone("01701234567"), null);
  assert.equal(normalizePhone(null), null);
});

test("Provider none -> skipped_no_provider", async () => {
  resetEnv();
  const r = await sendAppointmentOfferMessage({ to: "+491701234567", body: "x" });
  assert.equal(r.status, "skipped_no_provider");
});

test("Ungültige Telefonnummer -> skipped_invalid_phone", async () => {
  resetEnv();
  process.env.MESSAGING_PROVIDER = "twilio_sms";
  const r = await sendAppointmentOfferMessage({ to: "abc", body: "x" });
  assert.equal(r.status, "skipped_invalid_phone");
});

test("Dry-Run gibt NICHT 'sent' zurück, sondern 'dry_run'", async () => {
  resetEnv();
  process.env.MESSAGING_PROVIDER = "twilio_sms";
  process.env.MESSAGING_DRY_RUN = "true";
  process.env.TWILIO_ACCOUNT_SID = "AC_test";
  process.env.TWILIO_AUTH_TOKEN = "token_test";
  process.env.TWILIO_SMS_FROM = "+4915110001000";
  const r = await sendAppointmentOfferMessage({ to: "+491701234567", body: "x" });
  assert.notEqual(r.status, "sent");
  assert.equal(r.status, "dry_run");
});

test("WhatsApp ohne Vorlage -> skipped_whatsapp_template_missing", async () => {
  resetEnv();
  process.env.MESSAGING_PROVIDER = "twilio_whatsapp";
  process.env.TWILIO_ACCOUNT_SID = "AC_test";
  process.env.TWILIO_AUTH_TOKEN = "token_test";
  process.env.TWILIO_WHATSAPP_FROM = "+14155238886";
  // kein TWILIO_WHATSAPP_CONTENT_SID
  const r = await sendAppointmentOfferMessage({ to: "+491701234567", body: "x" });
  assert.equal(r.status, "skipped_whatsapp_template_missing");
});
