import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  create(_dto: CreateUserDto): Record<string, never> {
    return {};
  }

  findMe(): Record<string, never> {
    return {};
  }

  updateMe(_dto: UpdateUserDto): Record<string, never> {
    return {};
  }
}
