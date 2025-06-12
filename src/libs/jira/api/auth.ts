import { guardEnvVars } from '../../guard-env-vars.js';

export function getAuthHeaders(): Record<string, string> {
  const ATLASSIAN_API_USERNAME = process.env.ATLASSIAN_API_USERNAME;
  const ATLASSIAN_API_TOKEN = process.env.ATLASSIAN_API_TOKEN;

  guardEnvVars(['ATLASSIAN_API_BASE_URL', 'ATLASSIAN_API_USERNAME', 'ATLASSIAN_API_TOKEN']);

  return {
    'Content-Type': 'application/json',
    Authorization: `Basic ${btoa(`${ATLASSIAN_API_USERNAME}:${ATLASSIAN_API_TOKEN}`)}`
  };
}
