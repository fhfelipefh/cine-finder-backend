/*
  Warnings:

  - You are about to drop the column `author` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `imdbId` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `ipHash` on the `comments` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movieId` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."comments_imdbId_idx";

-- AlterTable
ALTER TABLE "public"."comments" DROP COLUMN "author",
DROP COLUMN "imdbId",
DROP COLUMN "ipHash",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD COLUMN     "movieId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."authors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."movies" (
    "id" SERIAL NOT NULL,
    "imdbId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authors_name_ipHash_key" ON "public"."authors"("name", "ipHash");

-- CreateIndex
CREATE UNIQUE INDEX "movies_imdbId_key" ON "public"."movies"("imdbId");

-- CreateIndex
CREATE INDEX "comments_movieId_idx" ON "public"."comments"("movieId");

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
