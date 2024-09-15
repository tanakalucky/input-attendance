'use client';

import { useSession } from 'next-auth/react';
import { ReactNode, useMemo } from 'react';
import { cacheExchange, createClient, fetchExchange, Provider } from 'urql';

export function GraphqlProvider({ children }: { children: ReactNode }) {
  const session = useSession();

  const client = useMemo(
    () =>
      createClient({
        url: process.env.NEXT_PUBLIC_GRAPHQL_URL,
        fetchOptions: () => {
          const token = session.data?.accessToken;
          return {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          };
        },
        exchanges: [cacheExchange, fetchExchange],
      }),
    [JSON.stringify(session)],
  );

  return <Provider value={client}>{children}</Provider>;
}
