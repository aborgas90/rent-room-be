-- CreateTable
CREATE TABLE `User` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `telephone` VARCHAR(13) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roles` (
    `roles_id` INTEGER NOT NULL AUTO_INCREMENT,
    `roles_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Roles_roles_name_key`(`roles_name`),
    PRIMARY KEY (`roles_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User_Roles` (
    `user_roles_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `roles_id` INTEGER NOT NULL,

    UNIQUE INDEX `User_Roles_user_id_roles_id_key`(`user_id`, `roles_id`),
    PRIMARY KEY (`user_roles_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User_Roles` ADD CONSTRAINT `User_Roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_Roles` ADD CONSTRAINT `User_Roles_roles_id_fkey` FOREIGN KEY (`roles_id`) REFERENCES `Roles`(`roles_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
