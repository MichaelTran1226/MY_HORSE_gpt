// Explicit opt-in only: never run automatically during deployment.
const fs = require("node:fs");
const path = require("node:path");
const { randomBytes, createHash } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const cloud = process.argv.includes("--cloud");
const root = path.resolve(__dirname, "..");
const env = dotenv.parse(
  fs.readFileSync(path.join(root, cloud ? ".env.cloud" : ".env")),
);
if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const credentialsPath = path.join(
  root,
  `.sample-credentials.${cloud ? "cloud" : "local"}.json`,
);
const fingerprint = createHash("sha256")
  .update(
    new URL(env.DATABASE_URL).host +
      new URL(env.DATABASE_URL).pathname +
      new URL(env.DATABASE_URL).username,
  )
  .digest("hex");
const roles = {
  manager: "CLUB_MANAGER",
  trainer: "HEAD_TRAINER",
  vet: "VETERINARIAN",
  groom: "GROOM",
  owner: "HORSE_OWNER",
  owner2: "HORSE_OWNER",
};
const id = (name) => {
  const h = createHash("sha256")
    .update("equiflow-sample-v1:" + name)
    .digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
const prisma = new PrismaClient({
  datasources: { db: { url: env.DATABASE_URL } },
});
async function main() {
  let credentials;
  if (fs.existsSync(credentialsPath)) {
    credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
    if (credentials.database !== fingerprint)
      throw new Error(
        "Credential file belongs to another database; preserve it before continuing",
      );
  } else {
    const existing = await prisma.user.count({
      where: {
        email: {
          in: Object.keys(roles).map((key) => `sample.${key}@equiflow.example`),
        },
      },
    });
    if (existing)
      throw new Error(
        "Sample accounts already exist but the private credential file is missing. Restore that file; this script will not reset passwords.",
      );
    credentials = {
      database: fingerprint,
      accounts: Object.entries(roles).map(([key, role]) => ({
        key,
        role,
        email: `sample.${key}@equiflow.example`,
        password: randomBytes(18).toString("base64url"),
      })),
    };
    // Save before writing DB so credentials remain recoverable after an interrupted run.
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2), {
      flag: "wx",
      mode: 0o600,
    });
  }
  const accounts = await Promise.all(
    credentials.accounts.map(async (a) => ({
      ...a,
      hash: await bcrypt.hash(a.password, 12),
    })),
  );
  const now = new Date();
  const day = (n) => new Date(now.getTime() + n * 86400000);
  const result = await prisma.$transaction(
    async (tx) => {
      for (const a of accounts) {
        const existing = await tx.user.findUnique({
          where: { email: a.email },
        });
        if (existing && existing.id !== id(a.key))
          throw new Error(
            "Sample email collision; no existing account was overwritten",
          );
        await tx.user.upsert({
          where: { id: id(a.key) },
          update: {},
          create: {
            id: id(a.key),
            email: a.email,
            fullName: `[SAMPLE] ${a.key}`,
            role: a.role,
            passwordHash: a.hash,
            emailVerified: true,
          },
        });
      }
      // Marker makes repeat runs a no-op for business data, preserving user edits.
      if (await tx.auditLog.findUnique({ where: { id: id("seed-marker") } }))
        return "Already seeded; existing sample edits and passwords preserved";
      const names = ["Aurora", "Atlas", "Willow", "Ember", "Luna", "Orion"];
      for (let i = 0; i < names.length; i++) {
        const stallId = id("stall-" + i),
          horseId = id("horse-" + i);
        const status = ["FIT", "FIT", "WATCH", "INJURED", "QUARANTINE", "FIT"][
          i
        ];
        const locked = i === 3 || i === 4;
        await tx.stall.create({
          data: {
            id: stallId,
            barnSection: "[SAMPLE] Training barn",
            stallNumber: `SAMPLE-${i + 1}`,
          },
        });
        await tx.horse.create({
          data: {
            id: horseId,
            chipId: `SAMPLE-EQ-${i + 1}`,
            name: `[SAMPLE] ${names[i]}`,
            breed: "Thoroughbred",
            dateOfBirth: new Date("2020-04-12"),
            color: ["Bay", "Chestnut", "Grey"][i % 3],
            gender: i % 2 ? "Gelding" : "Mare",
            heightHands: 16,
            weightKg: 460 + i * 12,
            ownerId: id(i % 2 ? "owner2" : "owner"),
            stallId: i === 5 ? null : stallId,
            intakeStatus: i === 5 ? "PENDING" : "ADMITTED",
            healthStatus: status,
            isTrainingLocked: locked,
            ...(locked
              ? {
                  lockedByVetId: id("vet"),
                  lockedAt: day(-2),
                  lockReason:
                    "[SAMPLE] Veterinary restriction for workflow demonstration",
                }
              : {}),
          },
        });
        if (i !== 5) {
          await tx.medicalRecord.create({
            data: {
              id: id("exam-" + i),
              horseId,
              vetId: id("vet"),
              diagnosis: `[SAMPLE] ${status} examination scenario`,
              treatmentPlan:
                "[SAMPLE] Demonstration only; not clinical guidance.",
              createdAt: day(-2),
              ...(i === 3
                ? {
                    injuries: {
                      create: {
                        bodyLocation: "foreleg",
                        severity: "MODERATE",
                        notes: "[SAMPLE] Recovery tracking example",
                      },
                    },
                  }
                : {}),
            },
          });
          await tx.careSchedule.create({
            data: {
              id: id("care-" + i),
              horseId,
              careType: ["VACCINATION", "DEWORMING", "FARRIER"][i % 3],
              scheduledDate: day(i - 1),
            },
          });
          const planId = id("plan-" + i);
          await tx.trainingPlan.create({
            data: {
              id: planId,
              horseId,
              title: `[SAMPLE] ${names[i]} conditioning`,
              objective: "[SAMPLE] Demonstrate training progression",
              distanceMeters: i === 2 ? 800 : 1600,
              intensity: i === 2 ? "LIGHT" : "MODERATE",
              surfaceType: "SAND",
              startDate: day(-10),
              endDate: day(14),
            },
          });
          for (let j = 0; j < 3; j++) {
            const completed = j < 2;
            await tx.trainingSession.create({
              data: {
                id: id(`session-${i}-${j}`),
                planId,
                sessionDate: day(completed ? -8 + j * 3 : 1),
                assignedToId: id("groom"),
                isCompleted: completed,
                rating: completed ? 6 + j : null,
                trainerNote: completed
                  ? "[SAMPLE] Assessment recorded for demonstration"
                  : null,
                cancelledAt: !completed && locked ? day(-2) : null,
                ...(completed
                  ? {
                      trialRun: {
                        create: {
                          finishTimeSeconds: 115 - j * 3,
                          maxSpeedKmh: 48 + j * 2,
                          preHeartRate: 36,
                          postHeartRate: 110,
                        },
                      },
                    }
                  : {}),
              },
            });
          }
        }
      }
      await tx.auditLog.create({
        data: {
          id: id("seed-marker"),
          userId: id("manager"),
          action: "SAMPLE_DATA_CREATED",
          entityType: "SampleDataset",
          entityId: "v1",
        },
      });
      return "Created 6 sample accounts, 6 horses, 6 stalls, 5 plans, 15 sessions, 10 trials, 5 examinations and 5 care schedules";
    },
    { timeout: 60000 },
  );
  console.log(result);
  console.log("Private credentials file: " + credentialsPath);
}
main()
  .catch((e) => {
    console.error(
      "Sample seed failed:",
      e.code || e.name,
      e.message.replaceAll(env.DATABASE_URL, "[DATABASE_URL]"),
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
