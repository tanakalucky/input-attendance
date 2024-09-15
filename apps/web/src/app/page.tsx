'use client';

import Image from 'next/image';
import { Button } from '@repo/ui/components/ui/button';
import { useQuery } from 'urql';
import { graphql } from '../gql';
import { signIn } from 'next-auth/react';

function Gradient({ conic, className, small }: { small?: boolean; conic?: boolean; className?: string }): JSX.Element {
  return (
    <span
      className={`absolute mix-blend-normal will-change-[filter] rounded-[100%] ${
        small ? 'blur-[32px]' : 'blur-[75px]'
      } ${conic ? 'bg-glow-conic' : ''} ${className}`}
    />
  );
}

const LINKS = [
  {
    title: 'Docs',
    href: 'https://turbo.build/repo/docs',
    description: 'Find in-depth information about Turborepo features and API.',
  },
  {
    title: 'Learn',
    href: 'https://turbo.build/repo/docs/handbook',
    description: 'Learn more about monorepos with our handbook.',
  },
  {
    title: 'Templates',
    href: 'https://turbo.build/repo/docs/getting-started/from-example',
    description: 'Choose from over 15 examples and deploy with a single click.',
  },
  {
    title: 'Deploy',
    href: 'https://vercel.com/new',
    description: 'Instantly deploy your Turborepo to a shareable URL with Vercel.',
  },
];

const testQueryDocument = graphql(`
  query testQuery {
    test1 {
      statusCode
      body
    }

    getData {
      id
      title
    }
  }
`);

export default function Page(): JSX.Element {
  const [result, executeQuery] = useQuery({
    query: testQueryDocument,
    pause: true,
  });

  console.log('test graphql ', result);

  return (
    <main className='flex flex-col items-center justify-between min-h-screen p-24'>
      <Button>テスト</Button>
    </main>
  );
}
