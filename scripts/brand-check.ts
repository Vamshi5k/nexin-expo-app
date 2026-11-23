/**
 * Validates the brand/ folder: schema, placeholders, assets and env.
 * Usage: npm run brand:check
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import brandConfig from '../brand/brand.config';
import { APP_ENVS, resolveEnv } from '../brand/env';
import { AA_NORMAL_TEXT, contrastRatio } from '../brand/lib/contrast';
import { BrandSchema, findPlaceholders, lightSurfaces, PLACEHOLDER } from '../brand/schema';
import { z } from 'zod';

import { readPngInfo } from './lib/png';

const ROOT = join(__dirname, '..');
const BRAND_DIR = join(ROOT, 'brand');

type SizeRule = (
  { kind: 'exact'; width: number; height: number } | { kind: 'minWidth'; width: number }
) & {
  /** App Store rejects icons with an alpha channel or transparency. */
  opaque?: boolean;
};

const ASSETS: Record<string, SizeRule> = {
  'icon.png': { kind: 'exact', width: 1024, height: 1024, opaque: true },
  'adaptive-icon.png': { kind: 'exact', width: 1024, height: 1024 },
  'notification-icon.png': { kind: 'exact', width: 96, height: 96 },
  'splash.png': { kind: 'minWidth', width: 512 },
  'logo.png': { kind: 'minWidth', width: 512 },
};

const errors: string[] = [];
const warnings: string[] = [];
const info: string[] = [];

// 1. Schema
const parsed = BrandSchema.safeParse(brandConfig);
if (!parsed.success) {
  errors.push(`brand.config.ts does not match the schema:\n${z.prettifyError(parsed.error)}`);
} else {
  if (!parsed.data.easProjectId) {
    warnings.push('easProjectId is not set. Run `eas init` and add it to brand.config.ts.');
  }
  if (!parsed.data.owner) warnings.push('owner is not set.');
  if (parsed.data.minTopUp > Math.min(...parsed.data.quickTopUpAmounts)) {
    errors.push('quickTopUpAmounts contains an amount below minTopUp.');
  }
}

// 1b. Contrast (warnings). WCAG AA for normal text = 4.5:1.
if (parsed.success) {
  const { primary, textPrimary, accentText } = parsed.data.colors;
  const WHITE = '#FFFFFF';

  if (!brandConfig.colors.accentText) {
    info.push(`accentText not set; derived ${accentText} from primary ${primary}.`);
  }
  // accentText is the brand colour as text: it must pass on every light surface.
  for (const bg of lightSurfaces(parsed.data.colors)) {
    const ratio = contrastRatio(accentText, bg);
    if (ratio < AA_NORMAL_TEXT) {
      warnings.push(
        `Low contrast: accentText ${accentText} on ${bg} is ${ratio.toFixed(2)}:1, below ${AA_NORMAL_TEXT}:1.`,
      );
    }
  }
  // onAccent is white or dark text, whichever passes on the accent fill.
  const onWhite = contrastRatio(WHITE, primary);
  const onDark = contrastRatio(textPrimary, primary);
  if (Math.max(onWhite, onDark) < AA_NORMAL_TEXT) {
    warnings.push(
      `Low contrast: neither white (${onWhite.toFixed(2)}:1) nor textPrimary (${onDark.toFixed(2)}:1) ` +
        `reaches ${AA_NORMAL_TEXT}:1 on accent ${primary}.`,
    );
  }
}

// 2. Placeholders in config, env and map style
for (const p of findPlaceholders(brandConfig)) {
  errors.push(`brand.config.ts: "${p}" still contains ${PLACEHOLDER}`);
}
for (const appEnv of APP_ENVS) {
  for (const p of findPlaceholders(resolveEnv(appEnv))) {
    errors.push(`env.ts: ${appEnv}.${p} still contains ${PLACEHOLDER}`);
  }
}
for (const file of ['map-style.json', 'env.ts', 'brand.config.ts']) {
  const path = join(BRAND_DIR, file);
  if (!existsSync(path)) {
    errors.push(`Missing brand/${file}`);
  } else if (file.endsWith('.json')) {
    try {
      JSON.parse(readFileSync(path, 'utf8'));
    } catch {
      errors.push(`brand/${file} is not valid JSON`);
    }
  }
}

// 3. Assets
for (const [name, rule] of Object.entries(ASSETS)) {
  const path = join(BRAND_DIR, 'assets', name);
  if (!existsSync(path)) {
    errors.push(`Missing brand/assets/${name}`);
    continue;
  }
  const size = readPngInfo(readFileSync(path));
  if (!size) {
    errors.push(`brand/assets/${name} is not a PNG`);
    continue;
  }
  const actual = `${size.width}x${size.height}`;
  if (rule.kind === 'exact' && (size.width !== rule.width || size.height !== rule.height)) {
    errors.push(`brand/assets/${name} is ${actual}, expected ${rule.width}x${rule.height}`);
  }
  if (rule.kind === 'minWidth' && size.width < rule.width) {
    errors.push(`brand/assets/${name} is ${actual}, expected at least ${rule.width}px wide`);
  }
  if (rule.opaque && size.hasTransparency) {
    errors.push(
      `brand/assets/${name} has transparency (alpha channel or tRNS). Flatten it onto an opaque background.`,
    );
  }
}

for (const i of info) process.stdout.write(`info  ${i}\n`);
for (const w of warnings) process.stdout.write(`warn  ${w}\n`);
if (errors.length) {
  for (const e of errors) process.stderr.write(`error ${e}\n`);
  process.stderr.write(`\nbrand:check failed with ${errors.length} error(s).\n`);
  process.exit(1);
}
process.stdout.write(`brand:check passed for "${brandConfig.appName}".\n`);
