// components/Ball.tsx
import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import BallSVG from 'assets/ball.svg'; // Ensure this path is correct for your SVG

const BALL_SIZE = 60; // 60px by 60px

interface BallProps {
    index: number;
    totalBalls: number;
    containerHeight: number;
}

const Ball: React.FC<BallProps> = ({ index, totalBalls, containerHeight }) => {
    // Shared value for the ball's Y-position (translation)
    const translateY = useSharedValue(-BALL_SIZE); // Start off-screen (above)

    // Calculate the final resting Y position (for stacking)
    // The bottom-most ball rests at (containerHeight - BALL_SIZE).
    // Subsequent balls stack up, with a height of BALL_SIZE.
    const finalY = containerHeight - BALL_SIZE * (totalBalls - index);

    useEffect(() => {
        if (containerHeight > 0) {
            // Delay the start of the animation to make them fall one by one
            const delay = index * 100;

            translateY.value = withTiming(
                finalY,
                {
                    duration: 500 + index * 50, // Longer duration for balls that fall farther
                    easing: Easing.bounce, // A nice bounce effect for the "stack"
                },
                (isFinished) => {
                    // Optional: you can add a callback when the animation finishes
                }
            );
        }
    }, [containerHeight, finalY, index, translateY]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            // Apply the Y translation for the fall
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute', // Allows precise positioning for stacking
                    width: BALL_SIZE,
                    height: BALL_SIZE,
                    alignSelf: 'center', // Center it horizontally
                },
                animatedStyle,
            ]}
        >
            <BallSVG width={BALL_SIZE} height={BALL_SIZE} />
        </Animated.View>
    );
};

export default Ball;