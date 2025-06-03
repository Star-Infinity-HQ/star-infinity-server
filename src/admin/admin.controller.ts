import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserId } from '../auth/decorators/current-user.decorator';
import { AdminOnly } from '../auth/decorators/roles.decorator';
import {
  AdminDashboardDto,
  SystemHealthDto,
  AdminActionLogDto,
  BulkApproveCourseDto,
  BulkRejectCourseDto,
  AnalyticsQueryDto,
  AnalyticsDto,
} from './dto/admin.dto';

/**
 * Admin controller handling administrative functions and system management.
 * Provides dashboard data, system monitoring, and bulk operations.
 */
@ApiTags('Admin')
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@AdminOnly()
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get admin dashboard data.
   * Returns comprehensive statistics and recent activity for the admin panel.
   */
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get admin dashboard data',
    description: 'Retrieve comprehensive dashboard statistics including user metrics, course metrics, recent activity, and pending approvals.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: AdminDashboardDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getDashboard(): Promise<AdminDashboardDto> {
    return this.adminService.getDashboardData();
  }

  /**
   * Get system health status.
   * Returns current system health including database connectivity and service status.
   */
  @Get('health')
  @ApiOperation({
    summary: 'Get system health status',
    description: 'Retrieve current system health information including database connectivity, API status, and external services.',
  })
  @ApiResponse({
    status: 200,
    description: 'System health retrieved successfully',
    type: SystemHealthDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSystemHealth(): Promise<SystemHealthDto> {
    return this.adminService.getSystemHealth();
  }

  /**
   * Get admin action logs.
   * Returns recent administrative actions and system events.
   */
  @Get('logs')
  @ApiOperation({
    summary: 'Get admin action logs',
    description: 'Retrieve recent administrative actions and system events for audit purposes.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of log entries to retrieve',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Action logs retrieved successfully',
    type: [AdminActionLogDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getActionLogs(
    @Query('limit') limit?: number,
  ): Promise<AdminActionLogDto[]> {
    return this.adminService.getAdminActionLogs(limit || 50);
  }

  /**
   * Bulk approve courses.
   * Approve multiple courses at once for efficiency.
   */
  @Post('courses/bulk-approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk approve courses',
    description: 'Approve multiple courses at once. Only pending courses will be approved.',
  })
  @ApiBody({ type: BulkApproveCourseDto })
  @ApiResponse({
    status: 200,
    description: 'Courses approved successfully',
    schema: {
      type: 'object',
      properties: {
        approved: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid course IDs provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async bulkApproveCourses(
    @UserId() adminId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    bulkApproveDto: BulkApproveCourseDto,
  ): Promise<{ approved: number }> {
    return this.adminService.bulkApproveCourses(bulkApproveDto.courseIds, adminId);
  }

  /**
   * Bulk reject courses.
   * Reject multiple courses at once for efficiency.
   */
  @Post('courses/bulk-reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk reject courses',
    description: 'Reject multiple courses at once. Courses will be marked as not approved.',
  })
  @ApiBody({ type: BulkRejectCourseDto })
  @ApiResponse({
    status: 200,
    description: 'Courses rejected successfully',
    schema: {
      type: 'object',
      properties: {
        rejected: { type: 'number', example: 3 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid course IDs provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async bulkRejectCourses(
    @UserId() adminId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    bulkRejectDto: BulkRejectCourseDto,
  ): Promise<{ rejected: number }> {
    return this.adminService.bulkRejectCourses(bulkRejectDto.courseIds, adminId);
  }

  /**
   * Get analytics data.
   * Returns growth metrics and trends for dashboard charts.
   */
  @Get('analytics')
  @ApiOperation({
    summary: 'Get analytics data',
    description: 'Retrieve analytics data including user growth, course growth, and revenue projections for dashboard charts.',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to analyze (1-365)',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully',
    type: AnalyticsDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid days parameter',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAnalytics(
    @Query() queryDto: AnalyticsQueryDto,
  ): Promise<AnalyticsDto> {
    return this.adminService.getAnalytics(queryDto.days);
  }

  /**
   * Get system statistics summary.
   * Returns a quick overview of key system metrics.
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get system statistics summary',
    description: 'Retrieve a quick overview of key system metrics for monitoring purposes.',
  })
  @ApiResponse({
    status: 200,
    description: 'System statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number', example: 150 },
        totalCourses: { type: 'number', example: 50 },
        pendingApprovals: { type: 'number', example: 5 },
        systemUptime: { type: 'number', example: 86400 },
        databaseStatus: { type: 'string', example: 'connected' },
        lastBackup: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSystemStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    pendingApprovals: number;
    systemUptime: number;
    databaseStatus: string;
    lastBackup: Date;
  }> {
    const dashboardData = await this.adminService.getDashboardData();
    const healthData = await this.adminService.getSystemHealth();

    return {
      totalUsers: dashboardData.userStats.totalUsers,
      totalCourses: dashboardData.courseStats.totalCourses,
      pendingApprovals: dashboardData.courseStats.pendingCourses,
      systemUptime: healthData.api.uptime,
      databaseStatus: healthData.database.status,
      lastBackup: new Date(), // TODO: Implement actual backup tracking
    };
  }
}
