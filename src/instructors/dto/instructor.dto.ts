import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsInt,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for updating instructor profile information.
 */
export class UpdateInstructorProfileDto {
  @ApiPropertyOptional({
    description: 'Updated username',
    example: 'john_instructor_updated',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  username?: string;

  @ApiPropertyOptional({
    description: 'Updated email address',
    example: 'john.instructor.updated@example.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Updated instructor description/tagline',
    example: 'Senior software engineer with 15+ years in full-stack development',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Instructor description must be a string' })
  @MaxLength(500, { message: 'Instructor description must not exceed 500 characters' })
  instructorDescription?: string;

  @ApiPropertyOptional({
    description: 'Updated instructor biography',
    example: 'John has been teaching programming for over 8 years and has helped thousands of students...',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'Instructor bio must be a string' })
  @MaxLength(2000, { message: 'Instructor bio must not exceed 2000 characters' })
  instructorBio?: string;

  @ApiPropertyOptional({
    description: 'Updated instructor address',
    example: '456 Oak Ave, New City, State 67890',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Instructor address must be a string' })
  @MaxLength(200, { message: 'Instructor address must not exceed 200 characters' })
  instructorAddress?: string;

  @ApiPropertyOptional({
    description: 'Updated instructor timezone',
    example: 'America/Los_Angeles',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Instructor timezone must be a string' })
  @MaxLength(50, { message: 'Instructor timezone must not exceed 50 characters' })
  instructorTimezone?: string;
}

/**
 * DTO for filtering instructors in list queries.
 */
export class InstructorFilterDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of instructors per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search instructors by username (partial match)',
    example: 'john',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Username search must be a string' })
  @MaxLength(50, { message: 'Username search must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  username?: string;

  @ApiPropertyOptional({
    description: 'Search instructors by email (partial match)',
    example: 'john@example.com',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Email search must be a string' })
  @MaxLength(100, { message: 'Email search must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter instructors by timezone (partial match)',
    example: 'America',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Timezone search must be a string' })
  @MaxLength(50, { message: 'Timezone search must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['username', 'email', 'createdAt', 'modifiedAt'],
  })
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * DTO for instructor statistics.
 */
export class InstructorStatsDto {
  @ApiProperty({
    description: 'Total number of courses created',
    example: 12,
  })
  totalCourses: number;

  @ApiProperty({
    description: 'Number of approved courses',
    example: 10,
  })
  approvedCourses: number;

  @ApiProperty({
    description: 'Number of pending courses',
    example: 2,
  })
  pendingCourses: number;

  @ApiProperty({
    description: 'Total revenue from approved courses',
    example: 2999.99,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Average price of instructor courses',
    example: 299.99,
  })
  averageCoursePrice: number;

  @ApiProperty({
    description: 'Number of courses created this month',
    example: 3,
  })
  coursesThisMonth: number;

  @ApiProperty({
    description: 'Total enrollment count across all courses',
    example: 150,
  })
  enrollmentCount: number;
}

/**
 * DTO for instructor dashboard data.
 */
export class InstructorDashboardDto {
  @ApiProperty({
    description: 'Instructor profile information',
    type: 'object',
    additionalProperties: true,
  })
  profile: any; // Will be replaced with Instructor entity

  @ApiProperty({
    description: 'Instructor statistics',
    type: InstructorStatsDto,
  })
  stats: InstructorStatsDto;

  @ApiProperty({
    description: 'Recent courses created by the instructor',
    type: 'array',
    items: { type: 'object' }, // Will be replaced with Course entity
  })
  recentCourses: any[];

  @ApiProperty({
    description: 'Courses pending approval',
    type: 'array',
    items: { type: 'object' }, // Will be replaced with Course entity
  })
  pendingApprovals: any[];
}

/**
 * DTO for top instructor metrics.
 */
export class TopInstructorDto {
  @ApiProperty({
    description: 'Instructor information',
    type: 'object',
    additionalProperties: true,
  })
  instructor: any; // Will be replaced with Instructor entity

  @ApiProperty({
    description: 'Total number of courses',
    example: 15,
  })
  courseCount: number;

  @ApiProperty({
    description: 'Number of approved courses',
    example: 12,
  })
  approvedCourseCount: number;

  @ApiProperty({
    description: 'Total revenue from courses',
    example: 3599.99,
  })
  totalRevenue: number;
}
