import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../../modules/auth/auth.service";
export const Public = () => SetMetadata("public", true);
export function sessionCookie(request: { headers: { cookie?: string } }) {
  return (
    request.headers.cookie
      ?.split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("equiflow_session="))
      ?.slice("equiflow_session=".length) || ""
  );
}
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      if (req.headers["x-equiflow-request"] !== "1")
        throw new ForbiddenException("Missing request header");
      if (
        req.headers.origin &&
        req.headers.origin !==
          (process.env.APP_ORIGIN || "http://localhost:5173")
      )
        throw new ForbiddenException("Invalid request origin");
    }
    if (
      this.reflector.getAllAndOverride("public", [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    req.user = await this.auth.session(sessionCookie(req));
    return true;
  }
}
