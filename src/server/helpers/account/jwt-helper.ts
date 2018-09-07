
import * as jwt from 'jsonwebtoken';
import * as jwks from 'jwks-rsa';

const AUTH0_SECRET = process.env.AUTH0_SECRET;
const IS_PROD = process.env.NODE_ENV === 'production';
const DEV_ACCESS_TOKEN = 'DEV_ACCESS_TOKEN';
const DEV_ID_TOKEN = 'DEV_ID_TOKEN';

const client = jwks({
  jwksUri: process.env.AUTH0_JWKS_URI
});

export class JWTHelper {

  public static verifyToken(token): boolean {

    if(!IS_PROD && token === DEV_ACCESS_TOKEN) return true;

    try {
      jwt.verify(token, AUTH0_SECRET, { algorithms: ['HS256'] });
      return true;
    } catch(e) {
      return false;
    }
  }

  public static async verifyRS256Token(token): Promise<any> {
    return new Promise((resolve, reject) => {
      client.getSigningKeys((e, keys) => {
        if(e) return reject(false);

        const key = keys[0];
        const rsakey = key.publicKey || key.rsaPublicKey;
        const isValid = jwt.verify(token, rsakey, { algorithms: ['RS256'] });

        if(!isValid) return reject(false);

        resolve(true);
      });
    });
  }

  public static extractEmailAndVerifiedStatusFromToken(token): any {

    if(!IS_PROD && token === DEV_ID_TOKEN) {
      return {
        email: 'test@dev.local',
        emailVerified: true
      };
    }

    const decodedToken = jwt.decode(token);

    return {
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
  }
}
