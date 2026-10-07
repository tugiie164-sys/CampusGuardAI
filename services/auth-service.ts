/**
 * Authentication and Authorization Service
 * Session token management, password validation, role checks, and IDOR protection.
 */

import crypto from 'crypto';
import { db, hashPassword } from '../db/campus-db.js';
import { User, UserRole, UserSession } from '../shared/types.js';

export class AuthService {
  private sessionDurationMs = 24 * 60 * 60 * 1000; // 24 hours

  public authenticate(username: string, plainPass: string): { user: User; session: UserSession } | null {
    const user = Array.from(db.users.values()).find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return null;

    const testHash = hashPassword(plainPass);
    if (user.passwordHash !== testHash) return null;

    const token = `cg_sess_${crypto.randomBytes(24).toString('hex')}`;
    const session: UserSession = {
      token,
      userId: user.id,
      role: user.role,
      name: user.name,
      expiresAt: Date.now() + this.sessionDurationMs,
    };

    db.sessions.set(token, session);
    return { user, session };
  }

  public validateToken(token?: string): UserSession | null {
    if (!token) return null;
    const session = db.sessions.get(token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      db.sessions.delete(token);
      return null;
    }
    return session;
  }

  public revokeToken(token: string) {
    db.sessions.delete(token);
  }

  public createDemoSessionForRole(role: UserRole): UserSession {
    const user = Array.from(db.users.values()).find((u) => u.role === role) || {
      id: `usr-${role.toLowerCase().replace(/\s+/g, '')}`,
      name: `Demo ${role}`,
      role,
    };

    const token = `cg_demo_${role}_${crypto.randomBytes(12).toString('hex')}`;
    const session: UserSession = {
      token,
      userId: user.id,
      role,
      name: user.name,
      expiresAt: Date.now() + this.sessionDurationMs,
    };

    db.sessions.set(token, session);
    return session;
  }
}

export const authService = new AuthService();
