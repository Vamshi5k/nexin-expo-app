// With no cached config, boot waits this long for /client/info before using brand values.
export const CLIENT_CONFIG_BOOT_TIMEOUT_MS = 8_000;

// Bump when ClientConfig changes shape so old cached copies are ignored.
export const CLIENT_CONFIG_CACHE_VERSION = 1;
