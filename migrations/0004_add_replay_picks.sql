-- The picks behind each daily-run score, so players can see how everyone else called each session.
ALTER TABLE replay_scores ADD COLUMN picks TEXT;
