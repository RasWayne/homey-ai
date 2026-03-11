import { IsUrl } from 'class-validator';

export class ImportPropertyDto {
  @IsUrl()
  listingUrl!: string;
}
