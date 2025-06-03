import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../shared/database/prisma.service';
import { Course } from './entities/course.entity';
import { CreateCourseDto, UpdateCourseDto, ApproveCourseDto, CourseFilterDto } from './dto/course.dto';
import { UserRole } from '../users/enums/user-role.enum';

/**
 * Service for managing courses in the system.
 * Handles course creation, updates, approval, and retrieval operations.
 */
@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new course.
   * 
   * @param instructorId - ID of the instructor creating the course
   * @param createCourseDto - Course creation data
   * @returns The created course
   * @throws BadRequestException if course code already exists
   */
  async create(instructorId: string, createCourseDto: CreateCourseDto): Promise<Course> {
    const instructorIdInt = parseInt(instructorId);
    
    if (isNaN(instructorIdInt)) {
      throw new BadRequestException('Invalid instructor ID');
    }

    // Check if course code already exists
    const existingCourse = await this.prisma.course.findUnique({
      where: { courseCode: createCourseDto.courseCode },
    });

    if (existingCourse) {
      throw new BadRequestException('Course code already exists');
    }

    // Validate dates
    const startDate = new Date(createCourseDto.courseStartDate);
    const endDate = new Date(createCourseDto.courseEndDate);
    
    if (startDate >= endDate) {
      throw new BadRequestException('Course start date must be before end date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Course start date cannot be in the past');
    }

    try {
      const course = await this.prisma.course.create({
        data: {
          instructorId: instructorIdInt,
          courseCode: createCourseDto.courseCode,
          courseName: createCourseDto.courseName,
          courseDescription: createCourseDto.courseDescription,
          courseImage: createCourseDto.courseImage,
          courseDuration: createCourseDto.courseDuration,
          coursePrice: createCourseDto.coursePrice,
          courseDiscount: createCourseDto.courseDiscount,
          courseStartDate: createCourseDto.courseStartDate,
          courseEndDate: createCourseDto.courseEndDate,
          isApproved: false, // Courses need admin approval
        },
      });

      // Create instructor-course relationship
      await this.prisma.instructorCourse.create({
        data: {
          instructorId: instructorIdInt,
          courseId: course.id,
        },
      });

      return new Course(course);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Course code already exists');
      }
      throw error;
    }
  }

  /**
   * Find all courses with filtering and pagination.
   * 
   * @param filterDto - Filter and pagination options
   * @returns Paginated list of courses
   */
  async findAll(filterDto: CourseFilterDto): Promise<{
    courses: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      instructorId,
      isApproved,
      courseName,
      courseCode,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filterDto;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Apply filters
    if (instructorId) {
      const instructorIdInt = parseInt(instructorId);
      if (!isNaN(instructorIdInt)) {
        where.instructorId = instructorIdInt;
      }
    }

    if (isApproved !== undefined) {
      where.isApproved = isApproved;
    }

    if (courseName) {
      where.courseName = { contains: courseName, mode: 'insensitive' };
    }

    if (courseCode) {
      where.courseCode = { contains: courseCode, mode: 'insensitive' };
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          instructor: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          approvedByAdmin: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.course.count({ where }),
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
   * Find a course by ID.
   * 
   * @param id - Course ID
   * @returns The course if found
   * @throws NotFoundException if course is not found
   */
  async findOne(id: string): Promise<Course> {
    const courseId = parseInt(id);
    
    if (isNaN(courseId)) {
      throw new BadRequestException('Invalid course ID');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            username: true,
            email: true,
            instructorBio: true,
            instructorDescription: true,
          },
        },
        approvedByAdmin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return new Course(course);
  }

  /**
   * Update a course.
   * 
   * @param id - Course ID
   * @param updateCourseDto - Update data
   * @param userId - ID of the user making the update
   * @param userRole - Role of the user making the update
   * @returns The updated course
   * @throws NotFoundException if course is not found
   * @throws ForbiddenException if user doesn't have permission
   */
  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Course> {
    const courseId = parseInt(id);
    const userIdInt = parseInt(userId);
    
    if (isNaN(courseId) || isNaN(userIdInt)) {
      throw new BadRequestException('Invalid course or user ID');
    }

    const existingCourse = await this.findOne(id);

    // Check permissions
    if (userRole !== UserRole.ADMIN && existingCourse.instructorId !== userId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    // Validate dates if provided
    if (updateCourseDto.courseStartDate || updateCourseDto.courseEndDate) {
      const startDate = new Date(updateCourseDto.courseStartDate || existingCourse.courseStartDate);
      const endDate = new Date(updateCourseDto.courseEndDate || existingCourse.courseEndDate);
      
      if (startDate >= endDate) {
        throw new BadRequestException('Course start date must be before end date');
      }
    }

    try {
      const updatedCourse = await this.prisma.course.update({
        where: { id: courseId },
        data: {
          ...(updateCourseDto.courseCode && { courseCode: updateCourseDto.courseCode }),
          ...(updateCourseDto.courseName && { courseName: updateCourseDto.courseName }),
          ...(updateCourseDto.courseDescription && { courseDescription: updateCourseDto.courseDescription }),
          ...(updateCourseDto.courseImage && { courseImage: updateCourseDto.courseImage }),
          ...(updateCourseDto.courseDuration && { courseDuration: updateCourseDto.courseDuration }),
          ...(updateCourseDto.coursePrice && { coursePrice: updateCourseDto.coursePrice }),
          ...(updateCourseDto.courseDiscount !== undefined && { courseDiscount: updateCourseDto.courseDiscount }),
          ...(updateCourseDto.courseStartDate && { courseStartDate: updateCourseDto.courseStartDate }),
          ...(updateCourseDto.courseEndDate && { courseEndDate: updateCourseDto.courseEndDate }),
          // Reset approval if course content is modified (unless admin is updating)
          ...(userRole !== UserRole.ADMIN && { isApproved: false, approvedByAdminId: null }),
        },
      });

      return new Course(updatedCourse);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Course code already exists');
      }
      throw error;
    }
  }

  /**
   * Approve or reject a course (Admin only).
   * 
   * @param id - Course ID
   * @param approveCourseDto - Approval data
   * @param adminId - ID of the admin making the decision
   * @returns The updated course
   * @throws NotFoundException if course is not found
   */
  async approveCourse(id: string, approveCourseDto: ApproveCourseDto, adminId: string): Promise<Course> {
    const courseId = parseInt(id);
    const adminIdInt = parseInt(adminId);
    
    if (isNaN(courseId) || isNaN(adminIdInt)) {
      throw new BadRequestException('Invalid course or admin ID');
    }

    await this.findOne(id); // Ensure course exists

    const updatedCourse = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        isApproved: approveCourseDto.isApproved,
        approvedByAdminId: approveCourseDto.isApproved ? adminIdInt : null,
      },
    });

    return new Course(updatedCourse);
  }

  /**
   * Delete a course.
   * 
   * @param id - Course ID
   * @param userId - ID of the user making the deletion
   * @param userRole - Role of the user making the deletion
   * @throws NotFoundException if course is not found
   * @throws ForbiddenException if user doesn't have permission
   */
  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const courseId = parseInt(id);
    const userIdInt = parseInt(userId);
    
    if (isNaN(courseId) || isNaN(userIdInt)) {
      throw new BadRequestException('Invalid course or user ID');
    }

    const existingCourse = await this.findOne(id);

    // Check permissions
    if (userRole !== UserRole.ADMIN && existingCourse.instructorId !== userId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    try {
      // Delete instructor-course relationships first
      await this.prisma.instructorCourse.deleteMany({
        where: { courseId },
      });

      // Delete the course
      await this.prisma.course.delete({
        where: { id: courseId },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Get course statistics for admin dashboard.
   * 
   * @returns Statistical information about courses
   */
  async getCourseStatistics(): Promise<{
    totalCourses: number;
    approvedCourses: number;
    pendingCourses: number;
    rejectedCourses: number;
    coursesThisMonth: number;
    averagePrice: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCourses,
      approvedCourses,
      pendingCourses,
      coursesThisMonth,
      averagePriceResult,
    ] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({ where: { isApproved: true } }),
      this.prisma.course.count({ where: { isApproved: false } }),
      this.prisma.course.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.course.aggregate({
        _avg: { coursePrice: true },
      }),
    ]);

    const rejectedCourses = 0; // TODO: Implement rejection tracking
    const averagePrice = averagePriceResult._avg.coursePrice || 0;

    return {
      totalCourses,
      approvedCourses,
      pendingCourses,
      rejectedCourses,
      coursesThisMonth,
      averagePrice: Math.round(averagePrice * 100) / 100,
    };
  }
}
