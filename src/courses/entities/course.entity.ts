import { ApiProperty } from '@nestjs/swagger';

/**
 * Course entity representing a course in the system.
 */
export class Course {
  @ApiProperty({
    description: 'Unique identifier for the course',
    example: '123',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the instructor who created the course',
    example: '456',
  })
  instructorId: string;

  @ApiProperty({
    description: 'ID of the admin who approved the course',
    example: '789',
    nullable: true,
  })
  approvedByAdminId?: string;

  @ApiProperty({
    description: 'Unique course code',
    example: 'CS101',
  })
  courseCode: string;

  @ApiProperty({
    description: 'Course name',
    example: 'Introduction to Computer Science',
  })
  courseName: string;

  @ApiProperty({
    description: 'Course description',
    example: 'A comprehensive introduction to computer science fundamentals',
  })
  courseDescription: string;

  @ApiProperty({
    description: 'Course image URL',
    example: 'https://example.com/course-image.jpg',
    nullable: true,
  })
  courseImage?: string;

  @ApiProperty({
    description: 'Course duration in hours',
    example: 40,
  })
  courseDuration: number;

  @ApiProperty({
    description: 'Course price in USD',
    example: 299.99,
  })
  coursePrice: number;

  @ApiProperty({
    description: 'Course discount percentage',
    example: 10.5,
    nullable: true,
  })
  courseDiscount?: number;

  @ApiProperty({
    description: 'Course start date',
    example: '2024-02-01',
  })
  courseStartDate: string;

  @ApiProperty({
    description: 'Course end date',
    example: '2024-04-30',
  })
  courseEndDate: string;

  @ApiProperty({
    description: 'Whether the course is approved by admin',
    example: true,
  })
  isApproved: boolean;

  @ApiProperty({
    description: 'Date when the course was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the course was last modified',
    example: '2024-01-01T00:00:00.000Z',
  })
  modifiedAt: Date;

  /**
   * Constructor to create a Course entity from database records.
   * @param data - Raw data from database
   */
  constructor(data: any) {
    this.id = data.id?.toString();
    this.instructorId = data.instructorId?.toString();
    this.approvedByAdminId = data.approvedByAdminId?.toString();
    this.courseCode = data.courseCode;
    this.courseName = data.courseName;
    this.courseDescription = data.courseDescription;
    this.courseImage = data.courseImage;
    this.courseDuration = data.courseDuration;
    this.coursePrice = data.coursePrice;
    this.courseDiscount = data.courseDiscount;
    this.courseStartDate = data.courseStartDate;
    this.courseEndDate = data.courseEndDate;
    this.isApproved = data.isApproved;
    this.createdAt = data.createdAt;
    this.modifiedAt = data.modifiedAt;
  }
}

/**
 * Instructor Course relationship entity.
 */
export class InstructorCourse {
  @ApiProperty({
    description: 'Unique identifier for the instructor-course relationship',
    example: '123',
  })
  id: string;

  @ApiProperty({
    description: 'Instructor ID',
    example: '456',
  })
  instructorId: string;

  @ApiProperty({
    description: 'Course ID',
    example: '789',
  })
  courseId: string;

  @ApiProperty({
    description: 'Date when the relationship was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the relationship was last modified',
    example: '2024-01-01T00:00:00.000Z',
  })
  modifiedAt: Date;

  /**
   * Constructor to create an InstructorCourse entity from database records.
   * @param data - Raw data from database
   */
  constructor(data: any) {
    this.id = data.id?.toString();
    this.instructorId = data.instructorId?.toString();
    this.courseId = data.courseId?.toString();
    this.createdAt = data.createdAt;
    this.modifiedAt = data.modifiedAt;
  }
}
