CREATE TABLE providers (
  token TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  subscribe_uri TEXT NOT NULL,
  direct_domains TEXT NOT NULL,
  exclude_regex TEXT NOT NULL
);
