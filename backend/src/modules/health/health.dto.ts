import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from "class-validator";
export class LockDto {
  @IsString() @Length(5, 2000) reason: string;
}
export class MedicalDto {
  @IsUUID() horseId: string;
  @IsString() @Length(2, 3000) diagnosis: string;
  @IsString() @Length(2, 3000) treatmentPlan: string;
  @IsOptional() @IsString() @Length(0, 3000) prescription?: string;
  @IsInt() @Min(0) @Max(365) withdrawalDays: number;
  @IsIn(["FIT", "WATCH", "INJURED", "QUARANTINE"]) healthStatus:
    "FIT" | "WATCH" | "INJURED" | "QUARANTINE";
  @IsOptional()
  @IsIn([
    "HEAD",
    "NECK",
    "SHOULDER",
    "BACK",
    "ABDOMEN",
    "FORELEG",
    "HINDLEG",
    "HOOF",
  ])
  bodyLocation?: string;
  @IsOptional() @IsIn(["MILD", "MODERATE", "SEVERE"]) severity?: string;
  @IsOptional() @IsString() @Length(0, 2000) notes?: string;
}
export class CareDto {
  @IsUUID() horseId: string;
  @IsIn(["VACCINATION", "DEWORMING", "FARRIER"]) careType: string;
  @IsDateString() scheduledDate: string;
}
