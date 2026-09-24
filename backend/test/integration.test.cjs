require("dotenv").config();
const { test, after, before } = require("node:test");
const assert = require("node:assert/strict");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { NestFactory } = require("@nestjs/core");
const { ValidationPipe } = require("@nestjs/common");
const { AppModule } = require("../dist/app.module");
const {
  HttpExceptionFilter,
} = require("../dist/common/filters/http-exception.filter");
const {
  TrainingService,
} = require("../dist/modules/training/training.service");
const { HealthService } = require("../dist/modules/health/health.service");
if (!new URL(process.env.DATABASE_URL).pathname.endsWith("_test"))
  throw new Error("Integration tests require a dedicated *_test database");
const prisma = new PrismaClient();
const password = "Test-only-password-2026";
let app,
  base,
  users = {},
  cookies = {},
  horse,
  plan;
async function call(path, role, method = "GET", body) {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Equiflow-Request": "1",
      ...(cookies[role] ? { Cookie: cookies[role] } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: res.status,
    body: await res.json(),
    cookie: res.headers.get("set-cookie"),
  };
}
before(async () => {
  await prisma.auditLog.deleteMany();
  await prisma.horse.deleteMany();
  await prisma.session.deleteMany();
  await prisma.emailVerification.deleteMany();
  await prisma.user.deleteMany();
  for (const role of [
    "CLUB_MANAGER",
    "HEAD_TRAINER",
    "VETERINARIAN",
    "GROOM",
    "HORSE_OWNER",
    "OTHER_OWNER",
  ]) {
    users[role] = await prisma.user.create({
      data: {
        email: role.toLowerCase() + "@example.test",
        fullName: role,
        role: role === "OTHER_OWNER" ? "HORSE_OWNER" : role,
        passwordHash: await bcrypt.hash(password, 4),
        emailVerified: true,
      },
    });
  }
  app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(0, "127.0.0.1");
  base = (await app.getUrl()) + "/api";
  for (const role of Object.keys(users)) {
    const result = await call("/auth/login", null, "POST", {
      email: users[role].email,
      pass: password,
    });
    assert.equal(result.status, 201);
    cookies[role] = result.cookie.split(";")[0];
    assert.match(result.cookie, /HttpOnly/i);
  }
});
after(async () => {
  await app?.close();
  await prisma.$disconnect();
});
test("anonymous API access is denied", async () => {
  assert.equal((await call("/horses")).status, 401);
});
test("owner intake, manager admission, profile persistence and isolation", async () => {
  const data = {
    name: "TEST horse",
    chipId: "TEST-001",
    breed: "Test breed",
    dateOfBirth: "2020-01-01",
    color: "Bay",
    gender: "Mare",
    heightHands: 15,
    weightKg: 480,
  };
  let result = await call("/horses", "HORSE_OWNER", "POST", data);
  assert.equal(result.status, 201);
  horse = result.body;
  assert.equal(horse.ownerId, users.HORSE_OWNER.id);
  assert.equal(horse.intakeStatus, "PENDING");
  assert.equal((await call("/horses/" + horse.id, "OTHER_OWNER")).status, 404);
  assert.equal((await call("/horses", "OTHER_OWNER")).body.length, 0);
  assert.equal(
    (
      await call("/horses/" + horse.id + "/admission", "HORSE_OWNER", "POST", {
        ownerId: users.HORSE_OWNER.id,
        intakeStatus: "ADMITTED",
      })
    ).status,
    403,
  );
  result = await call(
    "/horses/" + horse.id + "/admission",
    "CLUB_MANAGER",
    "POST",
    { ownerId: users.HORSE_OWNER.id, intakeStatus: "ADMITTED" },
  );
  assert.equal(result.status, 201);
  assert.equal(
    (await call("/horses/" + horse.id, "HORSE_OWNER")).body.intakeStatus,
    "ADMITTED",
  );
  assert.equal(
    (await call("/horses", "CLUB_MANAGER", "POST", { ...data, weightKg: -1 }))
      .status,
    400,
  );
});
test("training plan, assignment, trial metrics and owner read authorization", async () => {
  const data = {
    horseId: horse.id,
    title: "Test plan",
    objective: "Test stamina",
    distanceMeters: 1000,
    intensity: "HEAVY",
    surfaceType: "SAND",
    startDate: "2026-01-01",
    endDate: "2027-01-01",
  };
  assert.equal(
    (await call("/training/plans", "GROOM", "POST", data)).status,
    403,
  );
  let result = await call("/training/plans", "HEAD_TRAINER", "POST", data);
  assert.equal(result.status, 201);
  plan = result.body;
  assert.equal(
    (await call("/training/horses/" + horse.id + "/plans", "OTHER_OWNER"))
      .status,
    404,
  );
  result = await call(
    "/training/plans/" + plan.id + "/sessions",
    "HEAD_TRAINER",
    "POST",
    { sessionDate: "2026-09-24", assignedToId: users.GROOM.id },
  );
  assert.equal(result.status, 201);
  const session = result.body;
  const metrics = {
    trainerNote: "Successful test session",
    rating: 8,
    finishTimeSeconds: 80,
    maxSpeedKmh: 55,
    preHeartRate: 40,
    postHeartRate: 130,
  };
  assert.equal(
    (
      await call(
        "/training/sessions/" + session.id + "/complete",
        "HEAD_TRAINER",
        "POST",
        metrics,
      )
    ).status,
    201,
  );
  assert.equal(
    (
      await call(
        "/training/sessions/" + session.id + "/complete",
        "HEAD_TRAINER",
        "POST",
        metrics,
      )
    ).status,
    400,
  );
});
test("veterinary lock cancels pending sessions, blocks training, requires follow-up and audits", async () => {
  let result = await call(
    "/training/plans/" + plan.id + "/sessions",
    "HEAD_TRAINER",
    "POST",
    { sessionDate: "2026-09-25", assignedToId: users.GROOM.id },
  );
  const session = result.body;
  assert.equal(result.status, 201);
  assert.equal(
    (
      await call(
        "/health/horses/" + horse.id + "/lock",
        "HEAD_TRAINER",
        "POST",
        { reason: "Invalid actor" },
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await call(
        "/health/horses/" + horse.id + "/lock",
        "VETERINARIAN",
        "POST",
        { reason: "Test injury" },
      )
    ).status,
    201,
  );
  assert.ok(
    (await prisma.trainingSession.findUnique({ where: { id: session.id } }))
      .cancelledAt,
  );
  assert.equal(
    (
      await call(
        "/training/plans/" + plan.id + "/sessions",
        "HEAD_TRAINER",
        "POST",
        { sessionDate: "2026-09-25", assignedToId: users.GROOM.id },
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "/health/horses/" + horse.id + "/release-lock",
        "VETERINARIAN",
        "POST",
        { reason: "Test recovery" },
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call("/health/records", "VETERINARIAN", "POST", {
        horseId: horse.id,
        diagnosis: "Follow-up examination",
        treatmentPlan: "Recovery complete",
        withdrawalDays: 0,
        healthStatus: "FIT",
        bodyLocation: "FORELEG",
        severity: "MILD",
        notes: "Resolved",
      })
    ).status,
    201,
  );
  assert.equal(
    (
      await call(
        "/health/horses/" + horse.id + "/release-lock",
        "VETERINARIAN",
        "POST",
        { reason: "Follow-up confirms recovery" },
      )
    ).status,
    201,
  );
  const logs = (await call("/accounts/audit", "CLUB_MANAGER")).body;
  assert.ok(logs.some((l) => l.action === "TRAINING_LOCKED"));
  assert.ok(logs.some((l) => l.action.startsWith("TRAINING_RELEASED")));
});
test("concurrent scheduling and locking leaves no active unfinished session", async () => {
  const training = app.get(TrainingService),
    health = app.get(HealthService);
  for (let i = 0; i < 6; i++) {
    await prisma.horse.update({
      where: { id: horse.id },
      data: { isTrainingLocked: false, healthStatus: "FIT" },
    });
    const results = await Promise.allSettled([
      training.schedule(
        plan.id,
        { sessionDate: "2026-10-01", assignedToId: users.GROOM.id },
        users.HEAD_TRAINER,
      ),
      health.lockHorse(horse.id, users.VETERINARIAN.id, "Concurrency test"),
    ]);
    assert.equal(results[1].status, "fulfilled", results[1].reason?.message);
    assert.equal(
      await prisma.trainingSession.count({
        where: { planId: plan.id, isCompleted: false, cancelledAt: null },
      }),
      0,
    );
  }
});
test("preventive care and server logout work", async () => {
  const result = await call("/health/care", "VETERINARIAN", "POST", {
    horseId: horse.id,
    careType: "VACCINATION",
    scheduledDate: "2026-01-01",
  });
  assert.equal(result.status, 201);
  assert.ok(
    (await call("/health/due", "CLUB_MANAGER")).body.some(
      (c) => c.id === result.body.id,
    ),
  );
  assert.equal(
    (
      await call(
        "/health/care/" + result.body.id + "/complete",
        "VETERINARIAN",
        "POST",
        {},
      )
    ).status,
    201,
  );
  assert.equal((await call("/auth/logout", "GROOM", "POST", {})).status, 201);
  assert.equal((await call("/auth/me", "GROOM")).status, 401);
});
test("OTP rejects invalid and reused codes, preserves attempt limits", async () => {
  const { digest } = require("../dist/modules/auth/auth.service");
  const email = "verify@example.test";
  await prisma.user.create({
    data: {
      email,
      fullName: "Test verification",
      role: "HORSE_OWNER",
      passwordHash: await bcrypt.hash(password, 4),
    },
  });
  await prisma.emailVerification.create({
    data: {
      email,
      codeHash: digest("864209"),
      expiresAt: new Date(Date.now() + 300000),
    },
  });
  assert.equal(
    (await call("/auth/otp/verify", null, "POST", { email, code: "111111" }))
      .status,
    401,
  );
  assert.equal(
    (await prisma.emailVerification.findUnique({ where: { email } })).attempts,
    1,
  );
  assert.equal(
    (await call("/auth/otp/verify", null, "POST", { email, code: "864209" }))
      .status,
    201,
  );
  assert.equal(
    (await call("/auth/otp/verify", null, "POST", { email, code: "864209" }))
      .status,
    401,
  );
});

test("calendar and fitness overview preserve owner isolation", async () => {
  const range = "/training/calendar?from=2026-09-01&to=2026-10-01";
  assert.ok((await call(range, "HORSE_OWNER")).body.length > 0);
  assert.equal((await call(range, "OTHER_OWNER")).body.length, 0);
  assert.equal(
    (await call("/training/overview", "OTHER_OWNER")).body.length,
    0,
  );
  assert.equal(
    (
      await call(
        "/training/calendar?from=2026-01-01&to=2027-01-01",
        "HEAD_TRAINER",
      )
    ).status,
    400,
  );
});

test("stall creation enforces manager role and unique assignment", async () => {
  const data = { barnSection: "TEST", stallNumber: "TEST-" + Date.now() };
  assert.equal(
    (await call("/stables/stalls", "HORSE_OWNER", "POST", data)).status,
    403,
  );
  const created = await call("/stables/stalls", "CLUB_MANAGER", "POST", data);
  assert.equal(created.status, 201);
  assert.equal(
    (
      await call("/horses/" + horse.id + "/admission", "CLUB_MANAGER", "POST", {
        ownerId: users.HORSE_OWNER.id,
        intakeStatus: "ADMITTED",
        stallId: created.body.id,
      })
    ).status,
    201,
  );
  const stalls = (await call("/stables/stalls", "CLUB_MANAGER")).body;
  assert.equal(stalls.find((s) => s.id === created.body.id).horse.id, horse.id);
});

test("database tables are protected from public Data API access", async () => {
  const rows =
    await prisma.$queryRaw`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations'`;
  assert.equal(rows.length, 16);
  assert.ok(rows.every((row) => row.rowsecurity));
});
