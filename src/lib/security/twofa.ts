import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import { db, type TwoFactorConfig } from "@/lib/db/schema";

const CONFIG_ID = "primary";
const SESSION_ID = "active";
export const TWO_FA_SESSION_MS = 8 * 60 * 60 * 1000;

function encoder() {
  return new TextEncoder();
}

function decoder() {
  return new TextDecoder();
}

async function deriveKey() {
  const material = await crypto.subtle.importKey("raw", encoder().encode(`${navigator.userAgent}|serey-padma-by-celine-2fa`), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder().encode("padma-2fa-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptSecret(secret: string): Promise<string> {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey();
    const buf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder().encode(secret));
    const payload = `${btoa(String.fromCharCode(...iv))}:${btoa(String.fromCharCode(...new Uint8Array(buf)))}`;
    return payload;
  } catch {
    return `plain:${secret}`;
  }
}

async function decryptSecret(secretEncrypted: string): Promise<string> {
  if (secretEncrypted.startsWith("plain:")) return secretEncrypted.slice(6);
  const [ivB64, dataB64] = secretEncrypted.split(":");
  if (!ivB64 || !dataB64) return "";
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataB64), (c) => c.charCodeAt(0));
  const key = await deriveKey();
  const clear = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return decoder().decode(clear);
}

export async function getTwoFactorConfig() {
  if (!db) return null;
  return db.twoFactorConfig.get(CONFIG_ID);
}

export async function isTwoFactorEnabled() {
  const cfg = await getTwoFactorConfig();
  return !!cfg?.enabled;
}

export async function generateTwoFactorSetup(accountLabel: string) {
  const secret = generateSecret();
  const issuer = "Serey Padma by Céline";
  const otpauth = generateURI({
    issuer,
    label: accountLabel || "celine",
    secret,
    strategy: "totp",
  });
  const qrDataUrl = await QRCode.toDataURL(otpauth, { margin: 1, width: 260 });
  return { secret, issuer, otpauth, qrDataUrl };
}

export async function saveTwoFactorConfig(params: { secret: string; accountLabel: string }) {
  if (!db) return;
  const now = Date.now();
  const encrypted = await encryptSecret(params.secret);
  await db.twoFactorConfig.put({
    id: CONFIG_ID,
    secretEncrypted: encrypted,
    issuer: "Serey Padma by Céline",
    accountLabel: params.accountLabel,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  });
}

async function resolveSecret(cfg: TwoFactorConfig): Promise<string> {
  try {
    return await decryptSecret(cfg.secretEncrypted);
  } catch {
    return "";
  }
}

export async function verifyTwoFactorCode(code: string) {
  const cfg = await getTwoFactorConfig();
  if (!cfg?.enabled) return { ok: false as const, reason: "not_setup" as const };
  const secret = await resolveSecret(cfg);
  if (!secret) return { ok: false as const, reason: "invalid_secret" as const };
  const checked = verifySync({
    secret,
    token: code.replace(/\s+/g, ""),
    strategy: "totp",
  });
  const valid = "valid" in checked ? checked.valid : false;
  if (!valid) return { ok: false as const, reason: "invalid" as const };
  const now = Date.now();
  await db?.twoFactorSession.put({
    id: SESSION_ID,
    verifiedAt: now,
    expiresAt: now + TWO_FA_SESSION_MS,
    updatedAt: now,
  });
  return { ok: true as const };
}

export async function readTwoFactorSession() {
  if (!db) return null;
  return db.twoFactorSession.get(SESSION_ID);
}

export async function isTwoFactorSessionValid() {
  const s = await readTwoFactorSession();
  return !!s && s.expiresAt > Date.now();
}

export async function clearTwoFactorSession() {
  await db?.twoFactorSession.delete(SESSION_ID);
}

export async function disableTwoFactorWithCode(code: string) {
  const checked = await verifyTwoFactorCode(code);
  if (!checked.ok) return checked;
  const cfg = await getTwoFactorConfig();
  if (!cfg) return { ok: false as const, reason: "not_setup" as const };
  await db?.twoFactorConfig.put({
    ...cfg,
    enabled: false,
    updatedAt: Date.now(),
  });
  await clearTwoFactorSession();
  return { ok: true as const };
}
