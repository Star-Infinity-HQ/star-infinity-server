import { Arcjet } from "arcjet";
import { protect } from "arcjet/express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { logger } from "./logger.js";

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error("Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Arcjet
const arcjet = new Arcjet({
  key: process.env.ARCJET_KEY,
  site: "star-infinity",
});

// Middleware to protect routes with Arcjet
export const arcjetProtect = protect(arcjet, {
  rules: ["shield", "bot", "ratelimit"],
});

// Authentication middleware using Supabase
export const authRequired = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "Authentication token missing" });
  }
  
  try {
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data) {
      logger.error("Authentication error:", error);
      return res.status(401).json({ error: "Invalid authentication token" });
    }
    
    // Add the user to the request object
    req.user = data.user;
    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
};

// Function to verify token validity
export const verifyToken = async (token) => {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data) {
      return { valid: false, error };
    }
    
    return { valid: true, user: data.user };
  } catch (error) {
    logger.error("Token verification error:", error);
    return { valid: false, error };
  }
};

// Get current user from token
export const getCurrentUser = async (token) => {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data) {
      return null;
    }
    
    return data.user;
  } catch (error) {
    logger.error("Get current user error:", error);
    return null;
  }
};

// Refresh token function
export const refreshToken = async (refreshToken) => {
  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    
    if (error || !data) {
      return { success: false, error };
    }
    
    return { 
      success: true, 
      session: data.session,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  } catch (error) {
    logger.error("Token refresh error:", error);
    return { success: false, error };
  }
};
