/*
  Warnings:

  - Changed the type of `entityId` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "entityId",
ADD COLUMN     "entityId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "audit_logs_entityName_entityId_idx" ON "audit_logs"("entityName", "entityId");
