-- AlterTable
ALTER TABLE "_ChatParticipants" ADD CONSTRAINT "_ChatParticipants_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ChatParticipants_AB_unique";
