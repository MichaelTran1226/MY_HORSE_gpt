import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { Public, sessionCookie } from "../../common/guards/session.guard";
import { EmailDto, LoginDto, RegisterDto, VerifyDto } from "./auth.dto";
@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}
  @Public()
  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.validateUser(body.email, body.pass);
    if (!user)
      throw new UnauthorizedException(
        "Invalid credentials or unverified email",
      );
    const session = await this.auth.login(user);
    res.cookie("equiflow_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400000,
      path: "/",
    });
    return { user };
  }
  @Public() @Post("register") register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }
  @Public() @Post("otp/request") request(@Body() body: EmailDto) {
    return this.auth.requestOtp(body.email);
  }
  @Public() @Post("otp/verify") async verify(@Body() body: VerifyDto) {
    if (!(await this.auth.verifyOtp(body.email, body.code)))
      throw new UnauthorizedException("Code invalid or expired");
    return { message: "Email verified. You can now sign in." };
  }
  @Get("me") me(@Req() req) {
    return req.user;
  }
  @Post("logout") async logout(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(sessionCookie(req));
    res.clearCookie("equiflow_session", { path: "/" });
    return { message: "Signed out" };
  }
}
