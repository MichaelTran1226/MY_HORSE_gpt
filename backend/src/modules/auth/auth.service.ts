import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes, randomInt } from "node:crypto";
import { RegisterDto } from "./auth.dto";

export const publicUser = {
  id: true,
  email: true,
  fullName: true,
  role: true,
} as const;
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (
      !user ||
      user.isLocked ||
      !user.emailVerified ||
      !(await bcrypt.compare(pass, user.passwordHash))
    )
      return null;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }
  async register(input: RegisterDto) {
    if (Buffer.byteLength(input.password) > 72)
      throw new BadRequestException("Password must be at most 72 UTF-8 bytes");
    const email = input.email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } }))
      throw new BadRequestException(
        "Account already exists. Sign in or request a new verification code.",
      );
    this.checkEmailConfiguration();
    await this.prisma.user.create({
      data: {
        email,
        fullName: input.fullName.trim(),
        passwordHash: await bcrypt.hash(input.password, 12),
        role: "HORSE_OWNER",
        auditLogs: {
          create: { action: "OWNER_REGISTERED", entityType: "User" },
        },
      },
    });
    return this.requestOtp(email);
  }
  private checkEmailConfiguration() {
    if (!process.env.EMAIL_API_KEY || !process.env.EMAIL_FROM)
      throw new ServiceUnavailableException(
        "Email delivery is not configured. Contact the club manager.",
      );
  }
  async requestOtp(rawEmail: string) {
    this.checkEmailConfiguration();
    const email = rawEmail.trim().toLowerCase();
    const response = {
      message: "If an unverified account exists, a code has been sent.",
      email,
    };
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified || user.isLocked) return response;
    const old = await this.prisma.emailVerification.findUnique({
      where: { email },
    });
    if (old && Date.now() - old.issuedAt.getTime() < 60000) return response;
    const code = String(randomInt(100000, 1000000));
    await this.prisma.emailVerification.upsert({
      where: { email },
      create: {
        email,
        codeHash: digest(code),
        expiresAt: new Date(Date.now() + 300000),
      },
      update: {
        codeHash: digest(code),
        expiresAt: new Date(Date.now() + 300000),
        attempts: 0,
        issuedAt: new Date(),
      },
    });
    const delivery = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: "Bearer " + process.env.EMAIL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [email],
        subject: "Verify your EquiFlow account",
        text:
          "Your verification code is " + code + ". It expires in 5 minutes.",
      }),
    }).catch(() => null);
    if (!delivery?.ok)
      throw new ServiceUnavailableException(
        "Email could not be delivered. Request another code in one minute.",
      );
    return response;
  }
  async verifyOtp(rawEmail: string, code: string) {
    const email = rawEmail.trim().toLowerCase();
    return this.prisma.$transaction(async (tx) => {
      const attempt = await tx.emailVerification.updateMany({
        where: { email, attempts: { lt: 5 }, expiresAt: { gt: new Date() } },
        data: { attempts: { increment: 1 } },
      });
      if (!attempt.count) return false;
      const record = await tx.emailVerification.findUnique({
        where: { email },
      });
      if (record.codeHash !== digest(code)) return false;
      await tx.user.update({ where: { email }, data: { emailVerified: true } });
      await tx.emailVerification.delete({ where: { email } });
      return true;
    });
  }
  async login(user: { id: string }) {
    const token = randomBytes(32).toString("hex");
    await this.prisma.session.create({
      data: {
        id: digest(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    return { token, user };
  }
  async session(token: string) {
    if (!/^[a-f0-9]{64}$/.test(token || "")) throw new UnauthorizedException();
    const session = await this.prisma.session.findUnique({
      where: { id: digest(token) },
      include: { user: true },
    });
    if (
      !session ||
      session.expiresAt <= new Date() ||
      session.user.isLocked ||
      !session.user.emailVerified
    )
      throw new UnauthorizedException();
    const { id, email, fullName, role } = session.user;
    return { id, email, fullName, role };
  }
  async logout(token: string) {
    if (token)
      await this.prisma.session.deleteMany({ where: { id: digest(token) } });
  }
}
