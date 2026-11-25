import { create } from 'zustand';

import { DEFAULT_FILTERS } from '../constants/stations.constants';
import type { StationFilters } from '../types/stations.types';

type StationFiltersState = {
  filters: StationFilters;
  apply: (filters: StationFilters) => void;
  clear: () => void;
};

export const useStationFilters = create<StationFiltersState>(set => ({
  filters: DEFAULT_FILTERS,
  apply: filters => set({ filters }),
  clear: () => set({ filters: DEFAULT_FILTERS }),
}));
