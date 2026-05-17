-- AlterTable
ALTER TABLE "Artwork" ADD COLUMN     "exhibitionId" TEXT;

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
