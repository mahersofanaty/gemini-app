import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.ts';
import { adminUsers } from '../db/schema.ts';
import { eq, and, gt } from 'drizzle-orm';
import { adminAuth } from './firebase-admin.ts';

export interface AuthenticatedAdminRequest extends Request {
  admin?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Middleware: Requires an active, authenticated administrator session.
 * Accepts:
 * 1. Bearer sessionToken in Authorization header (or x-admin-session header)
 * 2. Firebase ID token in Authorization: Bearer <idToken>
 */
export async function requireAdminAuth(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const sessionHeader = req.headers['x-admin-session'] as string | undefined;

  let token = sessionHeader;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1].trim();
  }

  if (!token) {
    return res.status(401).json({
      error: 'Nicht autorisiert',
      message: 'Keine gültige Administratorsitzung gefunden.',
    });
  }

  try {
    // 1. Check if token is a direct sessionToken in admin_users table
    const now = new Date();
    const sessionAdmins = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        isActive: adminUsers.isActive,
        sessionExpiresAt: adminUsers.sessionExpiresAt,
      })
      .from(adminUsers)
      .where(
        and(
          eq(adminUsers.sessionToken, token),
          eq(adminUsers.isActive, true),
          gt(adminUsers.sessionExpiresAt, now)
        )
      )
      .limit(1);

    if (sessionAdmins.length > 0) {
      const admin = sessionAdmins[0];
      req.admin = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      };
      return next();
    }

    // 2. Fallback: Check if token is a Firebase ID token
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      if (decoded && decoded.email) {
        // Look up or auto-match admin user by email
        const matched = await db
          .select({
            id: adminUsers.id,
            email: adminUsers.email,
            name: adminUsers.name,
            role: adminUsers.role,
            isActive: adminUsers.isActive,
          })
          .from(adminUsers)
          .where(and(eq(adminUsers.email, decoded.email), eq(adminUsers.isActive, true)))
          .limit(1);

        if (matched.length > 0) {
          req.admin = matched[0];
          return next();
        }
      }
    } catch {
      // Not a firebase token or invalid
    }

    return res.status(401).json({
      error: 'Ungültige Sitzung',
      message: 'Die Administratorsitzung ist ungültig oder abgelaufen.',
    });
  } catch (error) {
    console.error('[AuthMiddleware] Error verifying session:', error);
    return res.status(500).json({ error: 'Serverfehler bei der Authentifizierung' });
  }
}
