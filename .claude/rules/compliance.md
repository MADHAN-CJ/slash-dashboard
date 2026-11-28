# Compliance: what slash.markets can and cannot say

slash.markets is a charting and analytics application. It is not registered with SEBI as an investment adviser or research analyst. Everything on this site is research and education. Sahil (the slash.markets compliance owner) signs off every page and article before it goes live. These rules apply to all copy: pages, articles, FAQs, image text, alt text, titles and descriptions.

## Words

- Use "analysis", "briefs" and "alerts".
- Never "tips", "calls" (in the sense of buy or sell calls), "signals" or "recommendations".
- **Banned phrases.** The build fails if one appears:
  - stock tips, trading tips
  - buy call, sell call, buy or sell calls
  - trading signals, buy signal, sell signal
  - stock recommendations, target price, best stocks
  - guaranteed returns, guaranteed, win rate, backtest returns
  - never miss a move
- **Single words** "tips", "signals" and "recommendation(s)" raise a build warning for review.
- **Options vocabulary is fine:** "call option", "put option", "call OI", "calls and puts", "put-call ratio". The check does not flag them.
- **Exceptions.** Where a banned phrase is genuinely educational (for example "how a buy call option works"), add an exception to `compliance/allow.json` with `path`, `phrase`, `reason`, `approvedBy` and `date`. Only Sahil approves entries.

## Claims

- **Only what is live today.**
  - Integrations, markets and features not live yet are marked "coming" or left out.
  - The status comes from `src/data/facts.json`, never from memory.
- **Data.** Say data is "delayed by at least N minutes", with N from `facts.json`. Never "real-time" unless `facts.json` says so.
- **Alerts.** Say they "can be delayed", and say how they are delivered today.
- **Results.** No returns, profit figures, win rates, accuracy guarantees or backtest results.
- **Orders.** slash.markets places no orders and has read-only access. Say so wherever someone could wonder.

## Forecasts

- No predictions about prices, levels or market direction.
- A topic that asks for a prediction ("where will Nifty close") is out of scope.

## Examples, screenshots and people

- **Examples** use sample or past data, with the date stated.
- **Never show** a real user's name, trades, positions, P&L or account.
- **Never name a real user** or quote one by name, including in commit messages and file names.
- **Quotes** from users are allowed only anonymised and with the user's written consent, recorded by the slash.markets team.

## Comparisons and best lists

- **Rank products, never securities.** Judge them by fit for a job, with the reason.
- **Competitor facts** (features, prices, plans) need a source link and the date you checked it. Show the date on the page (`reviewedOn`).
- **Disclose that we make slash.markets.** When slash.markets appears in a list or comparison, say so in the first lines.
- **Be fair:** state where other tools are better.
- **Naming competitors** needs the slash.markets team's approval. Sahil's sign-off on the page records it.

## Disclaimer

- Every page links to /disclaimer from the footer.
- Articles also end with a one-line note linking to it.
- Sahil approves the disclaimer text. It builds on the "Important information" block on the current homepage.

## Privacy

- **The privacy page lists everything the site collects:**
  - the waitlist email;
  - the page, referrer and browser details stored with it;
  - Google Analytics.
- **Any new form, tracker or third-party script** updates the privacy page in the same pull request, with Sahil's OK.

## Sign-off flow

1. Prefer or the slash.markets team opens a pull request with the entry as `draft: true` (or a registry page as `draft`).
2. Prefer reviews the deploy preview against the sign-off checklist.
3. Sahil reviews the preview and approves.
4. Record it: `signoff: { by: "Sahil", on: <date> }`, plus `draft: false` or `status: "live"`.
5. Prefer or Madhan merge.

The build fails if anything goes live without a sign-off.
