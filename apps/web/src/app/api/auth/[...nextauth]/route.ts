import NextAuth from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { JWT } from 'next-auth/jwt';

const cognitoClient = new CognitoIdentityProviderClient();

const refreshAccessToken = async (token: JWT) => {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN',
      ClientId: process.env.COGNITO_CLIENT_ID ?? '',
      AuthParameters: {
        REFRESH_TOKEN: token.refreshToken ?? '',
      },
    });
    const res = await cognitoClient.send(command);

    return {
      ...token,
      accessToken: res.AuthenticationResult?.AccessToken,
      accessTokenExpires: Date.now() + (res.AuthenticationResult?.ExpiresIn ?? 0) * 1000,
    };
  } catch (error) {
    console.log(error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      issuer: process.env.COGNITO_ISSUER,
      checks: 'nonce',
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token) {
        session.user = token.user;
        session.accessToken = token.accessToken;
        session.error = token.error;
      }

      return session;
    },
    jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + (account.expires_at ?? 0) * 1000,
          refreshToken: account.refresh_token,
          user,
        };
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },
  },
});

export { handler as GET, handler as POST };
