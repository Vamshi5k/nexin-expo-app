import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { LIST_ICON_BOX, type AppListRowProps } from './AppListRow';
import AppText from './AppText';

export type AppListGroupProps = {
  title?: string;
  footer?: string;
  children: ReactNode;
};

export default function AppListGroup({ title, footer, children }: AppListGroupProps) {
  const t = useTheme();
  const rows = Children.toArray(children).filter(isValidElement);
  const hasIcons = rows.some(r => (r.props as Partial<AppListRowProps>).icon != null);
  const inset = t.space[4] + (hasIcons ? LIST_ICON_BOX + t.space[3] : 0);

  return (
    <View style={{ gap: t.space[2] }}>
      {title ? (
        <AppText
          variant="subhead"
          tone="secondary"
          accessibilityRole="header"
          style={{ paddingHorizontal: t.space[1] }}
        >
          {title}
        </AppText>
      ) : null}
      <View
        style={{
          backgroundColor: t.colors.surface,
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          overflow: 'hidden',
        }}
      >
        {rows.map((row, i) => (
          <Fragment key={row.key ?? i}>
            {i > 0 ? (
              <View
                style={{
                  height: t.layout.hairline,
                  marginLeft: inset,
                  backgroundColor: t.colors.border,
                }}
              />
            ) : null}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? (
        <AppText variant="caption" tone="tertiary" style={{ paddingHorizontal: t.space[1] }}>
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}
