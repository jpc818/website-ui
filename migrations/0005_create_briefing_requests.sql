-- Research briefing requests from the header form. Individual traders who submit it are joining the beta waitlist.
CREATE TABLE IF NOT EXISTS briefing_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  firm TEXT,
  country TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
