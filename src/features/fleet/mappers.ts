import type { FleetUser, FleetUserDto } from './types';

const str = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

export function toFleetUser(dto: FleetUserDto): FleetUser {
  return {
    id: String(dto.id),
    fleetId: dto.fleetId == null ? null : String(dto.fleetId),
    name: str(dto.name) ?? '',
    phone: str(dto.phone),
    email: str(dto.email),
    driverId: str(dto.drId),
  };
}
