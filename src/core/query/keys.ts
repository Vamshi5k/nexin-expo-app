/** Single query-key factory so invalidation is consistent across features. */
export const queryKeys = {
  clientConfig: () => ['client-config'] as const,
  me: () => ['me'] as const,
} as const;
