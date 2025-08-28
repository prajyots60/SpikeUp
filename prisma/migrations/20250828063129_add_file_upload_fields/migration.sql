-- AlterTable
ALTER TABLE "Webinar" ADD COLUMN     "isPreRecorded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recordingKey" VARCHAR(500),
ADD COLUMN     "thumbnailKey" VARCHAR(500);
