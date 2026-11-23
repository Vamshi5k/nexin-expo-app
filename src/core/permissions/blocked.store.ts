import { create } from 'zustand';

import type { PermissionKind } from './permissions';

type BlockedState = {
  kind: PermissionKind | null;
  resolve: ((openedSettings: boolean) => void) | null;
  show: (kind: PermissionKind) => Promise<boolean>;
  close: (openedSettings: boolean) => void;
};

/**
 * One global dialog (mounted in the root layout) instead of the old per-screen registration,
 * which often showed nothing and left callers' promises pending.
 */
export const usePermissionBlocked = create<BlockedState>((set, get) => ({
  kind: null,
  resolve: null,
  show: (kind) =>
    new Promise<boolean>((resolve) => {
      get().resolve?.(false); // settle any previous caller
      set({ kind, resolve });
    }),
  close: (openedSettings) => {
    get().resolve?.(openedSettings);
    set({ kind: null, resolve: null });
  },
}));

/** Shows the "permission blocked" dialog; resolves true if the user went to Settings. */
export function showPermissionBlocked(kind: PermissionKind): Promise<boolean> {
  return usePermissionBlocked.getState().show(kind);
}
