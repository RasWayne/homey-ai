import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  addressLine1!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  zipCode!: string;

  @IsOptional()
  @IsUrl()
  listingUrl?: string;

  @IsOptional()
  @IsNumber()
  listingPrice?: number;
}
