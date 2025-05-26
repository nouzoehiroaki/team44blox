import { createClient } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: 'theam44blox',
  apiKey: process.env.API_KEY,
});