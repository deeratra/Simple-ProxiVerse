/*
  Warnings:

  - You are about to drop the column `height` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "height",
DROP COLUMN "width";
