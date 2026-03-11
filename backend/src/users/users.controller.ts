import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto): Record<string, never> {
    return this.usersService.create(dto);
  }

  @Get('me')
  findMe(): Record<string, never> {
    return this.usersService.findMe();
  }

  @Patch('me')
  updateMe(@Body() dto: UpdateUserDto): Record<string, never> {
    return this.usersService.updateMe(dto);
  }
}
