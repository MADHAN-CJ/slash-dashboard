/*
 * /markets waitlist — framework-agnostic form binder.
 *
 * Posts { email, source, page, referrer, ua, hp } as JSON to a Google Apps Script
 * web app (see waitlist-apps-script.gs), which appends a row to a Google Sheet.
 *
 * Usage (static HTML):   <script type="module" src="waitlist.js"></script>
 *                        <form id="waitform" data-endpoint="https://script.google.com/macros/s/…/exec">
 * Usage (Astro):         import { bindWaitlistForm } from "../lib/waitlist.js";
 *                        bindWaitlistForm(form, { endpoint: import.meta.env.PUBLIC_WAITLIST_ENDPOINT });
 *
 * The request is sent as text/plain so the browser skips the CORS preflight,
 * which Apps Script cannot answer; the script's JSON reply is still readable.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function submitWaitlist(email, { endpoint, source = "website", honeypot = "" } = {}) {
  if (!endpoint) throw new Error("waitlist endpoint not configured");
  const payload = {
    email,
    source,
    hp: honeypot,
    page: location.href,
    referrer: document.referrer || "",
    ua: navigator.userAgent,
  };
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`waitlist http ${res.status}`);
  const data = await res.json().catch(() => ({ ok: false, error: "bad_json" }));
  if (!data.ok) throw new Error(data.error || "waitlist rejected");
  return data; // { ok: true, duplicate?: true }
}

export function bindWaitlistForm(form, opts = {}) {
  if (!form || form.dataset.waitlistBound) return;
  form.dataset.waitlistBound = "1";

  const endpoint = opts.endpoint || form.dataset.endpoint || "";
  const source = opts.source || form.dataset.source || "website";
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"]');
  const honey = form.querySelector('input[name="company"]');
  const status = opts.statusEl || document.getElementById(form.getAttribute("aria-describedby")) || form.nextElementSibling;
  const idle = button ? button.innerHTML : "";

  const say = (msg, kind) => {
    if (!status) return;
    status.textContent = msg;
    status.dataset.kind = kind || "";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (input?.value || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      say("Please enter a valid email address.", "error");
      input?.focus();
      return;
    }
    if (!endpoint) {
      say("The waitlist isn’t open yet. Please try again shortly.", "error");
      return;
    }
    form.classList.add("is-busy");
    if (button) { button.disabled = true; button.textContent = "Joining…"; }
    say("", "");
    try {
      const r = await submitWaitlist(email, { endpoint, source, honeypot: honey?.value || "" });
      form.classList.remove("is-busy");
      form.classList.add("is-done");
      say(r.duplicate ? "You’re already on the list — we’ll be in touch." : "You’re on the list. We’ll write when it’s your turn.", "ok");
      form.reset();
    } catch (err) {
      form.classList.remove("is-busy");
      say("Something went wrong. Please try again, or email hello@slash.markets.", "error");
      if (typeof console !== "undefined") console.warn("[waitlist]", err);
    } finally {
      if (button) { button.disabled = false; button.innerHTML = idle; }
    }
  });
}

// Auto-bind on static pages.
if (typeof document !== "undefined") {
  const auto = () => bindWaitlistForm(document.getElementById("waitform"));
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", auto) : auto();
}
