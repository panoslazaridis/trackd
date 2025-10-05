import type { Express, Request, Response, NextFunction } from "express";
import { supabase, getSupabaseUser } from "./supabase";
import { storage } from "./storage";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  businessName: z.string().optional(),
  ownerName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getSupabaseUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, businessName, ownerName } = signupSchema.parse(req.body);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data.user) {
        return res.status(400).json({ error: "Failed to create user" });
      }

      const existingUser = await storage.getUser(data.user.id);
      if (!existingUser) {
        await storage.createUserFromSupabase(data.user.id, {
          email,
          businessName: businessName || null,
          ownerName: ownerName || null,
        });
      }

      res.json({
        user: data.user,
        session: data.session,
      });
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid signup data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to sign up" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ error: error.message });
      }

      res.json({
        user: data.user,
        session: data.session,
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid login data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    res.json({ 
      success: true,
      message: "Logout handled client-side. Clear local session and access token."
    });
  });

  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const supabaseUser = (req as any).user;
      const dbUser = await storage.getUser(supabaseUser.id);
      
      if (!dbUser) {
        return res.status(404).json({ error: "User not found in database" });
      }

      const { password, ...userWithoutPassword } = dbUser;
      res.json({
        supabaseUser,
        profile: userWithoutPassword,
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Failed to get current user" });
    }
  });
}
