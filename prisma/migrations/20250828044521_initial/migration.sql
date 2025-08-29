-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleName` VARCHAR(191) NOT NULL,
    `permission` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Role_roleName_key`(`roleName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullname` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `photo` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `roleId` INTEGER NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    INDEX `User_roleId_idx`(`roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JenisPemohon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `JenisPemohon_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pemohon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullname` VARCHAR(191) NOT NULL,
    `NIK` VARCHAR(191) NULL,
    `noCIF` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `jenisPemohonId` INTEGER NULL,

    INDEX `Pemohon_jenisPemohonId_idx`(`jenisPemohonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermohonanKredit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purposeUse` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `activity` TEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `produkId` INTEGER NOT NULL,
    `pemohonId` INTEGER NOT NULL,

    INDEX `PermohonanKredit_createdAt_idx`(`createdAt`),
    INDEX `PermohonanKredit_userId_idx`(`userId`),
    INDEX `PermohonanKredit_pemohonId_idx`(`pemohonId`),
    INDEX `PermohonanKredit_produkId_idx`(`produkId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RootFiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NULL DEFAULT 1,

    UNIQUE INDEX `RootFiles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `allowDownload` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rootFilesId` INTEGER NOT NULL,
    `permohonanKreditId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermohonanAction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `statusAction` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `description` TEXT NULL,
    `action` ENUM('DOWNLOAD', 'DELETE') NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `requesterId` INTEGER NOT NULL,
    `approverId` INTEGER NULL,
    `permohonanKreditId` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `table` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `serverIP` VARCHAR(191) NOT NULL,
    `userAgent` VARCHAR(191) NULL,
    `sendData` TEXT NOT NULL,
    `returnStatus` VARCHAR(191) NOT NULL,
    `detail` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NULL,

    INDEX `Logs_userId_idx`(`userId`),
    INDEX `Logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FilesToPermohonanAction` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_FilesToPermohonanAction_AB_unique`(`A`, `B`),
    INDEX `_FilesToPermohonanAction_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pemohon` ADD CONSTRAINT `Pemohon_jenisPemohonId_fkey` FOREIGN KEY (`jenisPemohonId`) REFERENCES `JenisPemohon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermohonanKredit` ADD CONSTRAINT `PermohonanKredit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermohonanKredit` ADD CONSTRAINT `PermohonanKredit_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermohonanKredit` ADD CONSTRAINT `PermohonanKredit_pemohonId_fkey` FOREIGN KEY (`pemohonId`) REFERENCES `Pemohon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Files` ADD CONSTRAINT `Files_rootFilesId_fkey` FOREIGN KEY (`rootFilesId`) REFERENCES `RootFiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Files` ADD CONSTRAINT `Files_permohonanKreditId_fkey` FOREIGN KEY (`permohonanKreditId`) REFERENCES `PermohonanKredit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermohonanAction` ADD CONSTRAINT `PermohonanAction_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermohonanAction` ADD CONSTRAINT `PermohonanAction_approverId_fkey` FOREIGN KEY (`approverId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermohonanAction` ADD CONSTRAINT `PermohonanAction_permohonanKreditId_fkey` FOREIGN KEY (`permohonanKreditId`) REFERENCES `PermohonanKredit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Logs` ADD CONSTRAINT `Logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilesToPermohonanAction` ADD CONSTRAINT `_FilesToPermohonanAction_A_fkey` FOREIGN KEY (`A`) REFERENCES `Files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilesToPermohonanAction` ADD CONSTRAINT `_FilesToPermohonanAction_B_fkey` FOREIGN KEY (`B`) REFERENCES `PermohonanAction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
