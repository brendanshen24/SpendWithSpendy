import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Image, Dimensions, Alert, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import NfcManager, { NfcEvents } from 'react-native-nfc-manager';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BALL_SIZE = 60;
const SPACING = 10;

const FaceDecal: React.FC<{ size: number }> = ({ size }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ position: 'absolute' }}>
            <Circle cx="30" cy="30" r="30" fill="#27E76B" />
            <Circle cx="15.5273" cy="24.9262" r="2.92619" fill="black" />
            <Ellipse cx="12.565" cy="33.0289" rx="1.33665" ry="0.841597" transform="rotate(-14.3513 12.565 33.0289)" fill="black" />
            <Ellipse cx="11.5035" cy="35.9352" rx="1.33665" ry="0.841597" transform="rotate(-14.3513 11.5035 35.9352)" fill="black" />
            <Ellipse cx="15.5496" cy="34.7794" rx="1.33665" ry="0.841597" transform="rotate(-14.3513 15.5496 34.7794)" fill="black" />
            <Ellipse cx="1.33665" cy="0.841597" rx="1.33665" ry="0.841597" transform="matrix(-0.968794 -0.247866 -0.247866 0.968794 48.9385 32.5449)" fill="black" />
            <Ellipse cx="1.33665" cy="0.841597" rx="1.33665" ry="0.841597" transform="matrix(-0.968794 -0.247866 -0.247866 0.968794 50 35.4512)" fill="black" />
            <Ellipse cx="1.33665" cy="0.841597" rx="1.33665" ry="0.841597" transform="matrix(-0.968794 -0.247866 -0.247866 0.968794 45.9539 34.2954)" fill="black" />
            <Circle cx="44.5002" cy="24.9262" r="2.92619" fill="black" />
            <Path d="M30.9034 31.1479C30.4179 31.5078 29.754 31.5078 29.2684 31.1479L25.6039 28.4313C24.541 27.6433 25.0983 25.9557 26.4214 25.9557L33.7504 25.9557C35.0736 25.9557 35.6309 27.6433 34.5679 28.4313L30.9034 31.1479Z" fill="black" />
            <Path d="M30.0137 29.0806V32.9822C30.0137 32.9822 28.5325 39.1235 23.1859 36.378" stroke="black" strokeWidth="1.80629" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M30.0859 29.0806V32.9822C30.0859 32.9822 31.5671 39.1235 36.9137 36.378" stroke="black" strokeWidth="1.80629" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
};

interface SpendingConfirmationProps {
    visible: boolean;
    amount: number;
    onConfirm: () => void;
    onClose: () => void;
}

interface DisappearingBallProps {
    index: number;
    totalBalls: number;
    containerHeight: number;
    startDisappear: boolean;
}

const DisappearingBall: React.FC<DisappearingBallProps> = ({
                                                               index,
                                                               totalBalls,
                                                               containerHeight,
                                                               startDisappear,
                                                           }) => {
    const translateY = useSharedValue(-BALL_SIZE);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const ballsPerRow = Math.floor(SCREEN_WIDTH / (BALL_SIZE + SPACING));
    const row = Math.floor(index / ballsPerRow);
    const col = index % ballsPerRow;

    const totalRowWidth = ballsPerRow * (BALL_SIZE + SPACING);
    const startX = -totalRowWidth / 2 + BALL_SIZE / 2 + SPACING / 2;
    const gridX = startX + col * (BALL_SIZE + SPACING);
    const gridY = containerHeight - BALL_SIZE - row * (BALL_SIZE + SPACING) - SPACING;

    useEffect(() => {
        if (containerHeight <= 0) return;
        const dropDelay = index * 80;

        setTimeout(() => {
            translateY.value = withTiming(gridY, {
                duration: 800,
                easing: Easing.out(Easing.cubic),
            });
            translateX.value = gridX;
        }, dropDelay);
    }, [containerHeight, gridY, gridX, index]);

    useEffect(() => {
        if (!startDisappear || containerHeight <= 0) return;

        const ballsPerRow = Math.floor(SCREEN_WIDTH / (BALL_SIZE + SPACING));
        const row = Math.floor(index / ballsPerRow);
        const col = index % ballsPerRow;
        const colsInRow = Math.min(ballsPerRow, totalBalls - row * ballsPerRow);
        const colFromRight = colsInRow - 1 - col;

        const settleTime = 1500 + (totalBalls * 80);
        const staggerDelay = colFromRight * 120;
        const totalDelay = settleTime + staggerDelay;

        setTimeout(() => {
            const endX = gridX - SCREEN_WIDTH - BALL_SIZE * 2;

            translateX.value = withTiming(endX, {
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
            });

            opacity.value = withTiming(0, {
                duration: 1500,
                easing: Easing.out(Easing.ease),
            });

            scale.value = withTiming(0.3, {
                duration: 1500,
                easing: Easing.out(Easing.ease),
            });
        }, totalDelay);
    }, [startDisappear, containerHeight, index, gridX, totalBalls]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                { translateX: translateX.value },
                { scale: scale.value },
            ],
            opacity: opacity.value,
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

export default function SpendingConfirmation({
                                                 visible,
                                                 amount,
                                                 onConfirm,
                                                 onClose,
                                             }: SpendingConfirmationProps) {
    const [containerHeight, setContainerHeight] = useState(0);
    const [startAnimation, setStartAnimation] = useState(false);
    const [showNFCScanner, setShowNFCScanner] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [showSureImage, setShowSureImage] = useState(false); // ✅ new state
    const ballsToShow = Math.floor(amount);
    const ballIndices = Array.from({ length: ballsToShow }, (_, i) => i);

    useEffect(() => {
        if (visible) {
            NfcManager.start();
        }

        return () => {
            try {
                NfcManager.cancelTechnologyRequest();
                NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
            } catch {}
        };
    }, [visible]);

    useEffect(() => {
        if (visible && containerHeight > 0) {
            const timer = setTimeout(() => {
                setStartAnimation(true);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setStartAnimation(false);
            setShowNFCScanner(false);
            setScanning(false);
        }
    }, [visible, containerHeight]);

    const handleOkayClick = () => {
        setShowNFCScanner(true);
        setShowSureImage(true); // ✅ change image when button pressed
    };

    const handleNFCSuccess = useCallback(() => {
        setScanning(false);
        onConfirm();
        onClose();
    }, [onConfirm, onClose]);

    const startNFCScan = useCallback(async () => {
        if (scanning) return;
        setScanning(true);

        try {
            if (Platform.OS === 'ios') {
                await NfcManager.registerTagEvent({ alertMessage: 'Tap Spendy to pay!' });

                await new Promise<void>((resolve) => {
                    NfcManager.setEventListener(NfcEvents.DiscoverTag, () => {
                        handleNFCSuccess();
                        resolve();
                    });
                });
            } else {
                await NfcManager.requestTechnology(['android.nfc.tech.IsoDep' as any]);
                handleNFCSuccess();
            }
        } catch (e: any) {
            if (e?.message && !/cancel/i.test(e.message)) {
                Alert.alert('NFC Error', String(e.message));
            }
            setScanning(false);
        } finally {
            try {
                await NfcManager.cancelTechnologyRequest();
            } catch {}
        }
    }, [scanning, handleNFCSuccess]);

    useEffect(() => {
        if (!visible) {
            setShowSureImage(false); // reset image when modal closes
        }
    }, [visible]);

    if (!visible) {
        return null;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ paddingVertical: 20 }}>
                <Text className={"text-[24px] font-semibold text-center"}>
                    You are losing ${amount.toFixed(2)}
                </Text>
            </View>

            <Image
                source={
                    showSureImage
                        ? require('../assets/sure.png')   // ✅ conditional image
                        : require('../assets/lose.png')
                }
                className={"size-96 mx-auto"}
            />

            <View
                style={{ flex: 1, overflow: 'hidden', marginBottom: 30 }}
                onLayout={(event) => setContainerHeight(event.nativeEvent.layout.height)}
            >
                {containerHeight > 0 && ballIndices.map((index) => (
                    <DisappearingBall
                        key={index}
                        index={index}
                        totalBalls={ballsToShow}
                        containerHeight={containerHeight}
                        startDisappear={startAnimation}
                    />
                ))}
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' }}>
                {!showNFCScanner ? (
                    <Pressable
                        onPress={handleOkayClick}
                        style={{
                            backgroundColor: '#1F1B15',
                            paddingVertical: 16,
                            paddingHorizontal: 32,
                            borderRadius: 8,
                        }}
                    >
                        <Text
                            style={{
                                color: '#E2E6EA',
                                fontSize: 18,
                                fontWeight: '600',
                            }}
                        >
                            That's okay with me
                        </Text>
                    </Pressable>
                ) : (
                    <View style={{ alignItems: 'center', width: '100%' }}>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: '600',
                                marginBottom: 20,
                                textAlign: 'center',
                                color: '#1F1B15',
                            }}
                        >
                            Are you sure sure?
                        </Text>
                        <Pressable
                            onPress={startNFCScan}
                            disabled={scanning}
                            style={{
                                backgroundColor: scanning ? '#9CA3AF' : '#1F1B15',
                                paddingVertical: 16,
                                paddingHorizontal: 32,
                                borderRadius: 8,
                                minWidth: 200,
                            }}
                        >
                            <Text
                                style={{
                                    color: '#E2E6EA',
                                    fontSize: 18,
                                    fontWeight: '600',
                                    textAlign: 'center',
                                }}
                            >
                                {scanning ? 'Scanning...' : 'Yes!'}
                            </Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}
