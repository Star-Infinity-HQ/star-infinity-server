import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString, IsNumber, IsDate, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Course } from '../../courses/entities/course.entity';
import { UserRole } from '../../users/enums/user-role.enum';

/**
 * DTO for admin dashboard data.
 */
export class AdminDashboardDto {
  @ApiProperty({
    description: 'User statistics',
    type: 'object',
    properties: {
      totalUsers: { type: 'number', example: 150 },
      totalAdmins: { type: 'number', example: 5 },
      totalInstructors: { type: 'number', example: 25 },
      totalStudents: { type: 'number', example: 120 },
      newUsersThisMonth: { type: 'number', example: 15 },
      newUsersThisWeek: { type: 'number', example: 3 },
      activeUsers: { type: 'number', example: 140 },
    },
  })
  userStats: {
    totalUsers: number;
    totalAdmins: number;
    totalInstructors: number;
    totalStudents: number;
    newUsersThisMonth: number;
    newUsersThisWeek: number;
    activeUsers: number;
  };

  @ApiProperty({
    description: 'Course statistics',
    type: 'object',
    properties: {
      totalCourses: { type: 'number', example: 50 },
      approvedCourses: { type: 'number', example: 35 },
      pendingCourses: { type: 'number', example: 10 },
      rejectedCourses: { type: 'number', example: 5 },
      newCoursesThisMonth: { type: 'number', example: 8 },
      newCoursesThisWeek: { type: 'number', example: 2 },
      averagePrice: { type: 'number', example: 299.99 },
    },
  })
  courseStats: {
    totalCourses: number;
    approvedCourses: number;
    pendingCourses: number;
    rejectedCourses: number;
    newCoursesThisMonth: number;
    newCoursesThisWeek: number;
    averagePrice: number;
  };

  @ApiProperty({
    description: 'Recent users',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123' },
        username: { type: 'string', example: 'john_doe' },
        email: { type: 'string', example: 'john@example.com' },
        role: { type: 'string', enum: Object.values(UserRole) },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  recentUsers: Array<{
    id: string;
    username: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  }>;

  @ApiProperty({
    description: 'Recent courses',
    type: [Course],
  })
  recentCourses: Course[];

  @ApiProperty({
    description: 'Courses pending approval',
    type: [Course],
  })
  pendingApprovals: Course[];
}

/**
 * DTO for system health information.
 */
export class SystemHealthDto {
  @ApiProperty({
    description: 'Overall system status',
    example: 'healthy',
    enum: ['healthy', 'degraded', 'unhealthy'],
  })
  status: 'healthy' | 'degraded' | 'unhealthy';

  @ApiProperty({
    description: 'Health check timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Database health information',
    type: 'object',
    properties: {
      status: { type: 'string', example: 'connected' },
      responseTime: { type: 'number', example: 25 },
      totalRecords: { type: 'number', example: 1000 },
      error: { type: 'string', required: false },
    },
  })
  database: {
    status: 'connected' | 'disconnected' | 'slow';
    responseTime: number;
    totalRecords: number;
    error?: string;
  };

  @ApiProperty({
    description: 'API health information',
    type: 'object',
    properties: {
      status: { type: 'string', example: 'operational' },
      uptime: { type: 'number', example: 86400 },
      memoryUsage: {
        type: 'object',
        properties: {
          rss: { type: 'number' },
          heapTotal: { type: 'number' },
          heapUsed: { type: 'number' },
          external: { type: 'number' },
          arrayBuffers: { type: 'number' },
        },
      },
    },
  })
  api: {
    status: 'operational' | 'degraded' | 'down';
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
  };

  @ApiProperty({
    description: 'External services status',
    type: 'object',
    properties: {
      authentication: { type: 'string', example: 'operational' },
      authorization: { type: 'string', example: 'operational' },
      fileUpload: { type: 'string', example: 'operational' },
      emailService: { type: 'string', example: 'operational' },
    },
  })
  services: {
    authentication: 'operational' | 'degraded' | 'down' | 'unknown';
    authorization: 'operational' | 'degraded' | 'down' | 'unknown';
    fileUpload: 'operational' | 'degraded' | 'down' | 'unknown';
    emailService: 'operational' | 'degraded' | 'down' | 'unknown';
  };
}

/**
 * DTO for admin action logs.
 */
export class AdminActionLogDto {
  @ApiProperty({
    description: 'Log entry ID',
    example: 'log_123',
  })
  id: string;

  @ApiProperty({
    description: 'Admin user ID who performed the action',
    example: '456',
  })
  adminId: string;

  @ApiProperty({
    description: 'Admin username',
    example: 'admin_user',
  })
  adminUsername: string;

  @ApiProperty({
    description: 'Action performed',
    example: 'COURSE_APPROVED',
    enum: [
      'COURSE_APPROVED',
      'COURSE_REJECTED',
      'USER_CREATED',
      'USER_DELETED',
      'USER_ROLE_CHANGED',
      'SYSTEM_CONFIG_UPDATED',
    ],
  })
  action: string;

  @ApiProperty({
    description: 'Human-readable description of the action',
    example: 'Approved course "Introduction to Programming" by john_instructor',
  })
  description: string;

  @ApiProperty({
    description: 'Type of target entity',
    example: 'COURSE',
    enum: ['COURSE', 'USER', 'SYSTEM'],
  })
  targetType: string;

  @ApiProperty({
    description: 'ID of the target entity',
    example: '789',
  })
  targetId: string;

  @ApiProperty({
    description: 'Additional metadata about the action',
    type: 'object',
    additionalProperties: true,
    example: {
      courseCode: 'CS101',
      courseName: 'Introduction to Programming',
      instructorId: '123',
      instructorUsername: 'john_instructor',
    },
  })
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Timestamp when the action was performed',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: Date;
}

/**
 * DTO for bulk course approval.
 */
export class BulkApproveCourseDto {
  @ApiProperty({
    description: 'Array of course IDs to approve',
    example: ['123', '456', '789'],
    type: [String],
  })
  @IsArray({ message: 'Course IDs must be an array' })
  @IsString({ each: true, message: 'Each course ID must be a string' })
  courseIds: string[];
}

/**
 * DTO for bulk course rejection.
 */
export class BulkRejectCourseDto {
  @ApiProperty({
    description: 'Array of course IDs to reject',
    example: ['123', '456', '789'],
    type: [String],
  })
  @IsArray({ message: 'Course IDs must be an array' })
  @IsString({ each: true, message: 'Each course ID must be a string' })
  courseIds: string[];
}

/**
 * DTO for analytics query parameters.
 */
export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Number of days to analyze',
    example: 30,
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Days must be an integer' })
  @Min(1, { message: 'Days must be at least 1' })
  @Max(365, { message: 'Days must not exceed 365' })
  days?: number = 30;
}

/**
 * DTO for analytics response.
 */
export class AnalyticsDto {
  @ApiProperty({
    description: 'User growth data over time',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string', example: '2024-01-01' },
        users: { type: 'number', example: 5 },
      },
    },
  })
  userGrowth: Array<{ date: string; users: number }>;

  @ApiProperty({
    description: 'Course growth data over time',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string', example: '2024-01-01' },
        courses: { type: 'number', example: 2 },
      },
    },
  })
  courseGrowth: Array<{ date: string; courses: number }>;

  @ApiProperty({
    description: 'Revenue projection data over time',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string', example: '2024-01-01' },
        revenue: { type: 'number', example: 500.00 },
      },
    },
  })
  revenueProjection: Array<{ date: string; revenue: number }>;
}
