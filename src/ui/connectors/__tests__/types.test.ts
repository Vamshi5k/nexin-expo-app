import { CONNECTOR_TYPES, toConnectorType } from '../types';

describe('toConnectorType', () => {
  it('maps every known type to itself', () => {
    for (const t of CONNECTOR_TYPES) expect(toConnectorType(t)).toBe(t);
  });
  it('tolerates backend spelling differences', () => {
    expect(toConnectorType('type2')).toBe('Type 2');
    expect(toConnectorType('CHADEMO')).toBe('CHAdeMO');
    expect(toConnectorType('Bharat DC')).toBe('Bharat DC-01');
    expect(toConnectorType('GB/T')).toBe('GBT');
  });
  it('returns null for unknown or empty', () => {
    expect(toConnectorType('NACS')).toBeNull();
    expect(toConnectorType(undefined)).toBeNull();
  });
});
