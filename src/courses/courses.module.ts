import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaService } from '../shared/database/prisma.service';

/**
 * Courses module for managing course-related operations.
 * Provides services and controllers for course management with approval workflow.
 */
@Module({
  controllers: [CoursesController],
  providers: [CoursesService, PrismaService],
  exports: [CoursesService],
})
export class CoursesModule {}
