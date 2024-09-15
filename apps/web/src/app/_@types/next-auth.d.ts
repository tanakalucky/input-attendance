import { DefaultSession } from 'next-auth';

interface UserWithId extends DefaultSession['user'] {
  id?: string;
}

declare module 'next-auth' {
  interface Session {
    user: UserWithId;
    accessToken?: string;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    user: UserWithId;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
