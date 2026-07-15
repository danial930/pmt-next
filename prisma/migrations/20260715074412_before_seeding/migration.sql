/*
  Warnings:

  - The `createdBy` column on the `permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedBy` column on the `permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdBy` column on the `refresh_tokens` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedBy` column on the `refresh_tokens` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdBy` column on the `role_permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedBy` column on the `role_permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdBy` column on the `roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedBy` column on the `roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdBy` column on the `user_roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedBy` column on the `user_roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" INTEGER,
DROP COLUMN "updatedBy",
ADD COLUMN     "updatedBy" INTEGER;

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" INTEGER,
DROP COLUMN "updatedBy",
ADD COLUMN     "updatedBy" INTEGER;

-- AlterTable
ALTER TABLE "role_permissions" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" INTEGER,
DROP COLUMN "updatedBy",
ADD COLUMN     "updatedBy" INTEGER;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" INTEGER,
DROP COLUMN "updatedBy",
ADD COLUMN     "updatedBy" INTEGER;

-- AlterTable
ALTER TABLE "user_roles" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" INTEGER,
DROP COLUMN "updatedBy",
ADD COLUMN     "updatedBy" INTEGER;
