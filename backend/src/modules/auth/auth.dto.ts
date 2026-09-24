import { IsEmail, IsString, Length, Matches } from "class-validator";
export class LoginDto {
  @IsEmail() email: string;
  @IsString() @Length(1, 72) pass: string;
}
export class RegisterDto {
  @IsEmail() email: string;
  @IsString() @Length(10, 72) password: string;
  @IsString() @Length(2, 100) fullName: string;
}
export class EmailDto {
  @IsEmail() email: string;
}
export class VerifyDto extends EmailDto {
  @Matches(/^\d{6}$/) code: string;
}
