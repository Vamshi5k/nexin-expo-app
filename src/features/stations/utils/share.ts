import type { StationDetails } from '../types/stations.types';

type ShareLinks = {
  appUrl: string;
  webDomain: string | null;
};

// The old app shared another brand's links; every URL here comes from this client's config.
export function shareMessage(station: StationDetails, { appUrl, webDomain }: ShareLinks): string {
  const navigate = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;

  const lines = [
    station.name,
    station.address,
    '',
    `Open in app: ${appUrl}`,
    webDomain ? `View online: https://${webDomain}/station/${station.id}` : null,
    `Navigate: ${navigate}`,
  ];

  return lines.filter(line => line !== null).join('\n');
}
