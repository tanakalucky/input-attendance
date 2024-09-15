declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_GRAPHQL_URL: string;
    COGNITO_CLIENT_ID: string;
    COGNITO_CLIENT_SECRET: string;
    COGNITO_ISSUER: string;
  }
}
