import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { ImportPropertyDto } from './dto/import-property.dto';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  create(@Body() dto: CreatePropertyDto): Record<string, never> {
    return this.propertiesService.create(dto);
  }

  @Post('import')
  importFromListing(@Body() dto: ImportPropertyDto): Record<string, never> {
    return this.propertiesService.importFromListing(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Record<string, never> {
    return this.propertiesService.findOne(id);
  }
}
