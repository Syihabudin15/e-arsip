/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Produk` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Produk` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `produk` ADD COLUMN `code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Produk_code_key` ON `Produk`(`code`);
