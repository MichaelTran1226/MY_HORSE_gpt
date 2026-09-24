import {
  IsString,
  IsUUID,
  IsOptional,
  IsUrl,
  IsIn,
  Length,
} from "class-validator";
export class StallDto {
  @IsString() @Length(1, 40) barnSection: string;
  @IsString() @Length(1, 40) stallNumber: string;
}
export class IncidentDto {
  @IsUUID() horseId: string;
  @IsString() @Length(5, 3000) description: string;
  @IsOptional()
  @IsUrl({ protocols: ["https"], require_protocol: true })
  photoUrl?: string;
  @IsIn(["LOW", "MEDIUM", "HIGH"]) severity: string;
}
