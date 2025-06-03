import {
  Controller,
  Get,
  Put,
  Body,
  Param,
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
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { InstructorsService } from './instructors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser, UserId, UserRoleDecorator } from '../auth/decorators/current-user.decorator';
import { Roles, AdminOnly, InstructorOnly, StaffOnly, Public } from '../auth/decorators/roles.decorator';
import { Instructor } from './entities/instructor.entity';
import { Course } from '../courses/entities/course.entity';
import {
  UpdateInstructorProfileDto,
  InstructorFilterDto,
  InstructorStatsDto,
  InstructorDashboardDto,
  TopInstructorDto,
} from './dto/instructor.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';

/**
 * Instructors controller handling instructor-specific operations.
 * Provides instructor profiles, course management, and analytics.
 */
@ApiTags('Instructors')
@Controller('api/v1/instructors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  /**
   * Get all instructors with filtering and pagination.
   * Public endpoint for browsing instructors.
   */
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all instructors',
    description: 'Retrieve a paginated list of instructors with optional filtering. Public endpoint.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of instructors per page',
    example: 10,
  })
  @ApiQuery({
    name: 'username',
    required: false,
    type: String,
    description: 'Search instructors by username (partial match)',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Search instructors by email (partial match)',
  })
  @ApiQuery({
    name: 'timezone',
    required: false,
    type: String,
    description: 'Filter instructors by timezone (partial match)',
  })
  @ApiResponse({
    status: 200,
    description: 'Instructors retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        instructors: {
          type: 'array',
          items: { $ref: '#/components/schemas/Instructor' },
        },
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 3 },
      },
    },
  })
  async findAll(
    @Query() filterDto: InstructorFilterDto,
  ): Promise<{
    instructors: Instructor[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.instructorsService.findAll(filterDto);
  }

  /**
   * Get top instructors by performance metrics.
   * Public endpoint for showcasing top instructors.
   */
  @Get('top')
  @Public()
  @ApiOperation({
    summary: 'Get top instructors',
    description: 'Retrieve top-performing instructors based on course count and revenue. Public endpoint.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top instructors to return',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Top instructors retrieved successfully',
    type: [TopInstructorDto],
  })
  async getTopInstructors(
    @Query('limit') limit?: number,
  ): Promise<TopInstructorDto[]> {
    return this.instructorsService.getTopInstructors(limit || 10);
  }

  /**
   * Get instructor by ID.
   * Public endpoint for viewing instructor profiles.
   */
  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get instructor by ID',
    description: 'Retrieve detailed information about a specific instructor. Public endpoint.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Instructor ID',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Instructor found',
    type: Instructor,
  })
  @ApiResponse({
    status: 404,
    description: 'Instructor not found',
  })
  async findOne(@Param('id') id: string): Promise<Instructor> {
    return this.instructorsService.findOne(id);
  }

  /**
   * Update instructor profile.
   * Instructors can update their own profile, admins can update any instructor.
   */
  @Put(':id/profile')
  @StaffOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update instructor profile',
    description: 'Update instructor profile information. Instructors can update their own profile, admins can update any instructor.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Instructor ID to update',
    example: '123',
  })
  @ApiBody({ type: UpdateInstructorProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Instructor profile updated successfully',
    type: Instructor,
  })
  @ApiResponse({
    status: 404,
    description: 'Instructor not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own profile',
  })
  async updateProfile(
    @Param('id') id: string,
    @UserId() userId: string,
    @UserRoleDecorator() userRole: UserRole,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateDto: UpdateInstructorProfileDto,
  ): Promise<Instructor> {
    // Check if user can update this profile
    if (userRole !== UserRole.ADMIN && userId !== id) {
      throw new Error('You can only update your own profile');
    }

    return this.instructorsService.updateProfile(id, updateDto);
  }

  /**
   * Get instructor's courses.
   * Returns all courses created by a specific instructor.
   */
  @Get(':id/courses')
  @Public()
  @ApiOperation({
    summary: 'Get instructor courses',
    description: 'Retrieve all courses created by a specific instructor. Public endpoint.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Instructor ID',
    example: '123',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of courses per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Instructor courses retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        courses: {
          type: 'array',
          items: { $ref: '#/components/schemas/Course' },
        },
        total: { type: 'number', example: 15 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Instructor not found',
  })
  async getInstructorCourses(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{
    courses: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.instructorsService.getInstructorCourses(id, page || 1, limit || 10);
  }

  /**
   * Get instructor statistics.
   * Returns performance metrics for an instructor.
   */
  @Get(':id/stats')
  @StaffOnly()
  @ApiOperation({
    summary: 'Get instructor statistics',
    description: 'Retrieve performance statistics for an instructor. Staff access required.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Instructor ID',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Instructor statistics retrieved successfully',
    type: InstructorStatsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Instructor not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Staff access required',
  })
  async getInstructorStats(@Param('id') id: string): Promise<InstructorStatsDto> {
    return this.instructorsService.getInstructorStats(id);
  }

  /**
   * Get instructor dashboard data.
   * Returns comprehensive dashboard information for an instructor.
   */
  @Get(':id/dashboard')
  @InstructorOnly()
  @ApiOperation({
    summary: 'Get instructor dashboard',
    description: 'Retrieve comprehensive dashboard data for an instructor. Instructor access required.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Instructor ID',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Instructor dashboard data retrieved successfully',
    type: InstructorDashboardDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Instructor not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Instructor access required',
  })
  async getInstructorDashboard(
    @Param('id') id: string,
    @UserId() userId: string,
    @UserRoleDecorator() userRole: UserRole,
  ): Promise<InstructorDashboardDto> {
    // Check if user can access this dashboard
    if (userRole !== UserRole.ADMIN && userId !== id) {
      throw new Error('You can only access your own dashboard');
    }

    return this.instructorsService.getInstructorDashboard(id);
  }
}
