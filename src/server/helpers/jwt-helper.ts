
import * as jwt from 'jsonwebtoken';

const AUTH0_SECRET = process.env.AUTH0_SECRET;

export class JWTHelper {

  public static verifyToken(token): boolean {
    try {
      jwt.verify(token, AUTH0_SECRET, { algorithms: ['HS256'] });
      return true;
    } catch(e) {
      return false;
    }
  }

  private extractIdFromToken(token): any {
    return jwt.verify(token, AUTH0_SECRET, { algorithms: ['HS256'] });
  }
}
