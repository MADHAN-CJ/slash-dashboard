// The only place the domain, brand strings and site-wide IDs live.
export const SITE = {
  url: "https://slash.markets",
  name: "slash.markets", // always written this way in text (CLAUDE.md, hard rule 1); "/markets" is the visual word mark only
  alternateNames: ["slash markets"], // how people say it; structured data only, never in copy
  lang: "en",
  ogLocale: "en_IN",
  appUrl: "https://app.slash.markets",
  waitlistEndpoint:
    "https://script.google.com/macros/s/AKfycbwSZiOdsnn9nk83jMygXsKNbQFwKw7EVOz3bHYTeqVkpPy1cZgSTS_xlauvz0J3SBrk/exec",
  defaultOgImage: "/og/default.jpg",
  logo: "/assets/icons/markets-logomark.svg",
} as const;
