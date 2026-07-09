// src/middleware/compose.ts
type Handler = (req: any, ...args: any[]) => Promise<Response>;
type Wrapper = (h: Handler, ...opts: any[]) => Handler;

export const compose = (...wrappers: Handler[]): Handler => {
  return wrappers.reduce((acc, wrapper) => wrapper(acc) as any);
};
