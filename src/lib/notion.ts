import { Client } from '@notionhq/client';
import secrets from 'secrets';

export const notion = new Client({
  auth: secrets.NOTION_API_KEY,
  baseUrl: 'https://api.notion.com',
});
