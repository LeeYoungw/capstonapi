import 'express';

declare global {
  namespace Express {
    interface User {
      uid: string;
      email?: string;
      [key: string]: any;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
