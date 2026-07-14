/*
  Warnings:

  - The `updatedBy` column on the `audit_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdBy` column on the `menu_permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedBy` column on the `menu_permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdBy` column on the `menus` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedBy` column on the `menus` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdBy` column on the `user_menu_access` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedBy` column on the `user_menu_access` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdBy` column on the `user_preferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedBy` column on the `user_preferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdBy` column on the `user_quick_links` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedBy` column on the `user_quick_links` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "updatedBy",
ADD COLUMN     "updatedBy" INTEGER;

-- AlterTable
ALTER TABLE "menu_permissions" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" INTEGER,
DROP COLUMN "updatedBy",
ADD COLUMN     "updatedBy" INTEGER;

-- AlterTable
ALTER TABLE "menus" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" INTEGER,
DROP COLUMN "updatedBy",
ADD COLUMN     "updatedBy" INTEGER;

-- AlterTable
ALTER TABLE "user_menu_access" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" INTEGER,
DROP COLUMN "updatedBy",
ADD COLUMN     "updatedBy" INTEGER;

-- AlterTable
ALTER TABLE "user_preferences" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" INTEGER,
DROP COLUMN "updatedBy",
ADD COLUMN     "updatedBy" INTEGER;

-- AlterTable
ALTER TABLE "user_quick_links" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" INTEGER,
DROP COLUMN "updatedBy",
ADD COLUMN     "updatedBy" INTEGER;
