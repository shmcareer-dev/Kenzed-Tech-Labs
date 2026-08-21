-- CreateTable
CREATE TABLE `leads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `company` VARCHAR(160) NULL,
    `service` VARCHAR(140) NOT NULL,
    `budget` VARCHAR(60) NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'ARCHIVED') NOT NULL DEFAULT 'NEW',
    `sourcePath` VARCHAR(255) NULL,
    `userAgent` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `leads_createdAt_idx`(`createdAt`),
    INDEX `leads_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
