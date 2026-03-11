import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { ImportPropertyDto } from './dto/import-property.dto';

@Injectable()
export class PropertiesService {
  create(_dto: CreatePropertyDto): Record<string, never> {
    return {};
  }

  importFromListing(_dto: ImportPropertyDto): Record<string, never> {
    return {};
  }

  findOne(_id: string): Record<string, never> {
    return {};
  }
}
