/*
  Warnings:

  - Made the column `jenisPemohonId` on table `pemohon` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `pemohon` DROP FOREIGN KEY `Pemohon_jenisPemohonId_fkey`;

-- AlterTable
ALTER TABLE `pemohon` MODIFY `jenisPemohonId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Pemohon` ADD CONSTRAINT `Pemohon_jenisPemohonId_fkey` FOREIGN KEY (`jenisPemohonId`) REFERENCES `JenisPemohon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
