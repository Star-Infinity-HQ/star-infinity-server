import { Arcjet } from "arcjet";
import { protect } from "arcjet/express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { logger } from "./logger.js";

dotenv.config();

const supabaseUrl = process.env.PROD_SUPABASE_URL;
const supabaseKey = process.env.PROD_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error("Missing Supabase credentials, make sure to set PROD_SUPABASE_URL and PROD_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

const arcjet = new Arcjet({
  key: process.env.ARCJET_PROJECT_KEY,
  site: "star-infinity",
});

export const arcjetProtect = protect(arcjet, {
  rules: ["shield", "bot", "ratelimit"],
});

/**
 * Authentication middleware to protect specific routes from unwanted access.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
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
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data) {
      logger.error("Authentication error:", error);
      return res.status(401).json({ error: "Invalid authentication token" });
    }
    req.user = data.user;
    next();

  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
};

/**
 * Token verification process to handle token validation.
 * 
 * @param {*} token 
 * @returns 
 */
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

/**
 * Get the current user based on the provided token and signature.
 * 
 * @param {*} token 
 * @returns 
 */
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

/**
 * Refresh current token after its expiration, refresh time is subject to change.
 * 
 * @param {*} refreshToken 
 * @returns 
 */
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
