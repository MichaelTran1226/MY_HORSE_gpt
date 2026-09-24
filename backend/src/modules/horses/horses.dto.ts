import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Length,
  Max,
  Min,
} from "class-validator";
export class HorseDto {
  @IsString() @Length(1, 80) chipId: string;
  @IsString() @Length(1, 100) name: string;
  @IsString() @Length(1, 100) breed: string;
  @IsDateString() dateOfBirth: string;
  @IsString() @Length(1, 50) color: string;
  @IsIn(["Stallion", "Mare", "Gelding"]) gender: string;
  @IsNumber() @Min(1) @Max(30) heightHands: number;
  @IsNumber() @Min(1) @Max(1500) weightKg: number;
  @IsOptional()
  @IsUrl({ protocols: ["https"], require_protocol: true })
  avatarUrl?: string;
  @IsOptional() @IsUUID() ownerId?: string;
  @IsOptional() @IsUUID() stallId?: string;
}
export class AdmissionDto {
  @IsUUID() ownerId: string;
  @IsOptional() @IsUUID() stallId?: string;
  @IsIn(["ADMITTED", "REJECTED"]) intakeStatus: string;
}
