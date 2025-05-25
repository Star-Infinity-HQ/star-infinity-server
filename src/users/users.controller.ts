import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseIntPipe,
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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser, UserId } from '../auth/decorators/current-user.decorator';
import { Roles, AdminOnly, StaffOnly } from '../auth/decorators/roles.decorator';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { UpdateUserProfileDto, UserFilterDto } from './dto/user.dto';

/**
 * Users controller handling user profile and management endpoints.
 * Provides CRUD operations for user profiles and administrative functions.
 */
@ApiTags('Users')
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users (Admin only).
   * Returns a paginated list of all users in the system.
   */
  @Get()
  @AdminOnly()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system. Admin access required.',
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
    description: 'Number of users per page',
    example: 10,
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    description: 'Filter users by role',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/User' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllUsers(
    @Query() filterDto: UserFilterDto,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.usersService.findAll(filterDto);
  }

  /**
   * Get user by ID.
   * Returns detailed information about a specific user.
   */
  @Get(':id')
  @StaffOnly()
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve detailed information about a specific user. Staff access required.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Staff access required',
  })
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.findByIdOrThrow(id);
  }

  /**
   * Update current user profile.
   * Allows users to update their own profile information.
   */
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Update the authenticated user\'s profile information.',
  })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async updateProfile(
    @UserId() userId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateDto: UpdateUserProfileDto,
  ): Promise<User> {
    return this.usersService.updateProfile(userId, updateDto);
  }

  /**
   * Update user by ID (Admin only).
   * Allows admins to update any user's information.
   */
  @Put(':id')
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user by ID',
    description: 'Update any user\'s information. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID to update',
    example: '123',
  })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateUser(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateDto: UpdateUserProfileDto,
  ): Promise<User> {
    return this.usersService.updateProfile(id, updateDto);
  }

  /**
   * Delete user by ID (Admin only).
   * Permanently removes a user from the system.
   */
  @Delete(':id')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user by ID',
    description: 'Permanently delete a user from the system. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID to delete',
    example: '123',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.usersService.deleteUser(id);
  }

  /**
   * Get user statistics (Admin only).
   * Returns statistical information about users in the system.
   */
  @Get('stats/overview')
  @AdminOnly()
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Retrieve statistical information about users in the system. Admin access required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number', example: 150 },
        totalAdmins: { type: 'number', example: 5 },
        totalInstructors: { type: 'number', example: 25 },
        totalStudents: { type: 'number', example: 120 },
        newUsersThisMonth: { type: 'number', example: 15 },
        activeUsers: { type: 'number', example: 140 },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getUserStats(): Promise<{
    totalUsers: number;
    totalAdmins: number;
    totalInstructors: number;
    totalStudents: number;
    newUsersThisMonth: number;
    activeUsers: number;
  }> {
    return this.usersService.getUserStatistics();
  }
}
