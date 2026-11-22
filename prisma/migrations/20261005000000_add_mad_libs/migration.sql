-- CreateTable
CREATE TABLE "Blank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storyId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "word" TEXT,
    "playerId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Blank_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Blank_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "shareCode" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'freeform',
    "templateId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Story" ("content", "createdAt", "id", "shareCode", "title", "updatedAt") SELECT "content", "createdAt", "id", "shareCode", "title", "updatedAt" FROM "Story";
DROP TABLE "Story";
ALTER TABLE "new_Story" RENAME TO "Story";
CREATE UNIQUE INDEX "Story_shareCode_key" ON "Story"("shareCode");
CREATE INDEX "Story_shareCode_idx" ON "Story"("shareCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Blank_storyId_idx" ON "Blank"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "Blank_storyId_index_key" ON "Blank"("storyId", "index");

