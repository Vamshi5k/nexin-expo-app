import { View } from 'react-native';

import { ChevronRight } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import type { VehicleWizard } from '../hooks/useVehicleWizard';

type VehicleTrailProps = {
  wizard: VehicleWizard;
};

// Picks from earlier steps; tapping one goes back to that step.
const VehicleTrail = ({ wizard }: VehicleTrailProps) => {
  const t = useTheme();
  if (wizard.trail.length === 0) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.space[1] }}>
      {wizard.trail.map((item, i) => (
        <View
          key={item.index}
          style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[1] }}
        >
          {i > 0 ? <ChevronRight color={t.colors.textTertiary} size={14} strokeWidth={2} /> : null}
          <AppPressable
            onPress={() => wizard.goTo(item.index)}
            haptic="selection"
            feedback="opacity"
            accessibilityRole="button"
            accessibilityLabel={`Change ${item.label}`}
            style={{
              paddingHorizontal: t.space[3],
              height: 32,
              justifyContent: 'center',
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.accentSoft,
            }}
          >
            <AppText variant="subhead" tone="accent" numberOfLines={1}>
              {item.label}
            </AppText>
          </AppPressable>
        </View>
      ))}
    </View>
  );
};

export default VehicleTrail;
