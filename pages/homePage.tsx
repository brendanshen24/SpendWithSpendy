import React, { useEffect } from 'react';
import { SafeAreaView, View, Text, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  SharedValue,
} from 'react-native-reanimated';

const TAB_BAR_HEIGHT = 60;
const BALL_SIZE = 20;
const DAMPING = 0.75;
const AIR_FRICTION = 0.992;
const GROUND_FRICTION = 0.9;

export default function HomeScreen() {
  const money: number = 20.0;
  const ballCount = Math.floor(money);
  const { width, height } = useWindowDimensions();

  const screenW = useSharedValue(width);
  const screenH = useSharedValue(height);
  const headerH = useSharedValue(0);

  useEffect(() => {
    screenW.value = width;
    screenH.value = height;
  }, [width, height, screenW, screenH]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View
        className="w-full items-center pt-10 pb-6"
        onLayout={e => {
          headerH.value = e.nativeEvent.layout.height;
        }}
      >
        <LinearGradient
          colors={['#4f46e5', '#6366f1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          // Pill only around text, centered, not full width
          style={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            borderRadius: 9999,
            alignSelf: 'center',
            maxWidth: '70%',
          }}
        >
          <Text className="text-white text-lg font-bold text-center">My Account</Text>
        </LinearGradient>

        <Text
          className="mt-4 text-5xl font-extrabold"
          style={{ fontSize: 48, fontWeight: '800', textAlign: 'center' }}
        >
          {`$${money.toFixed(2)}`}
        </Text>
      </View>

      <View className="flex-1">
        {Array.from({ length: ballCount }).map((_, i) => (
          <Ball key={i} w={screenW} h={screenH} headerH={headerH} />
        ))}
      </View>
    </SafeAreaView>
  );
}

function Ball({
  w,
  h,
  headerH,
}: {
  w: SharedValue<number>;
  h: SharedValue<number>;
  headerH: SharedValue<number>;
}) {
  const x = useSharedValue(Math.random() * Math.max(1, w.value - BALL_SIZE));
  const y = useSharedValue(
    headerH.value +
      20 +
      Math.random() *
        Math.max(1, h.value - headerH.value - TAB_BAR_HEIGHT - BALL_SIZE - 40)
  );
  const vx = useSharedValue((Math.random() - 0.5) * 220);
  const vy = useSharedValue((Math.random() - 0.5) * 220);
  const lastT = useSharedValue(Date.now());

  useDerivedValue(() => {
    const now = Date.now();
    const dt = Math.min(0.05, (now - lastT.value) / 1000);
    lastT.value = now;

    x.value += vx.value * dt;
    y.value += vy.value * dt;

    vx.value *= AIR_FRICTION;
    vy.value *= AIR_FRICTION;

    const left = 0;
    const right = w.value - BALL_SIZE;
    const top = headerH.value;
    const bottom = h.value - TAB_BAR_HEIGHT - BALL_SIZE;

    if (x.value <= left) {
      x.value = left;
      vx.value = -vx.value * DAMPING;
    } else if (x.value >= right) {
      x.value = right;
      vx.value = -vx.value * DAMPING;
    }

    if (y.value <= top) {
      y.value = top;
      vy.value = -vy.value * DAMPING;
    } else if (y.value >= bottom) {
      y.value = bottom;
      vy.value = -vy.value * DAMPING;
      vx.value *= GROUND_FRICTION;
      if (Math.abs(vy.value) < 5) vy.value = 0;
      if (Math.abs(vx.value) < 3) vx.value = 0;
    }
  });

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#22c55e',
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return <Animated.View style={style} />;
}