/**
 * A pluggable mailer. Set RESEND_API_KEY to send through Resend, or SMTP_HOST (and friends) to send
 * through any SMTP server. With neither set, mail is printed to the server console and the call
 * succeeds, so forms work in development.
 */
import "server-only";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

const from = () => process.env.MAIL_FROM ?? "EngineMarket <sales@enginemarket.eu>";
export const salesInbox = () => process.env.MAIL_TO ?? "sales@enginemarket.eu";

async function viaResend(mail: Mail) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: from(), to: [mail.to], subject: mail.subject, text: mail.text, reply_to: mail.replyTo }),
  });
  if (!res.ok) throw new Error(`Resend answered ${res.status}: ${await res.text()}`);
}

async function viaSmtp(mail: Mail) {
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transport.sendMail({ from: from(), to: mail.to, subject: mail.subject, text: mail.text, replyTo: mail.replyTo });
}

export function mailerMode(): "resend" | "smtp" | "console" {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST) return "smtp";
  return "console";
}

export async function sendMail(mail: Mail): Promise<void> {
  const mode = mailerMode();
  if (mode === "resend") return viaResend(mail);
  if (mode === "smtp") return viaSmtp(mail);
  console.info(`\n[mail:console] to ${mail.to}\n[mail:console] ${mail.subject}\n${mail.text}\n`);
}

/** Lines of "Label: value", skipping empty values. */
export function lines(fields: Record<string, string | number | undefined | null>): string {
  return Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
