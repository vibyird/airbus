CREATE TABLE IF NOT EXISTS "providers" (
  "token" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "subscribe_uri" TEXT NOT NULL,
  "direct_domains" TEXT NOT NULL,
  "exclude_regex" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "users"(
  "uid" INTEGER NOT NULL PRIMARY KEY,
  "nickname" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "token" TEXT NOT NULL PRIMARY KEY,
  "uid" INTEGER NOT NULL,
  "expires" TEXT NOT NULL
);
