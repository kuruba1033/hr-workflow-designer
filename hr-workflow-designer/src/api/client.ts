// src/api/client.ts — thin wrapper; swap for real fetch later
const BASE_DELAY = 400; // simulates network latency

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockGet<T>(data: T): Promise<T> {
  await delay(BASE_DELAY);
  return structuredClone(data);  // prevent mutation of mock data
}

export async function mockPost<TBody, TResult>(
  handler: (body: TBody) => TResult
): Promise<(body: TBody) => Promise<TResult>> {
  return async (body: TBody) => {
    await delay(BASE_DELAY + Math.random() * 300);
    return handler(body);
  };
}