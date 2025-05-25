import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/database/prisma.service';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { UpdateUserProfileDto, UserFilterDto } from './dto/user.dto';

/**
 * Service for managing users across different user types (Admin, Instructor, Student).
 * Provides a unified interface for user operations regardless of the underlying table.
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a user by their ID across all user types.
   *
   * @param id - The user ID to search for
   * @returns The user if found, null otherwise
   */
  async findById(id: string): Promise<User | null> {
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return null;
    }

    // Check Admin table
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
    });

    if (admin) {
      return new User(admin, UserRole.ADMIN);
    }

    // Check Instructor table
    const instructor = await this.prisma.instructor.findUnique({
      where: { id: userId },
    });

    if (instructor) {
      return new User(instructor, UserRole.INSTRUCTOR);
    }

    // Check Student table (when implemented)
    // const student = await this.prisma.student.findUnique({
    //   where: { id: userId },
    // });

    // if (student) {
    //   return new User(student, UserRole.STUDENT);
    // }

    return null;
  }

  /**
   * Find a user by their email address across all user types.
   *
   * @param email - The email address to search for
   * @returns The user if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    // Check Admin table
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (admin) {
      return new User(admin, UserRole.ADMIN);
    }

    // Check Instructor table
    const instructor = await this.prisma.instructor.findUnique({
      where: { email },
    });

    if (instructor) {
      return new User(instructor, UserRole.INSTRUCTOR);
    }

    // Check Student table (when implemented)
    // const student = await this.prisma.student.findUnique({
    //   where: { email },
    // });

    // if (student) {
    //   return new User(student, UserRole.STUDENT);
    // }

    return null;
  }

  /**
   * Find a user by their username across all user types.
   *
   * @param username - The username to search for
   * @returns The user if found, null otherwise
   */
  async findByUsername(username: string): Promise<User | null> {
    // Check Admin table
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (admin) {
      return new User(admin, UserRole.ADMIN);
    }

    // Check Instructor table
    const instructor = await this.prisma.instructor.findUnique({
      where: { username },
    });

    if (instructor) {
      return new User(instructor, UserRole.INSTRUCTOR);
    }

    // Check Student table (when implemented)
    // const student = await this.prisma.student.findUnique({
    //   where: { username },
    // });

    // if (student) {
    //   return new User(student, UserRole.STUDENT);
    // }

    return null;
  }

  /**
   * Get the raw user data with password for authentication purposes.
   * This method is used internally by the auth service.
   *
   * @param email - The email address to search for
   * @returns The raw user data with password, or null if not found
   */
  async findByEmailWithPassword(email: string): Promise<{ user: User; password: string } | null> {
    // Check Admin table
    const admin = await this.prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        createdAt: true,
        modifiedAt: true,
      },
    });

    if (admin) {
      return {
        user: new User(admin, UserRole.ADMIN),
        password: admin.password,
      };
    }

    // Check Instructor table
    const instructor = await this.prisma.instructor.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        createdAt: true,
        modifiedAt: true,
      },
    });

    if (instructor) {
      return {
        user: new User(instructor, UserRole.INSTRUCTOR),
        password: instructor.password,
      };
    }

    return null;
  }

  /**
   * Find a user by ID and throw an exception if not found.
   *
   * @param id - The user ID to search for
   * @returns The user if found
   * @throws NotFoundException if user is not found
   */
  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Find all users with filtering and pagination.
   *
   * @param filterDto - Filter and pagination options
   * @returns Paginated list of users
   */
  async findAll(filterDto: UserFilterDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, role, username, email, sortBy = 'createdAt', sortOrder = 'desc' } = filterDto;
    const skip = (page - 1) * limit;

    let users: User[] = [];
    let total = 0;

    // Search in Admin table
    if (!role || role === UserRole.ADMIN) {
      const adminWhere: any = {};
      if (username) adminWhere.username = { contains: username, mode: 'insensitive' };
      if (email) adminWhere.email = { contains: email, mode: 'insensitive' };

      const [admins, adminCount] = await Promise.all([
        this.prisma.admin.findMany({
          where: adminWhere,
          skip: role === UserRole.ADMIN ? skip : 0,
          take: role === UserRole.ADMIN ? limit : undefined,
          orderBy: { [sortBy]: sortOrder },
        }),
        this.prisma.admin.count({ where: adminWhere }),
      ]);

      users.push(...admins.map(admin => new User(admin, UserRole.ADMIN)));
      total += adminCount;
    }

    // Search in Instructor table
    if (!role || role === UserRole.INSTRUCTOR) {
      const instructorWhere: any = {};
      if (username) instructorWhere.username = { contains: username, mode: 'insensitive' };
      if (email) instructorWhere.email = { contains: email, mode: 'insensitive' };

      const [instructors, instructorCount] = await Promise.all([
        this.prisma.instructor.findMany({
          where: instructorWhere,
          skip: role === UserRole.INSTRUCTOR ? skip : 0,
          take: role === UserRole.INSTRUCTOR ? limit : undefined,
          orderBy: { [sortBy]: sortOrder },
        }),
        this.prisma.instructor.count({ where: instructorWhere }),
      ]);

      users.push(...instructors.map(instructor => new User(instructor, UserRole.INSTRUCTOR)));
      total += instructorCount;
    }

    // If no specific role filter, apply pagination to combined results
    if (!role) {
      users.sort((a, b) => {
        const aValue = a[sortBy as keyof User];
        const bValue = b[sortBy as keyof User];

        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
      users = users.slice(skip, skip + limit);
    }

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update user profile information.
   *
   * @param userId - The ID of the user to update
   * @param updateDto - The update data
   * @returns The updated user
   * @throws NotFoundException if user is not found
   * @throws BadRequestException if update data is invalid for user type
   */
  async updateProfile(userId: string, updateDto: UpdateUserProfileDto): Promise<User> {
    const user = await this.findByIdOrThrow(userId);
    const id = parseInt(userId);

    if (isNaN(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    try {
      switch (user.role) {
        case UserRole.ADMIN:
          const updatedAdmin = await this.prisma.admin.update({
            where: { id },
            data: {
              ...(updateDto.username && { username: updateDto.username }),
              ...(updateDto.email && { email: updateDto.email }),
            },
          });
          return new User(updatedAdmin, UserRole.ADMIN);

        case UserRole.INSTRUCTOR:
          const updatedInstructor = await this.prisma.instructor.update({
            where: { id },
            data: {
              ...(updateDto.username && { username: updateDto.username }),
              ...(updateDto.email && { email: updateDto.email }),
              ...(updateDto.instructorDescription && { instructorDescription: updateDto.instructorDescription }),
              ...(updateDto.instructorBio && { instructorBio: updateDto.instructorBio }),
              ...(updateDto.instructorAddress && { instructorAddress: updateDto.instructorAddress }),
              ...(updateDto.instructorTimezone && { instructorTimezone: updateDto.instructorTimezone }),
            },
          });
          return new User(updatedInstructor, UserRole.INSTRUCTOR);

        case UserRole.STUDENT:
          // TODO: Implement student update when Student model is available
          throw new BadRequestException('Student profile updates not yet implemented');

        default:
          throw new BadRequestException('Invalid user role');
      }
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Username or email already exists');
      }
      throw error;
    }
  }

  /**
   * Delete a user from the system.
   *
   * @param userId - The ID of the user to delete
   * @throws NotFoundException if user is not found
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.findByIdOrThrow(userId);
    const id = parseInt(userId);

    if (isNaN(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    try {
      switch (user.role) {
        case UserRole.ADMIN:
          await this.prisma.admin.delete({ where: { id } });
          break;

        case UserRole.INSTRUCTOR:
          // First delete related instructor courses
          await this.prisma.instructorCourse.deleteMany({ where: { instructorId: id } });
          await this.prisma.instructor.delete({ where: { id } });
          break;

        case UserRole.STUDENT:
          // TODO: Implement student deletion when Student model is available
          throw new BadRequestException('Student deletion not yet implemented');

        default:
          throw new BadRequestException('Invalid user role');
      }
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      throw error;
    }
  }

  /**
   * Get user statistics for admin dashboard.
   *
   * @returns Statistical information about users
   */
  async getUserStatistics(): Promise<{
    totalUsers: number;
    totalAdmins: number;
    totalInstructors: number;
    totalStudents: number;
    newUsersThisMonth: number;
    activeUsers: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalAdmins,
      totalInstructors,
      newAdminsThisMonth,
      newInstructorsThisMonth,
    ] = await Promise.all([
      this.prisma.admin.count(),
      this.prisma.instructor.count(),
      this.prisma.admin.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.instructor.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
    ]);

    const totalStudents = 0; // TODO: Implement when Student model is available
    const newStudentsThisMonth = 0; // TODO: Implement when Student model is available

    const totalUsers = totalAdmins + totalInstructors + totalStudents;
    const newUsersThisMonth = newAdminsThisMonth + newInstructorsThisMonth + newStudentsThisMonth;
    const activeUsers = totalUsers; // TODO: Implement proper active user tracking

    return {
      totalUsers,
      totalAdmins,
      totalInstructors,
      totalStudents,
      newUsersThisMonth,
      activeUsers,
    };
  }
}
