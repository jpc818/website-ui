# Pre-registration: does publishing a drop call change the outcome?

Status: **draft, not started.** The test begins on the first entry day set as `publication.start_day`
in `config.yaml`. Before that day, publish this document (or its SHA-256) somewhere with a public
timestamp, together with the salt commitment below. After that, the sections marked *fixed* may not
change; any later change goes in the deviations log at the end with its date and reason.

## Question (fixed)

When jargAI publishes a "hard drop" call before its outcome is known, does the stock behave
differently from an equally ranked call that is published only after its outcome? Either direction
counts. The crowd may pile in behind a public warning and make it self-fulfilling, or traders may
fade it and make it self-defeating.

## Design (fixed)

- **Unit:** one live call, meaning one stock on one entry day, scored by the 09:40 ET daily run.
- **Eligible:** live (not backfilled) calls with crash score at or above the 80th percentile of
  walk-forward scores (`crash_pct >= 80`) on or after `start_day`.
- **Arms:**
  - *publish*: added to the public scoreboard the same morning, about ten minutes after the open.
  - *hold*: added to the scoreboard once its third session has closed.

  Every call is eventually public, and both arms are scored, traded and sized by the same rules.
  Only the timing differs.
- **Assignment:** `publish` if the last byte of HMAC-SHA256(salt, "entry_day|ticker") is odd, else
  `hold` (`src/publication.py`). It is a fair coin per call that no one can steer, and it is recorded at
  scoring time and never overwritten.
- **Salt commitment:** SHA-256 of the salt is
  `3b1ed3cf877f55c6225ff0917ef21c942f88333cfa26dc0545cb8f48c197400b`.
  The salt is revealed when the analysis is published, so anyone can recompute every assignment.
- **Blinding:** guest dashboard links show scores only after outcomes are closed (`GUEST_DELAY_DAYS`).
  The only people who see hold-arm calls early are the operators.

## Outcomes (fixed)

All are measured as stock return minus SPY return, from the entry day's open to the close three
sessions later, which is the backtest definition (`scripts/publication_test.py`).

1. **Primary:** big drop, meaning excess return at or below -10%. Effect = publish rate minus hold rate.
2. **Secondary:** excess return clipped to [-50%, +50%]. Effect = publish mean minus hold mean.
3. **Mechanism:**
   - Attention response = log((distinct Reddit authors naming the ticker in the 72 h after the open + 1) /
     (the same in the 72 h before + 1)).
   - jargAI mentions = posts naming the ticker and "jarg" in the 72 h after the open.
4. **Exposure (descriptive):** scoreboard page views per published call, from the site's logs. This
   cannot be compared across arms, but it shows whether the treatment reached anyone.

## Sample size and stopping (fixed)

From the 2025–2026 backfilled scores (`scripts/publication_test.py --power`):

| Tier | Calls per session | Big-drop rate | Calls per arm, 12 months | Detectable difference, drop rate | Detectable difference, excess |
|---|---|---|---|---|---|
| `crash_pct >= 80` | 3.59 | 47.6% | 452 | 9.3 pp | 4.1 pp |

Detectable means 80% power at 5% two-sided. The analysis runs once, when 900 eligible calls
(`publication.end_resolved_calls`) have resolved, which is about 12 months of trading. There are no
interim looks at outcomes. Before then, `scripts/publication_test.py` reports only counts and arm
balance; `--peek` output is never reported as a result.

## Analysis (fixed)

- **Test:** for each outcome, a randomization test that redraws every call's arm as a fair coin
  (10,000 draws, seed 20261124) and gives a two-sided p-value. This matches how arms were assigned and
  needs no model of how calls on the same day move together.
- **Primary result:** the primary outcome at 5%. The other outcomes are reported with their p-values
  and are not corrected for multiplicity; they are interpreted as supporting evidence only.
- **Missing data:** calls with no price bar on the entry day or the exit day are dropped from outcome
  analysis. They are reported by arm, and an arm imbalance in drops counts as a problem with the test.
- **Integrity checks, reported first:**
  - the share of calls assigned to publish (it should be near 50%);
  - mean crash score by arm;
  - publish-arm calls released after their entry day.
- **What a null means:** a primary difference inside ±9 pp with p > 0.05 is reported as "no
  detectable effect of publication at this audience size". It is not reported as "publication has no
  effect": the effect may grow with audience size, so it is reported alongside the exposure data.

## Known limits

- The audience is small at launch, so a null may only mean the public didn't see the calls yet.
- jargAI's own trades in these names are identical across arms, so they shift both arms equally and do
  not bias the comparison.
- Reddit is the only attention source in the mechanism outcome. StockTwits, Bluesky and X can be
  added as exploratory outcomes, labelled as such.

## Deviations log

_None yet._
