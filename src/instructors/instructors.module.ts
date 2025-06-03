import { Module } from '@nestjs/common';
import { InstructorsService } from './instructors.service';
import { InstructorsController } from './instructors.controller';
import { PrismaService } from '../shared/database/prisma.service';

/**
 * Instructors module for managing instructor-specific operations.
 * Provides services and controllers for instructor profiles, course management, and analytics.
 */
@Module({
  controllers: [InstructorsController],
  providers: [InstructorsService, PrismaService],
  exports: [InstructorsService],
})
export class InstructorsModule {}
