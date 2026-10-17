ALTER TABLE "Reservation" ADD COLUMN "nightly" JSONB;

CREATE TABLE "RateRule" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "roomTypeId" TEXT,
  "startDate" DATE,
  "endDate" DATE,
  "days" INTEGER[],
  "rate" INTEGER NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RateRule_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "RateRule" ADD CONSTRAINT rate_positive CHECK ("rate" > 0);
ALTER TABLE "RateRule" ADD CONSTRAINT rate_dates CHECK ("endDate" IS NULL OR "startDate" IS NULL OR "endDate" >= "startDate");