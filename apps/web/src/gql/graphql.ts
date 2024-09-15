/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type GetDataResponse = {
  __typename?: 'GetDataResponse';
  id: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  getData?: Maybe<Array<Maybe<GetDataResponse>>>;
  test1?: Maybe<Response>;
  test2?: Maybe<Response>;
};

export type Response = {
  __typename?: 'Response';
  body: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
};

export type TestQueryQueryVariables = Exact<{ [key: string]: never }>;

export type TestQueryQuery = {
  __typename?: 'Query';
  test1?: { __typename?: 'Response'; statusCode: number; body: string } | null;
  getData?: Array<{ __typename?: 'GetDataResponse'; id: string; title: string } | null> | null;
};

export const TestQueryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'testQuery' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'test1' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'statusCode' } },
                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getData' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TestQueryQuery, TestQueryQueryVariables>;
