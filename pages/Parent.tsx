import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, Alert, Pressable, Platform, Keyboard } from 'react-native';
import Tile from "../components/Tile";
import BottomDrawer from '../components/BottomDrawer';
import SpendingConfirmation from '../components/SpendingConfirmation';

type SelectedTile = {
    title: string;
    sub: string;
    icon: any;
    side: any;
};



// Passcode Screen Component
const PasscodeScreen = ({ onSuccess }: { onSuccess: () => void }) => {
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState(false);
    const PASSCODE_LENGTH = 4;
    const CORRECT_PASSCODE = '1234';

    const handleNumberPress = (num: string) => {
        if (passcode.length < PASSCODE_LENGTH) {
            const newPasscode = passcode + num;
            setPasscode(newPasscode);

            if (newPasscode.length === PASSCODE_LENGTH) {
                if (newPasscode === CORRECT_PASSCODE) {
                    setError(false);
                    onSuccess();
                } else {
                    setError(true);
                    setTimeout(() => {
                        setPasscode('');
                        setError(false);
                    }, 500);
                }
            }
        }
    };

    const handleDelete = () => {
        setPasscode(passcode.slice(0, -1));
        setError(false);
    };

    return (
        <View className="flex-1 bg-white px-4 justify-center">
            <View className="items-center">
                <Text className="text-3xl font-bold mb-8">Enter Passcode</Text>

                {/* Passcode Dots */}
                <View className="flex-row gap-3 mb-12">
                    {Array.from({ length: PASSCODE_LENGTH }, (_, i) => (
                        <View
                            key={i}
                            className={`w-12 h-12 rounded-lg ${
                                error
                                    ? 'bg-red-300'
                                    : i < passcode.length
                                        ? 'bg-gray-400'
                                        : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </View>

                {/* Number Pad */}
                <View className="w-full max-w-sm">
                    {[[1, 2, 3], [4, 5, 6], [7, 8, 9]].map((row, rowIndex) => (
                        <View key={rowIndex} className="flex-row gap-4 mb-4">
                            {row.map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    onPress={() => handleNumberPress(num.toString())}
                                    className="flex-1 bg-gray-200 rounded-2xl py-8"
                                >
                                    <Text className="text-center text-4xl font-medium text-gray-700">
                                        {num}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}

                    {/* Bottom Row with 0 */}
                    <View className="flex-row gap-4">
                        <View className="flex-1" />
                        <TouchableOpacity
                            onPress={() => handleNumberPress('0')}
                            className="flex-1 bg-gray-200 rounded-2xl py-8"
                        >
                            <Text className="text-center text-4xl font-medium text-gray-700">0</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleDelete}
                            className="flex-1 bg-gray-200 rounded-2xl py-8"
                        >
                            <Text className="text-center text-2xl text-gray-700">⌫</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

// Parent Dashboard Component
import NfcManager, { NfcEvents } from 'react-native-nfc-manager';

const ParentDashboard = ({ balance, setBalance }: { balance: number, setBalance?: (b:number) => void }) => {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number>(0);
    const [amountInput, setAmountInput] = useState<string>('');
    const [drawerStep, setDrawerStep] = useState<'input' | 'nfc' | 'done'>('input');
    const [scanning, setScanning] = useState(false);
    const amountInputRef = useRef<TextInput | null>(null);

    const openFor = (tile: SelectedTile) => {
        setSelectedTile(tile);
        setAmountInput('');
        setSelectedAmount(0);
        setDrawerStep('input');
        setDrawerVisible(true);
    };

    // Auto-focus the amount input when drawer opens and we're on the input step
    useEffect(() => {
        if (drawerVisible && drawerStep === 'input') {
            // small delay to allow drawer animation/modal to mount
            const t = setTimeout(() => {
                amountInputRef.current?.focus?.();
            }, 220);
            return () => clearTimeout(t);
        }
    }, [drawerVisible, drawerStep]);

    const startNfcScan = useCallback(async (amount: number) => {
        if (scanning) return;
        setScanning(true);
        try {
            NfcManager.start();

            // Wait for a tag discovery or technology request success
            let resolved = false;
            await new Promise<void>(async (resolve, reject) => {
                try {
                    NfcManager.setEventListener(NfcEvents.DiscoverTag, () => {
                        if (resolved) return;
                        resolved = true;
                        resolve();
                    });

                    if (Platform.OS === 'ios') {
                        await NfcManager.registerTagEvent({ alertMessage: 'Tap to sync funds' });
                    } else {
                        // Android: request a commonly used tech; if it resolves treat as success
                        await NfcManager.requestTechnology(['android.nfc.tech.IsoDep' as any], { alertMessage: 'Tap to sync funds' });
                        if (!resolved) {
                            resolved = true;
                            resolve();
                        }
                    }
                } catch (e) {
                    if (!resolved) reject(e);
                }
            });

            // On success, add funds to balance
            const newBal = Math.round((balance + amount) * 100) / 100;
            setBalance && setBalance(newBal);
            setDrawerStep('done');
            

            // close shortly after success
            setTimeout(() => setDrawerVisible(false), 800);
        } catch (err: any) {
            Alert.alert('NFC Error', String(err?.message ?? 'Failed to read tag'));
        } finally {
            try {
                NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
                await NfcManager.cancelTechnologyRequest();
            } catch {}
            setScanning(false);
        }
    }, [scanning, balance, setBalance]);

    return (
        <View style={{ flex: 1 }} className={"items-center"}>
            <View style={{ paddingVertical: 20 }}>
                <Text className="text-[86px] font-semibold text-center">
                    ${balance}
                </Text>
            </View>
            <View className={"bg-[#E2E6EA] p-[11px] rounded-[8px]"}>
                <Tile
                    iconPath={require('../assets/reload.png')}
                    title={"Reload Card"}
                    sub={"ADD FUNDS TO CARD"}
                    sideIconPath={require('../assets/addfunds.png')}
                    sideIconWidth={12}
                    onPress={() => openFor({ title: 'Reload Card', sub: 'ADD FUNDS TO CARD', icon: require('../assets/reload.png'), side: require('../assets/addfunds.png') })}
                />
            </View>
            <Text className={"text-[24px] font-semibold text-center mt-4"}>
                Account Info
            </Text>
            <View className={"bg-[#E2E6EA] p-[11px] rounded-[8px]"}>
                <Tile
                    iconPath={require('../assets/mastercard.png')}
                    title={"Payment Type"}
                    sub={"MASTERCARD ENDING IN 3086"}
                    sideIconPath={require('../assets/arrow.png')}
                    sideIconWidth={12}
                    onPress={() => openFor({ title: 'Payment Type', sub: 'MASTERCARD ENDING IN 3086', icon: require('../assets/mastercard.png'), side: require('../assets/arrow.png') })}
                />
                <Tile
                    iconPath={require('../assets/mastercard.png')}
                    title={"Hidden Items"}
                    sub={"PRODUCTS YOU CHOOSE TO HIDE"}
                    sideIconPath={require('../assets/arrow.png')}
                    sideIconWidth={12}
                    onPress={() => openFor({ title: 'Payment Type', sub: 'MASTERCARD ENDING IN 3086', icon: require('../assets/mastercard.png'), side: require('../assets/arrow.png') })}
                />
            </View>

            {/* Bottom drawer for selected tile actions (Reload flow implemented) */}
            <BottomDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} height={{ fraction: 0.60 }}>
                <View>
                    <Text className="text-xl font-semibold mb-3">{selectedTile?.title ?? ''}</Text>

                    {selectedTile?.title === 'Reload Card' && (
                        <View>
                            {drawerStep === 'input' && (
                                <View>
                                    <Text style={{ fontSize: 14, color: '#4B5563' }}>Enter amount to add</Text>
                                    <TextInput
                                        ref={amountInputRef}
                                        value={amountInput}
                                        onChangeText={(t) => setAmountInput(t)}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                        className="w-full bg-gray-100 rounded-lg p-3 mb-4 text-lg"
                                    />

                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                        <Pressable
                                            onPress={() => {
                                                const amt = parseFloat(amountInput.replace(/[^0-9.]/g, '')) || 0;
                                                if (!amt || amt <= 0) {
                                                    Alert.alert('Invalid amount', 'Please enter an amount greater than 0');
                                                    return;
                                                }
                                                setSelectedAmount(amt);
                                                setDrawerStep('nfc');
                                            }}
                                            style={{ backgroundColor: '#1F1B15', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center' }}
                                        >
                                            <Text style={{ color: '#E2E6EA', fontWeight: '600' }}>Continue</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}

                            {drawerStep === 'nfc' && (
                                <View className="items-center">
                                    <Text className="text-base mb-4">Tap your device to the card to sync</Text>
                                    <Pressable
                                        onPress={() => startNfcScan(selectedAmount)}
                                        disabled={scanning}
                                        style={{ backgroundColor: scanning ? '#9CA3AF' : '#1F1B15', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 }}
                                    >
                                        <Text style={{ color: '#E2E6EA', fontWeight: '600' }}>{scanning ? 'Scanning...' : `Tap to sync $${selectedAmount.toFixed(2)}`}</Text>
                                    </Pressable>
                                </View>
                            )}

                            {drawerStep === 'done' && (
                                <View className="items-center">
                                    <Text className="text-lg font-semibold">Synced!</Text>
                                    <Text className="text-sm text-gray-600">${selectedAmount.toFixed(2)} added to card</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </BottomDrawer>

        </View>
    );
};

// Main Parent Component
export default function Parent({ balance, setBalance, setTabState }: { balance: number, setBalance?: (balance: number) => void, setTabState:(tabState: string) => void }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <View className="flex-1">
            {!isAuthenticated ? (
                <PasscodeScreen onSuccess={() => setIsAuthenticated(true)} />
            ) : (
                <ParentDashboard balance={balance} setBalance={setBalance} />
            )}
        </View>
    );
}