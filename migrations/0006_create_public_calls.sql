-- Publication-test calls released to the public scoreboard. The trading system re-sends the full list each morning;
-- rows are upserted and never deleted, and first_received_at keeps the time a call first reached the site.
CREATE TABLE IF NOT EXISTS public_calls (
  entry_day TEXT NOT NULL,
  ticker TEXT NOT NULL,
  crash_pct REAL,
  price REAL,
  released_at TEXT,
  published_before_outcome INTEGER,
  excess_return REAL,
  big_drop INTEGER,
  first_received_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (entry_day, ticker)
);
