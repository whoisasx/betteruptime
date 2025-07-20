/*
  Warnings:

  - You are about to drop the column `website_id` on the `website_tick` table. All the data in the column will be lost.
  - Added the required column `website_url` to the `website_tick` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "website_tick" DROP CONSTRAINT "website_tick_website_id_fkey";

-- AlterTable
ALTER TABLE "website_tick" DROP COLUMN "website_id",
ADD COLUMN     "website_url" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "website_tick" ADD CONSTRAINT "website_tick_website_url_fkey" FOREIGN KEY ("website_url") REFERENCES "website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
