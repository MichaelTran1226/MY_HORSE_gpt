import { IsBoolean, IsEmail, IsIn, IsString, Length } from "class-validator";
export class AccountDto {
  @IsEmail() email: string;
  @IsString() @Length(2, 100) fullName: string;
  @IsString() @Length(10, 72) password: string;
  @IsIn([
    "CLUB_MANAGER",
    "HEAD_TRAINER",
    "VETERINARIAN",
    "GROOM",
    "HORSE_OWNER",
  ])
  role:
    "CLUB_MANAGER" | "HEAD_TRAINER" | "VETERINARIAN" | "GROOM" | "HORSE_OWNER";
}
export class AccountLockDto {
  @IsBoolean() isLocked: boolean;
}
