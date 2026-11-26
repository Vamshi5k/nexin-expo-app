import { useState } from 'react';

// Photos that fail to load drop out of the slider instead of showing as grey boxes; when none
// are left the hero falls back to the brand illustration.
export const useHeroImages = (urls: string[]) => {
  const [failed, setFailed] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  const images = urls.filter(url => !failed.includes(url));

  const onError = (url: string) => {
    setFailed(current => (current.includes(url) ? current : [...current, url]));
  };

  return {
    images,
    page: Math.min(page, Math.max(images.length - 1, 0)),
    setPage,
    onError,
  };
};
