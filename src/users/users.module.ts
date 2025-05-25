import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../shared/database/prisma.service';

/**
 * Users module for managing user-related operations.
 * Provides services and controllers for user management across different user types.
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
