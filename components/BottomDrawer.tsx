import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, Modal, PanResponder, Pressable, StyleSheet, View } from 'react-native';

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
const DRAG_THRESHOLD = 100; // pixels to drag before closing
const CLOSE_THRESHOLD = 0.3; // fraction of height to drag before closing

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
  const dragY = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);
  const backdropPressEnabled = useRef(true);

  // Combine the base translateY with the drag offset
  const combinedTranslateY = useRef(
    Animated.add(translateY, dragY)
  ).current;

  // Interpolate backdrop opacity based on drawer position
  const backdropOpacity = combinedTranslateY.interpolate({
    inputRange: [0, resolvedHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        backdropPressEnabled.current = false;
        // Reset drag offset to start fresh
        dragY.setOffset(0);
        dragY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down (positive dy)
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        } else {
          // Allow slight resistance when dragging up, but don't move the drawer up
          dragY.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentDrag = gestureState.dy;
        isDragging.current = false;
        
        // Re-enable backdrop press after a short delay
        setTimeout(() => {
          backdropPressEnabled.current = true;
        }, 100);

        dragY.flattenOffset();

        const shouldClose = currentDrag > DRAG_THRESHOLD || currentDrag > resolvedHeight * CLOSE_THRESHOLD;

        if (shouldClose) {
          // Close the drawer
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: resolvedHeight,
              duration: 220,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(dragY, {
              toValue: 0,
              duration: 220,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start(() => {
            dragY.setValue(0);
            onClose();
          });
        } else {
          // Snap back to open position
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        backdropPressEnabled.current = true;
        dragY.flattenOffset();
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      dragY.setValue(0);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      dragY.setValue(0);
      Animated.timing(translateY, {
        toValue: resolvedHeight,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, resolvedHeight, translateY, dragY]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.full}
        pointerEvents={visible ? 'auto' : 'none'}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (backdropClosable && backdropPressEnabled.current && !isDragging.current) {
              onClose();
            }
          }}
        >
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>



        <Animated.View
          style={[
            styles.sheet,
            { height: resolvedHeight, transform: [{ translateY: combinedTranslateY }] },
          ]}
          {...panResponder.panHandlers}
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
