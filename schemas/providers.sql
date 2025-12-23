CREATE TABLE providers (
  token TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subscribe_uri TEXT NOT NULL,
  direct_domains TEXT NOT NULL
)
