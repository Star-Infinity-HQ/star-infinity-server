import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';

/**
 * DTO for updating user profile information.
 */
export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'Updated username',
    example: 'john_doe_updated',
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
    example: 'john.doe.updated@example.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Instructor description (for instructors only)',
    example: 'Experienced software engineer with 10+ years in web development',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Instructor description must be a string' })
  @MaxLength(500, { message: 'Instructor description must not exceed 500 characters' })
  instructorDescription?: string;

  @ApiPropertyOptional({
    description: 'Instructor bio (for instructors only)',
    example: 'John has been teaching programming for over 5 years...',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Instructor bio must be a string' })
  @MaxLength(1000, { message: 'Instructor bio must not exceed 1000 characters' })
  instructorBio?: string;

  @ApiPropertyOptional({
    description: 'Instructor address (for instructors only)',
    example: '123 Main St, City, State 12345',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Instructor address must be a string' })
  @MaxLength(200, { message: 'Instructor address must not exceed 200 characters' })
  instructorAddress?: string;

  @ApiPropertyOptional({
    description: 'Instructor timezone (for instructors only)',
    example: 'America/New_York',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Instructor timezone must be a string' })
  @MaxLength(50, { message: 'Instructor timezone must not exceed 50 characters' })
  instructorTimezone?: string;
}

/**
 * DTO for filtering users in list queries.
 */
export class UserFilterDto {
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
    description: 'Number of users per page',
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
    description: 'Filter users by role',
    enum: UserRole,
    example: UserRole.INSTRUCTOR,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be one of: ADMIN, INSTRUCTOR, STUDENT' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Search users by username (partial match)',
    example: 'john',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Username search must be a string' })
  @MaxLength(50, { message: 'Username search must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  username?: string;

  @ApiPropertyOptional({
    description: 'Search users by email (partial match)',
    example: 'john@example.com',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Email search must be a string' })
  @MaxLength(100, { message: 'Email search must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['username', 'email', 'createdAt', 'modifiedAt'],
  })
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  @IsEnum(['username', 'email', 'createdAt', 'modifiedAt'], {
    message: 'Sort field must be one of: username, email, createdAt, modifiedAt',
  })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  @IsEnum(['asc', 'desc'], { message: 'Sort order must be either asc or desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * DTO for user search results.
 */
export class UserSearchResultDto {
  @ApiProperty({
    description: 'List of users',
    type: [Object], // Will be replaced with User entity in actual response
  })
  users: any[];

  @ApiProperty({
    description: 'Total number of users matching the filter',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of users per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrev: boolean;
}
