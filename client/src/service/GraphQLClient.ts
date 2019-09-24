import { Logger } from '../utils/Logger';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from "apollo-client";
import {APOLLO_URI} from '../config/constants'

const logger = new Logger('GraphQLClient');

const httpLink = createHttpLink({  
  uri: APOLLO_URI,
});

export const apolloClient = new ApolloClient({ // (token:string) =>
  link : httpLink,
  cache: new InMemoryCache({
    dataIdFromObject: e => e.id
  }),
  resolvers: {},
});

