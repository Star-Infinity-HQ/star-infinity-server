import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/database/prisma.service';
import { Instructor } from './entities/instructor.entity';
import { Course } from '../courses/entities/course.entity';
import { UpdateInstructorProfileDto, InstructorFilterDto } from './dto/instructor.dto';

/**
 * Service for managing instructor-specific operations.
 * Handles instructor profiles, course assignments, and instructor analytics.
 */
@Injectable()
export class InstructorsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all instructors with filtering and pagination.
   * 
   * @param filterDto - Filter and pagination options
   * @returns Paginated list of instructors
   */
  async findAll(filterDto: InstructorFilterDto): Promise<{
    instructors: Instructor[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      username,
      email,
      timezone,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filterDto;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Apply filters
    if (username) {
      where.username = { contains: username, mode: 'insensitive' };
    }

    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    if (timezone) {
      where.instructorTimezone = { contains: timezone, mode: 'insensitive' };
    }

    const [instructors, total] = await Promise.all([
      this.prisma.instructor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              instructorCourses: true,
            },
          },
        },
      }),
      this.prisma.instructor.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      instructors: instructors.map(instructor => new Instructor(instructor)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find an instructor by ID.
   * 
   * @param id - Instructor ID
   * @returns The instructor if found
   * @throws NotFoundException if instructor is not found
   */
  async findOne(id: string): Promise<Instructor> {
    const instructorId = parseInt(id);
    
    if (isNaN(instructorId)) {
      throw new BadRequestException('Invalid instructor ID');
    }

    const instructor = await this.prisma.instructor.findUnique({
      where: { id: instructorId },
      include: {
        _count: {
          select: {
            instructorCourses: true,
          },
        },
      },
    });

    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }

    return new Instructor(instructor);
  }

  /**
   * Update instructor profile.
   * 
   * @param id - Instructor ID
   * @param updateDto - Update data
   * @returns The updated instructor
   * @throws NotFoundException if instructor is not found
   */
  async updateProfile(id: string, updateDto: UpdateInstructorProfileDto): Promise<Instructor> {
    const instructorId = parseInt(id);
    
    if (isNaN(instructorId)) {
      throw new BadRequestException('Invalid instructor ID');
    }

    // Ensure instructor exists
    await this.findOne(id);

    try {
      const updatedInstructor = await this.prisma.instructor.update({
        where: { id: instructorId },
        data: {
          ...(updateDto.username && { username: updateDto.username }),
          ...(updateDto.email && { email: updateDto.email }),
          ...(updateDto.instructorDescription && { instructorDescription: updateDto.instructorDescription }),
          ...(updateDto.instructorBio && { instructorBio: updateDto.instructorBio }),
          ...(updateDto.instructorAddress && { instructorAddress: updateDto.instructorAddress }),
          ...(updateDto.instructorTimezone && { instructorTimezone: updateDto.instructorTimezone }),
        },
        include: {
          _count: {
            select: {
              instructorCourses: true,
            },
          },
        },
      });

      return new Instructor(updatedInstructor);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Username or email already exists');
      }
      throw error;
    }
  }

  /**
   * Get courses assigned to an instructor.
   * 
   * @param instructorId - Instructor ID
   * @param page - Page number for pagination
   * @param limit - Number of courses per page
   * @returns Paginated list of instructor's courses
   */
  async getInstructorCourses(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    courses: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const instructorIdInt = parseInt(instructorId);
    
    if (isNaN(instructorIdInt)) {
      throw new BadRequestException('Invalid instructor ID');
    }

    // Ensure instructor exists
    await this.findOne(instructorId);

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where: { instructorId: instructorIdInt },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          approvedByAdmin: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.course.count({
        where: { instructorId: instructorIdInt },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      courses: courses.map(course => new Course(course)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get instructor statistics and analytics.
   * 
   * @param instructorId - Instructor ID
   * @returns Instructor statistics
   */
  async getInstructorStats(instructorId: string): Promise<{
    totalCourses: number;
    approvedCourses: number;
    pendingCourses: number;
    totalRevenue: number;
    averageCoursePrice: number;
    coursesThisMonth: number;
    enrollmentCount: number; // TODO: Implement when enrollment system is added
  }> {
    const instructorIdInt = parseInt(instructorId);
    
    if (isNaN(instructorIdInt)) {
      throw new BadRequestException('Invalid instructor ID');
    }

    // Ensure instructor exists
    await this.findOne(instructorId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCourses,
      approvedCourses,
      pendingCourses,
      coursesThisMonth,
      revenueResult,
      averagePriceResult,
    ] = await Promise.all([
      this.prisma.course.count({
        where: { instructorId: instructorIdInt },
      }),
      this.prisma.course.count({
        where: { instructorId: instructorIdInt, isApproved: true },
      }),
      this.prisma.course.count({
        where: { instructorId: instructorIdInt, isApproved: false },
      }),
      this.prisma.course.count({
        where: {
          instructorId: instructorIdInt,
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.course.aggregate({
        where: { instructorId: instructorIdInt, isApproved: true },
        _sum: { coursePrice: true },
      }),
      this.prisma.course.aggregate({
        where: { instructorId: instructorIdInt },
        _avg: { coursePrice: true },
      }),
    ]);

    const totalRevenue = revenueResult._sum.coursePrice || 0;
    const averageCoursePrice = averagePriceResult._avg.coursePrice || 0;

    return {
      totalCourses,
      approvedCourses,
      pendingCourses,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageCoursePrice: Math.round(averageCoursePrice * 100) / 100,
      coursesThisMonth,
      enrollmentCount: 0, // TODO: Implement when enrollment system is added
    };
  }

  /**
   * Get instructor dashboard data.
   * 
   * @param instructorId - Instructor ID
   * @returns Dashboard data for instructor
   */
  async getInstructorDashboard(instructorId: string): Promise<{
    profile: Instructor;
    stats: {
      totalCourses: number;
      approvedCourses: number;
      pendingCourses: number;
      totalRevenue: number;
      averageCoursePrice: number;
      coursesThisMonth: number;
      enrollmentCount: number;
    };
    recentCourses: Course[];
    pendingApprovals: Course[];
  }> {
    const instructorIdInt = parseInt(instructorId);
    
    if (isNaN(instructorIdInt)) {
      throw new BadRequestException('Invalid instructor ID');
    }

    const [profile, stats, recentCoursesData, pendingApprovalsData] = await Promise.all([
      this.findOne(instructorId),
      this.getInstructorStats(instructorId),
      this.prisma.course.findMany({
        where: { instructorId: instructorIdInt },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.findMany({
        where: { instructorId: instructorIdInt, isApproved: false },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      profile,
      stats,
      recentCourses: recentCoursesData.map(course => new Course(course)),
      pendingApprovals: pendingApprovalsData.map(course => new Course(course)),
    };
  }

  /**
   * Get top instructors by various metrics.
   * 
   * @param limit - Number of top instructors to return
   * @returns List of top instructors with their metrics
   */
  async getTopInstructors(limit: number = 10): Promise<Array<{
    instructor: Instructor;
    courseCount: number;
    approvedCourseCount: number;
    totalRevenue: number;
  }>> {
    const instructors = await this.prisma.instructor.findMany({
      include: {
        _count: {
          select: {
            instructorCourses: true,
          },
        },
        courses: {
          select: {
            isApproved: true,
            coursePrice: true,
          },
        },
      },
      take: limit * 2, // Get more to filter and sort
    });

    const instructorMetrics = instructors.map(instructor => {
      const courseCount = instructor._count.instructorCourses;
      const approvedCourseCount = instructor.courses.filter(course => course.isApproved).length;
      const totalRevenue = instructor.courses
        .filter(course => course.isApproved)
        .reduce((sum, course) => sum + course.coursePrice, 0);

      return {
        instructor: new Instructor(instructor),
        courseCount,
        approvedCourseCount,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      };
    });

    // Sort by approved course count and total revenue
    return instructorMetrics
      .sort((a, b) => {
        if (b.approvedCourseCount !== a.approvedCourseCount) {
          return b.approvedCourseCount - a.approvedCourseCount;
        }
        return b.totalRevenue - a.totalRevenue;
      })
      .slice(0, limit);
  }
}
