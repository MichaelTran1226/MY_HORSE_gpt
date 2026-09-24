require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { randomBytes } = require("node:crypto");
const { writeFileSync, existsSync } = require("node:fs");
const prisma = new PrismaClient();
(async () => {
  const email = process.env.BOOTSTRAP_EMAIL;
  if (!email || !email.includes("@")) throw new Error("Set BOOTSTRAP_EMAIL");
  if (await prisma.user.count({ where: { role: "CLUB_MANAGER" } }))
    throw new Error("A manager already exists; use account management instead");
  const password =
    process.env.BOOTSTRAP_PASSWORD || randomBytes(18).toString("base64url");
  if (
    !process.env.BOOTSTRAP_PASSWORD &&
    existsSync(".manager-credentials.local.txt")
  )
    throw new Error(
      "Move the existing local credentials file to a safe location before bootstrapping another database",
    );
  if (password.length < 10 || Buffer.byteLength(password) > 72)
    throw new Error(
      "Password must be at least 10 characters and at most 72 bytes",
    );
  await prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      fullName: process.env.BOOTSTRAP_NAME || "Club Manager",
      role: "CLUB_MANAGER",
      passwordHash: await bcrypt.hash(password, 12),
      emailVerified: true,
    },
  });
  if (!process.env.BOOTSTRAP_PASSWORD) {
    writeFileSync(
      ".manager-credentials.local.txt",
      "Email: " + email + "\nPassword: " + password + "\n",
      { flag: "wx", mode: 0o600 },
    );
    console.log(
      "Manager created. Credentials saved to backend/.manager-credentials.local.txt (ignored by Git).",
    );
  } else
    console.log("Manager created using the supplied environment password.");
})()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
