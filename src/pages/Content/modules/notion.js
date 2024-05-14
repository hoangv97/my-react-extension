import secrets from 'secrets';
import { fetchApiWithRetry } from './api';

const notionApi = `${secrets.CORS_PROXY}https://api.notion.com/v1`;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${secrets.NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
};

export const queryDatabase = async (
  database_id,
  filter = undefined,
  sorts = undefined,
  start_cursor = undefined,
  page_size = 100
) => {
  const result = await fetchApiWithRetry(
    `${notionApi}/databases/${database_id}/query`,
    {
      headers,
      method: 'POST',
      body: JSON.stringify({
        filter,
        sorts,
        start_cursor,
        page_size,
      }),
    }
  );
  return result;
};

export const createPage = async (
  parent,
  properties,
  children,
  icon = undefined,
  cover = undefined
) => {
  const result = await fetchApiWithRetry(`${notionApi}/pages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent,
      properties,
      children,
      icon,
      cover,
    }),
  });
  return result;
};

export const appendBlockChildren = async (block_id, children) => {
  // save children in chunks of 50
  const chunkSize = 50;
  const chunks = [];
  for (let i = 0; i < children.length; i += chunkSize) {
    chunks.push(children.slice(i, i + chunkSize));
  }
  // append each chunk
  for (const chunk of chunks) {
    await fetchApiWithRetry(`${notionApi}/blocks/${block_id}/children`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        children: chunk,
      }),
    });
  }
};

export const updatePage = async (
  page_id,
  properties,
  in_trash = undefined,
  icon = undefined,
  cover = undefined
) => {
  const result = await fetchApiWithRetry(`${notionApi}/pages/${page_id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      properties,
      in_trash,
      icon,
      cover,
    }),
  });
  return result;
};

export const getBlockChildren = async (block_id) => {
  const { results } = await fetchApiWithRetry(
    `${notionApi}/blocks/${block_id}/children`,
    {
      headers,
    }
  );
  return results;
};
