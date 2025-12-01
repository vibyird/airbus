CREATE TABLE subscribers (
  token TEXT PRIMARY KEY,
  subscribe_name TEXT NOT NULL,
  subscribe_url TEXT NOT NULL,
  direct_domains TEXT NOT NULL
)
