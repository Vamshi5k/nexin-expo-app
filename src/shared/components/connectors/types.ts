export type ConnectorGlyphProps = {
  color: string;
  holeColor: string;
  size?: number;
};

export const CONNECTOR_TYPES = [
  'CCS1',
  'CCS2',
  'CHAdeMO',
  'Type 1',
  'Type 2',
  'Bharat AC-01',
  'Bharat DC-01',
  'GBT',
] as const;
export type ConnectorType = (typeof CONNECTOR_TYPES)[number];

export function toConnectorType(raw: string | null | undefined): ConnectorType | null {
  if (!raw) return null;
  const key = raw.toLowerCase().replace(/[\s_/-]/g, '');
  const aliases: Record<string, ConnectorType> = {
    ccs1: 'CCS1',
    ccs2: 'CCS2',
    chademo: 'CHAdeMO',
    type1: 'Type 1',
    type2: 'Type 2',
    bharatac01: 'Bharat AC-01',
    bharatac: 'Bharat AC-01',
    bharatdc01: 'Bharat DC-01',
    bharatdc: 'Bharat DC-01',
    gbt: 'GBT',
  };
  return aliases[key] ?? null;
}
