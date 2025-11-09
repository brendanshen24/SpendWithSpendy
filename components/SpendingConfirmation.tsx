import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Image, Dimensions, Alert, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import NfcManager, { NfcEvents } from 'react-native-nfc-manager';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BALL_SIZE = 60;
const SPACING = 10;

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

    // Calculate grid position same as Ball component
    const ballsPerRow = Math.floor(SCREEN_WIDTH / (BALL_SIZE + SPACING));
    const row = Math.floor(index / ballsPerRow);
    const col = index % ballsPerRow;

    const totalRowWidth = ballsPerRow * (BALL_SIZE + SPACING);
    const startX = -totalRowWidth / 2 + BALL_SIZE / 2 + SPACING / 2;
    const gridX = startX + col * (BALL_SIZE + SPACING);
    const gridY = containerHeight - BALL_SIZE - row * (BALL_SIZE + SPACING) - SPACING;

    // Initial drop animation
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

    // Disappearing animation
    useEffect(() => {
        if (!startDisappear || containerHeight <= 0) return;

        // Calculate delay based on column position (rightmost balls disappear first)
        const ballsPerRow = Math.floor(SCREEN_WIDTH / (BALL_SIZE + SPACING));
        const row = Math.floor(index / ballsPerRow);
        const col = index % ballsPerRow;
        // Rightmost column has highest priority (disappears first)
        // Calculate from right: rightmost col in row has highest col index
        const colsInRow = Math.min(ballsPerRow, totalBalls - row * ballsPerRow);
        const colFromRight = colsInRow - 1 - col; // 0 = rightmost, increases going left
        
        // Wait for all balls to drop, then start disappearing from right
        const settleTime = 1500 + (totalBalls * 80); // Time for all balls to drop
        const staggerDelay = colFromRight * 120; // Rightmost balls disappear first
        const totalDelay = settleTime + staggerDelay;

        setTimeout(() => {
            // Animate to the left and fade out
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
            <Image
                source={require('../assets/ball.png')}
                style={{ width: BALL_SIZE, height: BALL_SIZE }}
            />
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
    const ballsToShow = Math.floor(amount);
    const ballIndices = Array.from({ length: ballsToShow }, (_, i) => i);

    // Initialize NFC manager
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
            // Start animation after a brief delay to let balls render
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
    };

    const handleNFCSuccess = useCallback(() => {
        setScanning(false);
        // Deduct the balance after successful NFC scan
        onConfirm();
        // Close the confirmation view
        onClose();
    }, [onConfirm, onClose]);

    const startNFCScan = useCallback(async () => {
        if (scanning) return;
        setScanning(true);

        try {
            if (Platform.OS === 'ios') {
                await NfcManager.registerTagEvent({
                    alertMessage: 'Tap Spendy!'
                });
                
                await new Promise<void>((resolve) => {
                    NfcManager.setEventListener(NfcEvents.DiscoverTag, () => {
                        // NFC scan successful
                        handleNFCSuccess();
                        resolve();
                    });
                });
            } else {
                // On Android, just detect any tag
                await NfcManager.requestTechnology(['android.nfc.tech.IsoDep' as any]);
                handleNFCSuccess();
            }

        } catch (e: any) {
            // Only show error if it's not a cancel
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

            <View
                style={{ flex: 1, overflow: 'hidden', marginBottom: 30 }}
                onLayout={(event) => {
                    setContainerHeight(event.nativeEvent.layout.height);
                }}
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
                            Scan NFC to confirm purchase
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
                                {scanning ? 'Scanning...' : 'Tap to Scan'}
                            </Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}

