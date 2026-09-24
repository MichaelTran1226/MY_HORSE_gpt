import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  Max,
  Min,
} from "class-validator";
export class PlanDto {
  @IsUUID() horseId: string;
  @IsString() @Length(2, 120) title: string;
  @IsString() @Length(2, 2000) objective: string;
  @IsInt() @Min(1) @Max(100000) distanceMeters: number;
  @IsIn(["LIGHT", "MODERATE", "HEAVY"]) intensity: string;
  @IsIn(["SAND", "GRASS", "SYNTHETIC"]) surfaceType: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
}
export class SessionDto {
  @IsDateString() sessionDate: string;
  @IsUUID() assignedToId: string;
}
export class CalendarQuery {
  @IsDateString() from: string;
  @IsDateString() to: string;
}
export class CompleteDto {
  @IsString() @Length(2, 3000) trainerNote: string;
  @IsInt() @Min(1) @Max(10) rating: number;
  @IsOptional() @IsNumber() @Min(0.01) @Max(86400) finishTimeSeconds?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) maxSpeedKmh?: number;
  @IsOptional() @IsInt() @Min(10) @Max(300) preHeartRate?: number;
  @IsOptional() @IsInt() @Min(10) @Max(300) postHeartRate?: number;
  @IsOptional()
  @IsUrl({ protocols: ["https"], require_protocol: true })
  videoUrl?: string;
}
