-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLUB_MANAGER', 'HEAD_TRAINER', 'VETERINARIAN', 'GROOM', 'HORSE_OWNER');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('FIT', 'WATCH', 'INJURED', 'QUARANTINE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "phone" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "horses" (
    "id" TEXT NOT NULL,
    "chipId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "color" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "heightHands" DOUBLE PRECISION NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "avatarUrl" TEXT,
    "intakeStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "healthStatus" "HealthStatus" NOT NULL DEFAULT 'FIT',
    "isTrainingLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedByVetId" TEXT,
    "lockReason" TEXT,
    "lockedAt" TIMESTAMP(3),
    "ownerId" TEXT,
    "stallId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_plans" (
    "id" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "intensity" TEXT NOT NULL,
    "surfaceType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "trainerNote" TEXT,
    "rating" INTEGER,
    "assignedToId" TEXT,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trial_runs" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "finishTimeSeconds" DOUBLE PRECISION NOT NULL,
    "maxSpeedKmh" DOUBLE PRECISION NOT NULL,
    "preHeartRate" INTEGER NOT NULL,
    "postHeartRate" INTEGER NOT NULL,
    "videoUrl" TEXT,

    CONSTRAINT "trial_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "vetId" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "treatmentPlan" TEXT NOT NULL,
    "prescription" TEXT,
    "withdrawalDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "injury_entries" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "bodyLocation" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "injury_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_schedules" (
    "id" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "careType" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "care_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stalls" (
    "id" TEXT NOT NULL,
    "barnSection" TEXT NOT NULL,
    "stallNumber" TEXT NOT NULL,
    "isOccupied" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "stalls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feeding_rations" (
    "id" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "mealTime" TEXT NOT NULL,
    "hayAmountKg" DOUBLE PRECISION NOT NULL,
    "grainKg" DOUBLE PRECISION NOT NULL,
    "supplements" TEXT,

    CONSTRAINT "feeding_rations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stable_incidents" (
    "id" TEXT NOT NULL,
    "groomId" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrl" TEXT,
    "severity" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stable_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race_entries" (
    "id" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "raceName" TEXT NOT NULL,
    "raceDate" TIMESTAMP(3) NOT NULL,
    "distance" INTEGER NOT NULL,
    "isRegistered" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "race_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race_results" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "finishRank" INTEGER NOT NULL,
    "raceTimeSeconds" DOUBLE PRECISION NOT NULL,
    "prizeMoney" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "race_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "horses_chipId_key" ON "horses"("chipId");

-- CreateIndex
CREATE UNIQUE INDEX "horses_stallId_key" ON "horses"("stallId");

-- CreateIndex
CREATE UNIQUE INDEX "trial_runs_sessionId_key" ON "trial_runs"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "stalls_stallNumber_key" ON "stalls"("stallNumber");

-- CreateIndex
CREATE UNIQUE INDEX "race_results_entryId_key" ON "race_results"("entryId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horses" ADD CONSTRAINT "horses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horses" ADD CONSTRAINT "horses_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "stalls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "horses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_runs" ADD CONSTRAINT "trial_runs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "horses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "injury_entries" ADD CONSTRAINT "injury_entries_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_schedules" ADD CONSTRAINT "care_schedules_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "horses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeding_rations" ADD CONSTRAINT "feeding_rations_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "horses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stable_incidents" ADD CONSTRAINT "stable_incidents_groomId_fkey" FOREIGN KEY ("groomId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stable_incidents" ADD CONSTRAINT "stable_incidents_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "horses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_entries" ADD CONSTRAINT "race_entries_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "horses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "race_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
