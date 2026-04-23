-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Draw" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "month" TEXT NOT NULL,
    "winningNumbers" TEXT NOT NULL,
    "pool5" REAL NOT NULL DEFAULT 0,
    "pool4" REAL NOT NULL DEFAULT 0,
    "pool3" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Draw" ("createdAt", "id", "month", "winningNumbers") SELECT "createdAt", "id", "month", "winningNumbers" FROM "Draw";
DROP TABLE "Draw";
ALTER TABLE "new_Draw" RENAME TO "Draw";
CREATE TABLE "new_Winner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "drawId" TEXT NOT NULL,
    "matchType" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "proofUrl" TEXT,
    "prizeAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Winner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Winner_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Winner" ("createdAt", "drawId", "id", "matchType", "proofUrl", "status", "userId") SELECT "createdAt", "drawId", "id", "matchType", "proofUrl", "status", "userId" FROM "Winner";
DROP TABLE "Winner";
ALTER TABLE "new_Winner" RENAME TO "Winner";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
