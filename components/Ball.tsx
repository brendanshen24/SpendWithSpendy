import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing,
    SharedValue,
} from 'react-native-reanimated';
import { Image, Dimensions, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

const BALL_SIZE = 60;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SPACING = 10;

const FaceDecal: React.FC<{ size: number }> = ({ size }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ position: 'absolute' }}>
            {/* Green circle background (part of the logo decal) */}
            <Circle cx="30" cy="30" r="30" fill="#27E76B" />
            {/* Left eye */}
            <Circle cx="15.5273" cy="24.9262" r="2.92619" fill="black" />
            <Ellipse
                cx="12.565"
                cy="33.0289"
                rx="1.33665"
                ry="0.841597"
                transform="rotate(-14.3513 12.565 33.0289)"
                fill="black"
            />
            <Ellipse
                cx="11.5035"
                cy="35.9352"
                rx="1.33665"
                ry="0.841597"
                transform="rotate(-14.3513 11.5035 35.9352)"
                fill="black"
            />
            <Ellipse
                cx="15.5496"
                cy="34.7794"
                rx="1.33665"
                ry="0.841597"
                transform="rotate(-14.3513 15.5496 34.7794)"
                fill="black"
            />
            <Ellipse
                cx="1.33665"
                cy="0.841597"
                rx="1.33665"
                ry="0.841597"
                transform="matrix(-0.968794 -0.247866 -0.247866 0.968794 48.9385 32.5449)"
                fill="black"
            />
            <Ellipse
                cx="1.33665"
                cy="0.841597"
                rx="1.33665"
                ry="0.841597"
                transform="matrix(-0.968794 -0.247866 -0.247866 0.968794 50 35.4512)"
                fill="black"
            />
            <Ellipse
                cx="1.33665"
                cy="0.841597"
                rx="1.33665"
                ry="0.841597"
                transform="matrix(-0.968794 -0.247866 -0.247866 0.968794 45.9539 34.2954)"
                fill="black"
            />
            <Circle cx="44.5002" cy="24.9262" r="2.92619" fill="black" />
            <Path
                d="M30.9034 31.1479C30.4179 31.5078 29.754 31.5078 29.2684 31.1479L25.6039 28.4313C24.541 27.6433 25.0983 25.9557 26.4214 25.9557L33.7504 25.9557C35.0736 25.9557 35.6309 27.6433 34.5679 28.4313L30.9034 31.1479Z"
                fill="black"
            />
            <Path
                d="M30.0137 29.0806V32.9822C30.0137 32.9822 28.5325 39.1235 23.1859 36.378"
                stroke="black"
                strokeWidth="1.80629"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M30.0859 29.0806V32.9822C30.0859 32.9822 31.5671 39.1235 36.9137 36.378"
                stroke="black"
                strokeWidth="1.80629"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

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
    const rotation = useSharedValue(0);           // Rotation value

    // Generate unique random rotation characteristics for this ball
    const rotationPersonality = React.useMemo(() => {
        // Use index as seed for consistent randomness per ball
        const random1 = (Math.sin(index * 12.9898) * 43758.5453) % 1;
        const random2 = (Math.sin(index * 78.233) * 43758.5453) % 1;
        const random3 = (Math.sin(index * 45.164) * 43758.5453) % 1;

        return {
            // Random rotation speed between 8 and 20 seconds
            duration: 8000 + Math.abs(random1) * 12000,
            // Random direction (clockwise or counter-clockwise)
            direction: random2 > 0.5 ? 1 : -1,
            // Random starting rotation
            startRotation: Math.abs(random3) * 360,
        };
    }, [index]);

    // Start both animations together
    useEffect(() => {
        if (containerHeight <= 0) return;

        const delay = index * 80;

        setTimeout(() => {
            // Start rotation immediately
            rotation.value = rotationPersonality.startRotation;
            rotation.value = withRepeat(
                withTiming(
                    rotationPersonality.startRotation + (360 * rotationPersonality.direction),
                    {
                        duration: rotationPersonality.duration,
                        easing: Easing.linear,
                    }
                ),
                -1, // Infinite repeat
                false // Don't reverse
            );

            // Start drop animation
            translateY.value = withTiming(gridY, {
                duration: 800,
                easing: Easing.out(Easing.cubic),
            });
        }, delay);
    }, [containerHeight, gridY, index, rotationPersonality]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                { translateX: translateX.value },
                { rotate: `${rotation.value}deg` },
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
            <View style={{ width: BALL_SIZE, height: BALL_SIZE, position: 'relative' }}>
                <Image
                    source={require('../assets/ball.png')}
                    style={{
                        width: BALL_SIZE,
                        height: BALL_SIZE,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                    }}
                />
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: BALL_SIZE,
                        height: BALL_SIZE,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <FaceDecal size={BALL_SIZE} />
                </View>
            </View>
        </Animated.View>
    );
};

export default Ball;