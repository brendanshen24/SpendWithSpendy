import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
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
const ParentDashboard = ({ balance, setBalance }: { balance: number, setBalance: () => void }) => {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(0);
    const openFor = (tile: SelectedTile) => {
        setSelectedTile(tile);
        setDrawerVisible(true);
    };
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