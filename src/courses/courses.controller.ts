import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser, UserId, UserRoleDecorator } from '../auth/decorators/current-user.decorator';
import { Roles, AdminOnly, InstructorOnly, StaffOnly, Public } from '../auth/decorators/roles.decorator';
import { Course } from './entities/course.entity';
import { CreateCourseDto, UpdateCourseDto, ApproveCourseDto, CourseFilterDto } from './dto/course.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';

/**
 * Courses controller handling course management endpoints.
 * Provides CRUD operations for courses with role-based access control.
 */
@ApiTags('Courses')
@Controller('api/v1/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * Create a new course (Instructor only).
   * Instructors can create courses that require admin approval.
   */
  @Post()
  @InstructorOnly()
  @ApiOperation({
    summary: 'Create a new course',
    description: 'Create a new course. Instructor access required. Courses require admin approval before being published.',
  })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: Course,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or course code already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Instructor access required',
  })
  async create(
    @UserId() instructorId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) createCourseDto: CreateCourseDto,
  ): Promise<Course> {
    return this.coursesService.create(instructorId, createCourseDto);
  }

  /**
   * Get all courses with filtering and pagination.
   * Public endpoint with optional filtering.
   */
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all courses',
    description: 'Retrieve a paginated list of courses with optional filtering. Public endpoint.',
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
  @ApiQuery({
    name: 'instructorId',
    required: false,
    type: String,
    description: 'Filter courses by instructor ID',
  })
  @ApiQuery({
    name: 'isApproved',
    required: false,
    type: Boolean,
    description: 'Filter courses by approval status',
  })
  @ApiQuery({
    name: 'courseName',
    required: false,
    type: String,
    description: 'Search courses by name (partial match)',
  })
  @ApiQuery({
    name: 'courseCode',
    required: false,
    type: String,
    description: 'Search courses by code (partial match)',
  })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        courses: {
          type: 'array',
          items: { $ref: '#/components/schemas/Course' },
        },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  async findAll(
    @Query() filterDto: CourseFilterDto,
  ): Promise<{
    courses: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.coursesService.findAll(filterDto);
  }

  /**
   * Get course by ID.
   * Public endpoint for viewing course details.
   */
  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get course by ID',
    description: 'Retrieve detailed information about a specific course. Public endpoint.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Course ID',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Course found',
    type: Course,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  /**
   * Update course by ID.
   * Instructors can update their own courses, admins can update any course.
   */
  @Put(':id')
  @StaffOnly()
  @ApiOperation({
    summary: 'Update course by ID',
    description: 'Update course information. Instructors can update their own courses, admins can update any course.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Course ID to update',
    example: '123',
  })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: Course,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own courses',
  })
  async update(
    @Param('id') id: string,
    @UserId() userId: string,
    @UserRoleDecorator() userRole: UserRole,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto, userId, userRole);
  }

  /**
   * Approve or reject a course (Admin only).
   * Admins can approve or reject courses for publication.
   */
  @Put(':id/approve')
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve or reject a course',
    description: 'Approve or reject a course for publication. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Course ID to approve/reject',
    example: '123',
  })
  @ApiBody({ type: ApproveCourseDto })
  @ApiResponse({
    status: 200,
    description: 'Course approval status updated successfully',
    type: Course,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async approveCourse(
    @Param('id') id: string,
    @UserId() adminId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) approveCourseDto: ApproveCourseDto,
  ): Promise<Course> {
    return this.coursesService.approveCourse(id, approveCourseDto, adminId);
  }

  /**
   * Delete course by ID.
   * Instructors can delete their own courses, admins can delete any course.
   */
  @Delete(':id')
  @StaffOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete course by ID',
    description: 'Delete a course from the system. Instructors can delete their own courses, admins can delete any course.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Course ID to delete',
    example: '123',
  })
  @ApiResponse({
    status: 204,
    description: 'Course deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own courses',
  })
  async remove(
    @Param('id') id: string,
    @UserId() userId: string,
    @UserRoleDecorator() userRole: UserRole,
  ): Promise<void> {
    return this.coursesService.remove(id, userId, userRole);
  }

  /**
   * Get course statistics (Admin only).
   * Returns statistical information about courses in the system.
   */
  @Get('stats/overview')
  @AdminOnly()
  @ApiOperation({
    summary: 'Get course statistics',
    description: 'Retrieve statistical information about courses in the system. Admin access required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalCourses: { type: 'number', example: 50 },
        approvedCourses: { type: 'number', example: 35 },
        pendingCourses: { type: 'number', example: 10 },
        rejectedCourses: { type: 'number', example: 5 },
        coursesThisMonth: { type: 'number', example: 8 },
        averagePrice: { type: 'number', example: 299.99 },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getCourseStats(): Promise<{
    totalCourses: number;
    approvedCourses: number;
    pendingCourses: number;
    rejectedCourses: number;
    coursesThisMonth: number;
    averagePrice: number;
  }> {
    return this.coursesService.getCourseStatistics();
  }
}
