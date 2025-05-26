import { createClient } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: 'theam44blox',
  apiKey: process.env.MICROCMS_API_KEY,
});