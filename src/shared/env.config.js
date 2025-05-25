import "dotenv/config";

export const envConfig = {
    port: parseInt(process.env.PORT || "3000"),
    nodeEnv: process.env.NODE_ENV || "development",
    jwtSecret: process.env.JWT_SECRET || "your-secret-key",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    corsOrigin: process.env.CORS_ORIGIN || "*",
    logLevel: process.env.LOG_LEVEL || "info",
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseKey: process.env.SUPABASE_KEY || "",
    uploadDir: process.env.UPLOAD_DIR || "uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"),
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,application/pdf").split(","),
    apiRateLimit: parseInt(process.env.API_RATE_LIMIT || "100"),
    apiRateLimitWindow: parseInt(process.env.API_RATE_LIMIT_WINDOW || "900000"),
    adminEmail: process.env.ADMIN_EMAIL || "admin@example.com"
}
