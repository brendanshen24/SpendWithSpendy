import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    SharedValue,
} from 'react-native-reanimated';
import { Image, Dimensions } from 'react-native';

const BALL_SIZE = 60;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SPACING = 10;

interface BallProps {
    index: number;
    totalBalls: number;
    containerHeight: number;
}

const Ball: React.FC<BallProps> = ({ index, totalBalls, containerHeight }) => {
    // Initial position calculation (kept the same)
    const ballsPerRow = Math.floor(SCREEN_WIDTH / (BALL_SIZE + SPACING));
    const row = Math.floor(index / ballsPerRow);
    const col = index % ballsPerRow;

    const totalRowWidth = ballsPerRow * (BALL_SIZE + SPACING);
    const startX = -totalRowWidth / 2 + BALL_SIZE / 2 + SPACING / 2;
    const gridX = startX + col * (BALL_SIZE + SPACING);

    // Final Y position in the grid
    const gridY = containerHeight - BALL_SIZE - row * (BALL_SIZE + SPACING) - SPACING;

    // Shared values for animation
    const translateY = useSharedValue(-BALL_SIZE); // Start off-screen
    const translateX = useSharedValue(gridX);     // Start at the correct X

    // Initial drop to grid position
    useEffect(() => {
        if (containerHeight <= 0) return;

        const delay = index * 80;

        // Animate down to the final grid position (gridY)
        setTimeout(() => {
            translateY.value = withTiming(gridY, {
                duration: 800,
                easing: Easing.out(Easing.cubic),
            });
        }, delay);
    }, [containerHeight, gridY, index]);

    // This style is now static after the initial drop
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                { translateX: translateX.value },
            ],
        };
    });

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: BALL_SIZE,
                    height: BALL_SIZE,
                    alignSelf: 'center',
                },
                animatedStyle,
            ]}
        >
            <Image
                source={require('../assets/ball.png')}
                style={{ width: BALL_SIZE, height: BALL_SIZE }}
            />
        </Animated.View>
    );
};

export default Ball;