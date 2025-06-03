import { ApiProperty } from '@nestjs/swagger';

/**
 * Instructor entity representing an instructor in the system.
 */
export class Instructor {
  @ApiProperty({
    description: 'Unique identifier for the instructor',
    example: '123',
  })
  id: string;

  @ApiProperty({
    description: 'Instructor username',
    example: 'john_instructor',
  })
  username: string;

  @ApiProperty({
    description: 'Instructor email address',
    example: 'john.instructor@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Instructor description/tagline',
    example: 'Experienced software engineer with 10+ years in web development',
    nullable: true,
  })
  instructorDescription?: string;

  @ApiProperty({
    description: 'Instructor biography',
    example: 'John has been teaching programming for over 5 years and has helped hundreds of students...',
    nullable: true,
  })
  instructorBio?: string;

  @ApiProperty({
    description: 'Instructor address',
    example: '123 Main St, City, State 12345',
    nullable: true,
  })
  instructorAddress?: string;

  @ApiProperty({
    description: 'Instructor timezone',
    example: 'America/New_York',
    nullable: true,
  })
  instructorTimezone?: string;

  @ApiProperty({
    description: 'Number of courses created by the instructor',
    example: 5,
  })
  courseCount?: number;

  @ApiProperty({
    description: 'Date when the instructor was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the instructor was last modified',
    example: '2024-01-01T00:00:00.000Z',
  })
  modifiedAt: Date;

  /**
   * Constructor to create an Instructor entity from database records.
   * @param data - Raw data from database
   */
  constructor(data: any) {
    this.id = data.id?.toString();
    this.username = data.username;
    this.email = data.email;
    this.instructorDescription = data.instructorDescription;
    this.instructorBio = data.instructorBio;
    this.instructorAddress = data.instructorAddress;
    this.instructorTimezone = data.instructorTimezone;
    this.courseCount = data._count?.instructorCourses;
    this.createdAt = data.createdAt;
    this.modifiedAt = data.modifiedAt;
  }
}
