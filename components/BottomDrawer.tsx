import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';

export type BottomDrawerProps = {
  visible: boolean;
  onClose: () => void;
  /** Height in pixels or fraction (0..1) of screen height. Default 0.6 (60%). */
  height?: number | { fraction: number };
  /** Enable closing the drawer by tapping the backdrop (default: true) */
  backdropClosable?: boolean;
  /** Drawer content */
  children?: React.ReactNode;
};

const SCREEN_H = Dimensions.get('window').height;

export default function BottomDrawer({
  visible,
  onClose,
  height,
  backdropClosable = true,
  children,
}: BottomDrawerProps) {
  const resolvedHeight = useMemo(() => {
    if (typeof height === 'number') return Math.min(Math.max(height, 120), SCREEN_H * 0.95);
    if (height && typeof height === 'object' && typeof height.fraction === 'number') {
      return Math.min(Math.max(height.fraction, 0.2), 0.95) * SCREEN_H;
    }
    return SCREEN_H * 0.6;
  }, [height]);

  const translateY = useRef(new Animated.Value(resolvedHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: resolvedHeight,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, resolvedHeight, translateY, backdropOpacity]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.full}
        pointerEvents={visible ? 'auto' : 'none'}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={backdropClosable ? onClose : undefined}
        >
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            { height: resolvedHeight, transform: [{ translateY }] },
          ]}
        >
          {/* drag handle */}
          <View style={styles.handleBar} />
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  handleBar: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    marginTop: 10,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
});
