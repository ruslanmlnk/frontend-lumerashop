const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001';

export function getPayloadApiUrl(): string {
  return (process.env.NEXT_PUBLIC_PAYLOAD_API_URL || DEFAULT_PAYLOAD_API_URL).replace(/\/+$/, '');
}