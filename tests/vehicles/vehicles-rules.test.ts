import { ENDPOINTS } from '@/core/endpoints';
import { toVehicle } from '@/features/vehicles/api/vehicles.api';
import type { Vehicle } from '@/features/vehicles/types/vehicles.types';
import {
  canAutoCharge,
  editDraft,
  sameCapacity,
  sameDetails,
  sortVehicles,
  vehicleTitle,
  withPrimary,
} from '@/features/vehicles/utils/vehicles';

const vehicle = (id: string, overrides: Partial<Vehicle> = {}): Vehicle => ({
  id,
  regNo: `KA01AB${id}`,
  macId: null,
  maxAmountRupees: null,
  autoCharge: false,
  isPrimary: false,
  capacityId: null,
  capacityKwh: null,
  rangeKm: null,
  modelId: '12',
  modelName: 'Nexon EV',
  brandId: '1',
  brandName: 'Tata',
  ...overrides,
});

describe('toVehicle', () => {
  it('reads capacity as a number or as { capacity }, and the brand from the model', () => {
    const a = toVehicle({
      id: 7,
      regNo: ' ka01ab1234 ',
      vinNumber: 'AA:BB:CC:DD:EE:FF',
      maxAmount: '500',
      autoCharge: true,
      isPrimary: true,
      capacityId: 3,
      capacity: { capacity: '40.5' },
      range: 312,
      modelId: 12,
      model: { id: 12, name: 'Nexon EV', brand: { id: 1, name: 'Tata' } },
    });
    expect(a).toEqual({
      id: '7',
      regNo: 'KA01AB1234',
      macId: 'AA:BB:CC:DD:EE:FF',
      maxAmountRupees: 500,
      autoCharge: true,
      isPrimary: true,
      capacityId: '3',
      capacityKwh: 40.5,
      rangeKm: 312,
      modelId: '12',
      modelName: 'Nexon EV',
      brandId: '1',
      brandName: 'Tata',
    });
    expect(toVehicle({ id: 8, capacity: 30 }).capacityKwh).toBe(30);
  });

  it('fills gaps with empty values, never "undefined"', () => {
    const v = toVehicle({ id: 9 });
    expect(v).toMatchObject({
      regNo: '',
      macId: null,
      capacityKwh: null,
      brandName: '',
      modelName: '',
    });
    expect(vehicleTitle(v, 'Vehicle')).toBe('Vehicle');
  });

  it('vehicle endpoints', () => {
    expect(ENDPOINTS.VEHICLES.LIST).toBe('/vehicle');
    expect(ENDPOINTS.VEHICLES.ITEM('7')).toBe('/vehicle/7');
    expect(ENDPOINTS.VEHICLES.PRIMARY('7')).toBe('/vehicle/primary/7');
  });
});

describe('vehicle rules', () => {
  it('lists the primary first, then newest first', () => {
    const sorted = sortVehicles([vehicle('1'), vehicle('3'), vehicle('2', { isPrimary: true })]);
    expect(sorted.map(v => v.id)).toEqual(['2', '3', '1']);
  });

  it('making one primary clears every other', () => {
    const next = withPrimary([vehicle('1', { isPrimary: true }), vehicle('2')], '2');
    expect(next.map(v => [v.id, v.isPrimary])).toEqual([
      ['1', false],
      ['2', true],
    ]);
  });

  it('auto-charge needs a MAC ID', () => {
    expect(canAutoCharge(vehicle('1'))).toBe(false);
    expect(canAutoCharge(vehicle('1', { macId: 'AA:BB:CC:DD:EE:FF' }))).toBe(true);
  });

  it('editDraft keeps a preset battery when its id is known, else the stored kWh', () => {
    expect(editDraft(vehicle('1', { capacityId: '3', capacityKwh: 40.5 })).capacity).toEqual({
      kind: 'preset',
      capacity: { id: '3', kwh: 40.5, rangeKm: null },
    });
    expect(editDraft(vehicle('1', { capacityKwh: 55 })).capacity).toEqual({
      kind: 'custom',
      kwh: 55,
    });
    expect(editDraft(vehicle('1')).capacity).toBeNull();
    expect(editDraft(vehicle('1', { maxAmountRupees: 500 })).details).toEqual({
      regNo: 'KA01AB1',
      macId: '',
      maxAmount: '500',
    });
  });

  it('change detection ignores case and spaces', () => {
    const a = { regNo: 'ka01ab1', macId: '', maxAmount: '500' };
    expect(sameDetails(a, { regNo: ' KA01AB1 ', macId: '', maxAmount: '500' })).toBe(true);
    expect(sameDetails(a, { ...a, maxAmount: '600' })).toBe(false);
    expect(sameCapacity({ kind: 'custom', kwh: 40 }, { kind: 'custom', kwh: 40 })).toBe(true);
    expect(
      sameCapacity(
        { kind: 'preset', capacity: { id: '3', kwh: 40, rangeKm: null } },
        { kind: 'custom', kwh: 40 },
      ),
    ).toBe(false);
  });
});
