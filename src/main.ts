import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Bootstrap function to start the Star Infinity API server.
 * Configures Swagger documentation, validation pipes, and global settings.
 */
async function bootstrap() {
  console.log('🚀 Starting bootstrap function...');

  try {
    console.log('📦 Creating NestJS application...');
    const app = await NestFactory.create(AppModule);
    console.log('✅ NestJS application created successfully');

    const logger = new Logger('Bootstrap');

  // Enable CORS for cross-origin requests
  app.enableCors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation configuration
  const config = new DocumentBuilder()
    .setTitle('Star Infinity API')
    .setDescription(`
      # Star Infinity API Documentation

      Welcome to the Star Infinity API! This is a comprehensive REST API for managing courses, instructors, and students.

      ## Features
      - 🔐 JWT-based authentication with role-based access control
      - 👥 User management (Admin, Instructor, Student roles)
      - 📚 Course management and approval system
      - 🏫 Instructor profile management
      - 📊 System logging and monitoring
      - 🔒 Secure password hashing with bcrypt
      - 🚦 Rate limiting and security middleware

      ## Authentication
      Most endpoints require authentication. Use the login endpoint to get your JWT token, then include it in the Authorization header as 'Bearer {token}'.

      ## API Versioning
      All endpoints are versioned and follow the pattern: \`/api/v1/{module}/{endpoint}\`
    `)
    .setVersion('1.0.0')
    .setContact(
      'Star Infinity Development Team',
      'https://github.com/Star-Infinity-HQ/star-infinity-server',
      'lofi.audit@gmail.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token (without Bearer prefix)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User profile and management endpoints')
    .addTag('Courses', 'Course management and enrollment endpoints')
    .addTag('Instructors', 'Instructor profile and course assignment endpoints')
    .addTag('Admin', 'Administrative functions and system management')
    .addServer(process.env.API_URL || 'http://localhost:3001', 'Development server')
    .addServer('https://api.star-infinity.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Star Infinity API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  });

    // Start the server
    console.log('🌐 Starting server...');
    const port = process.env.NODE_PORT || 3001;
    await app.listen(port);

    logger.log(`🚀 Star Infinity API Server is running on: http://localhost:${port}`);
    logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api`);
    logger.log(`🔒 Authentication endpoints available at: http://localhost:${port}/api/v1/auth`);
  } catch (error) {
    console.error('❌ Error in bootstrap:', error);
    throw error;
  }
}

bootstrap().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});