import { toAddVehicleBody, toCapacity, toNamed } from '@/features/vehicles/api';

const model = { id: '12', name: 'Nexon EV' };
const details = { regNo: ' ka01ab1234 ', macId: '', maxAmount: '' };

describe('toAddVehicleBody (POST /vehicle)', () => {
  it('preset capacity -> capacityId; numeric ids go back as numbers; regNo upper-cased', () => {
    expect(
      toAddVehicleBody({
        model,
        capacity: { kind: 'preset', capacity: { id: '3', kwh: 40, rangeKm: 300 } },
        details,
      }),
    ).toEqual({ modelId: 12, regNo: 'KA01AB1234', capacityId: 3 });
  });

  it('custom capacity -> capacity; optional fields only when filled', () => {
    expect(
      toAddVehicleBody({
        model,
        capacity: { kind: 'custom', kwh: 55 },
        details: { regNo: 'KA01AB1234', macId: 'aa:bb:cc:dd:ee:ff', maxAmount: '500' },
      }),
    ).toEqual({
      modelId: 12,
      regNo: 'KA01AB1234',
      capacity: 55,
      vinNumber: 'AA:BB:CC:DD:EE:FF',
      maxAmount: 500,
    });
  });
});

describe('mappers', () => {
  it('toCapacity reads capacity or value, drops rows without a number', () => {
    expect(toCapacity({ id: 1, capacity: '30.2', range: 312 })).toEqual({
      id: '1',
      kwh: 30.2,
      rangeKm: 312,
    });
    expect(toCapacity({ id: 2, value: 40 })).toEqual({ id: '2', kwh: 40, rangeKm: null });
    expect(toCapacity({ id: 3 })).toBeNull();
  });

  it('toNamed trims names', () => {
    expect(toNamed({ id: 7, name: ' Tata ' })).toEqual({ id: '7', name: 'Tata' });
  });
});
