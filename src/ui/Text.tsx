import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme, type Palette, type TypeVariant } from '@/theme';

export type TextTone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'onAccent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'onDanger';

const TONE: Record<TextTone, keyof Palette> = {
  primary: 'textPrimary',
  secondary: 'textSecondary',
  tertiary: 'textTertiary',
  accent: 'accentText',
  onAccent: 'onAccent',
  success: 'successText',
  warning: 'warningText',
  danger: 'dangerText',
  onDanger: 'onDanger',
};

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  tone?: TextTone;
  tabular?: boolean;
  align?: TextStyle['textAlign'];
};

export function Text({
  variant = 'body',
  tone = 'primary',
  tabular,
  align,
  style,
  maxFontSizeMultiplier,
  ...rest
}: TextProps) {
  const t = useTheme();
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? t.layout.maxFontScale}
      style={[
        t.type[variant],
        { color: t.colors[TONE[tone]] as string, textAlign: align },
        tabular && t.tabularNums,
        style,
      ]}
      {...rest}
    />
  );
}
