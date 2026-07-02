import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Users } from "./db.ts";

const JWT_SECRET = process.env.JWT_SECRET || "college_timetable_secret_key";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    branch?: string;
    section?: string;
    semester?: string;
    status: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = Users.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({ message: "Your account is deactivated. Please contact the administrator." });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      branch: user.branch,
      section: user.section,
      semester: user.semester,
      status: user.status,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function roleMiddleware(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    next();
  };
}
