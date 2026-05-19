import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface PawTrailProps {
  // Number of paw prints to render
  count?: number;
  // Color tint applied via opacity over the emoji
  color?: string;
  // Overall height of the band
  height?: number;
}

// Decorative band of paw prints — used as a subtle backdrop on auth
// and home screens. Uses the 🐾 emoji rotated/scaled to look like a trail.
const PawTrail: React.FC<PawTrailProps> = ({ count = 6, height = 60 }) => {
  const items = Array.from({ length: count });
  return (
    <View style={[styles.row, { height }]} pointerEvents="none">
      {items.map((_, i) => {
        const rotate = (i % 2 === 0 ? -1 : 1) * (15 + (i * 7) % 25);
        const offsetTop = (i % 2 === 0 ? 0 : height * 0.35);
        const size = 22 + (i % 3) * 4;
        return (
          <Text
            key={i}
            style={[
              styles.paw,
              {
                fontSize: size,
                marginTop: offsetTop,
                transform: [{ rotate: `${rotate}deg` }],
              },
            ]}
          >
            🐾
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
    opacity: 0.18,
  },
  paw: {
    color: '#EC4899',
  },
});

export default PawTrail;
