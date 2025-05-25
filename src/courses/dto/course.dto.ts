import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsDateString,
  Min,
  Max,
  MaxLength,
  MinLength,
  IsInt,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for creating a new course.
 */
export class CreateCourseDto {
  @ApiProperty({
    description: 'Unique course code',
    example: 'CS101',
    minLength: 3,
    maxLength: 20,
  })
  @IsString({ message: 'Course code must be a string' })
  @IsNotEmpty({ message: 'Course code is required' })
  @MinLength(3, { message: 'Course code must be at least 3 characters long' })
  @MaxLength(20, { message: 'Course code must not exceed 20 characters' })
  courseCode: string;

  @ApiProperty({
    description: 'Course name',
    example: 'Introduction to Computer Science',
    minLength: 5,
    maxLength: 100,
  })
  @IsString({ message: 'Course name must be a string' })
  @IsNotEmpty({ message: 'Course name is required' })
  @MinLength(5, { message: 'Course name must be at least 5 characters long' })
  @MaxLength(100, { message: 'Course name must not exceed 100 characters' })
  courseName: string;

  @ApiProperty({
    description: 'Course description',
    example: 'A comprehensive introduction to computer science fundamentals',
    minLength: 20,
    maxLength: 1000,
  })
  @IsString({ message: 'Course description must be a string' })
  @IsNotEmpty({ message: 'Course description is required' })
  @MinLength(20, { message: 'Course description must be at least 20 characters long' })
  @MaxLength(1000, { message: 'Course description must not exceed 1000 characters' })
  courseDescription: string;

  @ApiPropertyOptional({
    description: 'Course image URL',
    example: 'https://example.com/course-image.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Course image must be a valid URL' })
  courseImage?: string;

  @ApiProperty({
    description: 'Course duration in hours',
    example: 40,
    minimum: 1,
    maximum: 1000,
  })
  @IsNumber({}, { message: 'Course duration must be a number' })
  @IsNotEmpty({ message: 'Course duration is required' })
  @Min(1, { message: 'Course duration must be at least 1 hour' })
  @Max(1000, { message: 'Course duration must not exceed 1000 hours' })
  courseDuration: number;

  @ApiProperty({
    description: 'Course price in USD',
    example: 299.99,
    minimum: 0,
    maximum: 10000,
  })
  @IsNumber({}, { message: 'Course price must be a number' })
  @IsNotEmpty({ message: 'Course price is required' })
  @Min(0, { message: 'Course price must be at least 0' })
  @Max(10000, { message: 'Course price must not exceed $10,000' })
  coursePrice: number;

  @ApiPropertyOptional({
    description: 'Course discount percentage',
    example: 10.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Course discount must be a number' })
  @Min(0, { message: 'Course discount must be at least 0%' })
  @Max(100, { message: 'Course discount must not exceed 100%' })
  courseDiscount?: number;

  @ApiProperty({
    description: 'Course start date (YYYY-MM-DD)',
    example: '2024-02-01',
  })
  @IsDateString({}, { message: 'Course start date must be a valid date string (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Course start date is required' })
  courseStartDate: string;

  @ApiProperty({
    description: 'Course end date (YYYY-MM-DD)',
    example: '2024-04-30',
  })
  @IsDateString({}, { message: 'Course end date must be a valid date string (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Course end date is required' })
  courseEndDate: string;
}

/**
 * DTO for updating an existing course.
 */
export class UpdateCourseDto {
  @ApiPropertyOptional({
    description: 'Updated course code',
    example: 'CS101-UPDATED',
    minLength: 3,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Course code must be a string' })
  @MinLength(3, { message: 'Course code must be at least 3 characters long' })
  @MaxLength(20, { message: 'Course code must not exceed 20 characters' })
  courseCode?: string;

  @ApiPropertyOptional({
    description: 'Updated course name',
    example: 'Advanced Computer Science',
    minLength: 5,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Course name must be a string' })
  @MinLength(5, { message: 'Course name must be at least 5 characters long' })
  @MaxLength(100, { message: 'Course name must not exceed 100 characters' })
  courseName?: string;

  @ApiPropertyOptional({
    description: 'Updated course description',
    example: 'An advanced course covering complex computer science topics',
    minLength: 20,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Course description must be a string' })
  @MinLength(20, { message: 'Course description must be at least 20 characters long' })
  @MaxLength(1000, { message: 'Course description must not exceed 1000 characters' })
  courseDescription?: string;

  @ApiPropertyOptional({
    description: 'Updated course image URL',
    example: 'https://example.com/new-course-image.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Course image must be a valid URL' })
  courseImage?: string;

  @ApiPropertyOptional({
    description: 'Updated course duration in hours',
    example: 60,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Course duration must be a number' })
  @Min(1, { message: 'Course duration must be at least 1 hour' })
  @Max(1000, { message: 'Course duration must not exceed 1000 hours' })
  courseDuration?: number;

  @ApiPropertyOptional({
    description: 'Updated course price in USD',
    example: 399.99,
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Course price must be a number' })
  @Min(0, { message: 'Course price must be at least 0' })
  @Max(10000, { message: 'Course price must not exceed $10,000' })
  coursePrice?: number;

  @ApiPropertyOptional({
    description: 'Updated course discount percentage',
    example: 15.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Course discount must be a number' })
  @Min(0, { message: 'Course discount must be at least 0%' })
  @Max(100, { message: 'Course discount must not exceed 100%' })
  courseDiscount?: number;

  @ApiPropertyOptional({
    description: 'Updated course start date (YYYY-MM-DD)',
    example: '2024-03-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Course start date must be a valid date string (YYYY-MM-DD)' })
  courseStartDate?: string;

  @ApiPropertyOptional({
    description: 'Updated course end date (YYYY-MM-DD)',
    example: '2024-05-30',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Course end date must be a valid date string (YYYY-MM-DD)' })
  courseEndDate?: string;
}

/**
 * DTO for course approval by admin.
 */
export class ApproveCourseDto {
  @ApiProperty({
    description: 'Whether to approve or reject the course',
    example: true,
  })
  @IsBoolean({ message: 'Approval status must be a boolean' })
  @IsNotEmpty({ message: 'Approval status is required' })
  isApproved: boolean;
}

/**
 * DTO for filtering courses in list queries.
 */
export class CourseFilterDto {
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
    description: 'Number of courses per page',
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
    description: 'Filter by instructor ID',
    example: '123',
  })
  @IsOptional()
  @IsString({ message: 'Instructor ID must be a string' })
  instructorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by approval status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'Approval status must be a boolean' })
  isApproved?: boolean;

  @ApiPropertyOptional({
    description: 'Search courses by name (partial match)',
    example: 'computer science',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Course name search must be a string' })
  @MaxLength(100, { message: 'Course name search must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  courseName?: string;

  @ApiPropertyOptional({
    description: 'Search courses by code (partial match)',
    example: 'CS',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Course code search must be a string' })
  @MaxLength(20, { message: 'Course code search must not exceed 20 characters' })
  @Transform(({ value }) => value?.trim())
  courseCode?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['courseName', 'courseCode', 'coursePrice', 'createdAt', 'modifiedAt'],
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
