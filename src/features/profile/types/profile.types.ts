export type ProfileStatsDto = {
  totalVehicles?: number | string | null;
  totalChargingSessions?: number | string | null;
  totalFavourites?: number | string | null;
};

// GET /profile: the old app read only `data.stats`; name and contact come from the auth user.
export type ProfileDto = {
  stats?: ProfileStatsDto | null;
};

export type ProfileStats = {
  vehicles: number | null;
  sessions: number | null;
  favourites: number | null;
};

// PUT /profile: only the fields that changed.
export type ProfileChangesDto = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  gst?: string;
};

export type EditProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gst: string;
};

export type ContactKind = 'email' | 'phone';

export type FieldErrors = Partial<Record<keyof EditProfileForm, string>>;

export type DeletionPath =
  | { kind: 'api' }
  | { kind: 'web'; url: string }
  | { kind: 'support'; url: string | null; email: string | null };
