import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/database/prisma.service';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { AdminDashboardDto, SystemHealthDto, AdminActionLogDto } from './dto/admin.dto';

/**
 * Service for administrative functions and system management.
 * Provides dashboard data, system health monitoring, and administrative actions.
 */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get comprehensive dashboard data for admin panel.
   *
   * @returns Dashboard statistics and recent activity
   */
  async getDashboardData(): Promise<AdminDashboardDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get user statistics
    const [
      totalAdmins,
      totalInstructors,
      totalStudents,
      newUsersThisMonth,
      newUsersThisWeek,
    ] = await Promise.all([
      this.prisma.admin.count(),
      this.prisma.instructor.count(),
      0, // TODO: Add student count when Student model is available
      Promise.all([
        this.prisma.admin.count({ where: { createdAt: { gte: startOfMonth } } }),
        this.prisma.instructor.count({ where: { createdAt: { gte: startOfMonth } } }),
      ]).then(([admins, instructors]) => admins + instructors),
      Promise.all([
        this.prisma.admin.count({ where: { createdAt: { gte: startOfWeek } } }),
        this.prisma.instructor.count({ where: { createdAt: { gte: startOfWeek } } }),
      ]).then(([admins, instructors]) => admins + instructors),
    ]);

    // Get course statistics
    const [
      totalCourses,
      approvedCourses,
      pendingCourses,
      newCoursesThisMonth,
      newCoursesThisWeek,
      averagePriceResult,
    ] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({ where: { isApproved: true } }),
      this.prisma.course.count({ where: { isApproved: false } }),
      this.prisma.course.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.course.count({ where: { createdAt: { gte: startOfWeek } } }),
      this.prisma.course.aggregate({ _avg: { coursePrice: true } }),
    ]);

    // Get recent users (last 10)
    const [recentAdmins, recentInstructors] = await Promise.all([
      this.prisma.admin.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        },
      }),
      this.prisma.instructor.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        },
      }),
    ]);

    // Get recent courses (last 10)
    const recentCourses = await this.prisma.course.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Get pending courses for approval
    const pendingCoursesForApproval = await this.prisma.course.findMany({
      where: { isApproved: false },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    const totalUsers = totalAdmins + totalInstructors + totalStudents;
    const averagePrice = averagePriceResult._avg.coursePrice || 0;

    // Combine recent users
    const recentUsers = [
      ...recentAdmins.map(admin => ({ ...admin, role: UserRole.ADMIN })),
      ...recentInstructors.map(instructor => ({ ...instructor, role: UserRole.INSTRUCTOR })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      userStats: {
        totalUsers,
        totalAdmins,
        totalInstructors,
        totalStudents,
        newUsersThisMonth,
        newUsersThisWeek,
        activeUsers: totalUsers, // TODO: Implement proper active user tracking
      },
      courseStats: {
        totalCourses,
        approvedCourses,
        pendingCourses,
        rejectedCourses: 0, // TODO: Implement rejection tracking
        newCoursesThisMonth,
        newCoursesThisWeek,
        averagePrice: Math.round(averagePrice * 100) / 100,
      },
      recentUsers: recentUsers.map(user => ({
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })),
      recentCourses: recentCourses.map(course => new Course(course)),
      pendingApprovals: pendingCoursesForApproval.map(course => new Course(course)),
    };
  }

  /**
   * Get system health information.
   *
   * @returns System health status and metrics
   */
  async getSystemHealth(): Promise<SystemHealthDto> {
    const startTime = Date.now();

    try {
      // Test database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - startTime;

      // Get database statistics
      const [userCount, courseCount] = await Promise.all([
        Promise.all([
          this.prisma.admin.count(),
          this.prisma.instructor.count(),
        ]).then(([admins, instructors]) => admins + instructors),
        this.prisma.course.count(),
      ]);

      return {
        status: 'healthy',
        timestamp: new Date(),
        database: {
          status: 'connected',
          responseTime: dbResponseTime,
          totalRecords: userCount + courseCount,
        },
        api: {
          status: 'operational',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
        services: {
          authentication: 'operational',
          authorization: 'operational',
          fileUpload: 'operational', // TODO: Implement when file upload is added
          emailService: 'operational', // TODO: Implement when email service is added
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        database: {
          status: 'disconnected',
          responseTime: Date.now() - startTime,
          totalRecords: 0,
          error: error.message,
        },
        api: {
          status: 'degraded',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
        services: {
          authentication: 'degraded',
          authorization: 'degraded',
          fileUpload: 'unknown',
          emailService: 'unknown',
        },
      };
    }
  }

  /**
   * Get recent admin actions and system logs.
   *
   * @param limit - Number of logs to retrieve
   * @returns Recent admin action logs
   */
  async getAdminActionLogs(limit: number = 50): Promise<AdminActionLogDto[]> {
    // TODO: Implement proper audit logging system
    // For now, return recent course approvals as example logs
    const recentApprovals = await this.prisma.course.findMany({
      where: {
        isApproved: true,
        approvedByAdminId: { not: null },
      },
      take: limit,
      orderBy: { modifiedAt: 'desc' },
      include: {
        approvedByAdmin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        instructor: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return recentApprovals.map(course => ({
      id: `approval_${course.id}`,
      adminId: course.approvedByAdminId?.toString() || '',
      adminUsername: course.approvedByAdmin?.username || 'Unknown',
      action: 'COURSE_APPROVED',
      description: `Approved course "${course.courseName}" by ${course.instructor.username}`,
      targetType: 'COURSE',
      targetId: course.id.toString(),
      metadata: {
        courseCode: course.courseCode,
        courseName: course.courseName,
        instructorId: course.instructorId.toString(),
        instructorUsername: course.instructor.username,
      },
      timestamp: course.modifiedAt,
    }));
  }

  /**
   * Bulk approve multiple courses.
   *
   * @param courseIds - Array of course IDs to approve
   * @param adminId - ID of the admin performing the action
   * @returns Number of courses approved
   */
  async bulkApproveCourses(courseIds: string[], adminId: string): Promise<{ approved: number }> {
    const adminIdInt = parseInt(adminId);
    const courseIdsInt = courseIds.map(id => parseInt(id)).filter(id => !isNaN(id));

    if (isNaN(adminIdInt) || courseIdsInt.length === 0) {
      throw new BadRequestException('Invalid admin ID or course IDs');
    }

    const result = await this.prisma.course.updateMany({
      where: {
        id: { in: courseIdsInt },
        isApproved: false, // Only approve pending courses
      },
      data: {
        isApproved: true,
        approvedByAdminId: adminIdInt,
      },
    });

    return { approved: result.count };
  }

  /**
   * Bulk reject multiple courses.
   *
   * @param courseIds - Array of course IDs to reject
   * @param adminId - ID of the admin performing the action
   * @returns Number of courses rejected
   */
  async bulkRejectCourses(courseIds: string[], adminId: string): Promise<{ rejected: number }> {
    const adminIdInt = parseInt(adminId);
    const courseIdsInt = courseIds.map(id => parseInt(id)).filter(id => !isNaN(id));

    if (isNaN(adminIdInt) || courseIdsInt.length === 0) {
      throw new BadRequestException('Invalid admin ID or course IDs');
    }

    // For now, we'll just set isApproved to false
    // TODO: Implement proper rejection status when schema is updated
    const result = await this.prisma.course.updateMany({
      where: {
        id: { in: courseIdsInt },
      },
      data: {
        isApproved: false,
        approvedByAdminId: null,
      },
    });

    return { rejected: result.count };
  }

  /**
   * Get detailed analytics data.
   *
   * @param days - Number of days to analyze (default: 30)
   * @returns Analytics data for charts and reports
   */
  async getAnalytics(days: number = 30): Promise<{
    userGrowth: Array<{ date: string; users: number }>;
    courseGrowth: Array<{ date: string; courses: number }>;
    revenueProjection: Array<{ date: string; revenue: number }>;
  }> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Generate date range
    const dateRange: Date[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateRange.push(new Date(d));
    }

    // TODO: Implement proper analytics queries
    // For now, return mock data structure
    const userGrowth = dateRange.map((date: Date) => ({
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 10) + 1, // Mock data
    }));

    const courseGrowth = dateRange.map((date: Date) => ({
      date: date.toISOString().split('T')[0],
      courses: Math.floor(Math.random() * 5) + 1, // Mock data
    }));

    const revenueProjection = dateRange.map((date: Date) => ({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 1000) + 100, // Mock data
    }));

    return {
      userGrowth,
      courseGrowth,
      revenueProjection,
    };
  }
}
