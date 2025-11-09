import { Text, View, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import Tile from "../components/Tile";
import BottomDrawer from '../components/BottomDrawer';
import SpendingConfirmation from '../components/SpendingConfirmation';

type SelectedTile = {
    title: string;
    sub: string;
    icon: any;
    side: any;
};

export default function Store({balance, setBalance, setTabState}: {
    balance: number,
    setBalance: (balance: number) => void,
    setTabState?: (value: (((prevState: string) => string) | string)) => void
}) {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(0);

    const openFor = (tile: SelectedTile) => {
        setSelectedTile(tile);
        setDrawerVisible(true);
    };

    const handlePointClick = (price: string) => {
        const amount = parseFloat(price.replace('$', ''));
        if (!isNaN(amount)) {
            // If user doesn't have enough funds, show a popup and don't proceed
            if (amount > balance) {
                // Offer to go to Money tab to add funds if setTabState is provided
                if (setTabState) {
                    Alert.alert(
                        'You don\'t have enough money to buy this!',
                        "You'll need to ask someone to put in more money to buy this item.",
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Add Money', onPress: () => setTabState('Parent') },
                        ]
                    );
                } else {
                    Alert.alert('Insufficient funds', "You don't have enough funds to buy this item.");
                }
                return;
            }

            setSelectedAmount(amount);
            setDrawerVisible(false);
            setConfirmationVisible(true);
        }
    };

    const handleConfirmSpending = () => {
        // Deduct the amount from balance after successful NFC scan
        const newBalance = Math.max(0, balance - selectedAmount);
        setBalance(newBalance);
        // Return to the Money tab after the tap/sync completes
        if (setTabState) setTabState('Money');
    };

    // Show confirmation view instead of store when visible
    if (confirmationVisible) {
        return (
            <SpendingConfirmation
                visible={confirmationVisible}
                amount={selectedAmount}
                onConfirm={handleConfirmSpending}
                onClose={() => setConfirmationVisible(false)}
            />
        );
    }

    return (
        <View className={"flex items-start p-[22px]"}>
            <Text className={"text-[24px] font-semibold text-center pb-[19px]"}>
                Game Shops
            </Text>

            <View className={"bg-[#E2E6EA] p-[11px] rounded-[8px]"}>
                <Tile
                    iconPath={require('../assets/Valorant.jpg')}
                    title={"Valorant"}
                    sub={"RIOT GAMES"}
                    sideIconPath={require('../assets/arrow.png')}
                    sideIconWidth={12}
                    onPress={() => openFor({ title: 'Valorant', sub: 'RIOT GAMES', icon: require('../assets/Valorant.jpg'), side: require('../assets/arrow.png') })}
                />
                <Tile
                    iconPath={require('../assets/roblox.png')}
                    title={"Roblox"}
                    sub={"ROBLOX CORP."}
                    sideIconPath={require('../assets/arrow.png')}
                    sideIconWidth={12}
                    onPress={() => openFor({ title: 'Roblox', sub: 'ROBLOX CORP.', icon: require('../assets/roblox.png'), side: require('../assets/arrow.png') })}
                />
                <Tile
                    iconPath={require('../assets/minecraft.jpg')}
                    title={"Minecraft"}
                    sub={"MOJANG STUDIOS"}
                    sideIconPath={require('../assets/arrow.png')}
                    sideIconWidth={12}
                    onPress={() => openFor({ title: 'Minecraft', sub: 'MOJANG STUDIOS', icon: require('../assets/minecraft.jpg'), side: require('../assets/arrow.png') })}
                />
            </View>

            <Text className={"text-[24px] font-semibold text-center mt-4 pb-[19px]"}>
                Gift Cards
            </Text>

            <View className={"bg-[#E2E6EA] p-[11px] rounded-[8px]"}>
                <Tile
                    iconPath={require('../assets/amazon.png')}
                    title={"Amazon"}
                    sub={"$5 - $100"}
                    sideIconPath={require('../assets/money.png')}
                    sideIconWidth={12}
                    onPress={() => openFor({ title: 'Amazon', sub: '$5 - $100', icon: require('../assets/amazon.png'), side: require('../assets/money.png') })}
                />
                <Tile
                    iconPath={require('../assets/walmart.jpg')}
                    title={"Walmart"}
                    sub={"$5 - $100"}
                    sideIconPath={require('../assets/money.png')}
                    sideIconWidth={12}
                    onPress={() => openFor({ title: 'Walmart', sub: '$5 - $100', icon: require('../assets/walmart.jpg'), side: require('../assets/money.png') })}
                />
                <Tile
                    iconPath={require('../assets/apple.jpg')}
                    title={"Apple"}
                    sub={"$5 - $100"}
                    sideIconPath={require('../assets/money.png')}
                    sideIconWidth={12}
                    onPress={() => openFor({ title: 'Apple', sub: '$5 - $100', icon: require('../assets/apple.jpg'), side: require('../assets/money.png') })}
                />
            </View>

            <BottomDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} height={634}>
                {selectedTile ? (
                    <View>
                        <View className="flex flex-row justify-between items-center rounded-[6px] w-[328px]">
                            <View className={"flex flex-row items-center pl-[10px] py-[10px] gap-[15px]"}>
                                <Image source={selectedTile.icon} className="w-[42px] h-[42px]" />

                                <View className="flex flex-col justify-center items-start">
                                    <Text className="text-[16px] font-normal">{selectedTile.title}</Text>
                                    <Text className="text-[12px] font-light">{selectedTile.sub}</Text>
                                </View>
                            </View>
                            <View className={"flex pr-[22px]"}>
                            </View>
                        </View>
                        <View className={"bg-[#E2E6EA] p-[11px] rounded-[8px] mt-2"}>
                            <Tile
                                iconPath={require('../assets/valorant2.png')}
                                title={`475 ${selectedTile.title} Points`}
                                sub={"$5.00"}
                                sideIconPath={require('../assets/money.png')}
                                sideIconWidth={12}
                                onPress={() => handlePointClick("$5.00")}
                            />
                            <Tile
                                iconPath={require('../assets/valorant2.png')}
                                title={`950 ${selectedTile.title} Points`}
                                sub={"$10.00"}
                                sideIconPath={require('../assets/money.png')}
                                sideIconWidth={12}
                                onPress={() => handlePointClick("$10.00")}
                            />
                            <Tile
                                iconPath={require('../assets/valorant2.png')}
                                title={`1900 ${selectedTile.title} Points`}
                                sub={"$20.00"}
                                sideIconPath={require('../assets/money.png')}
                                sideIconWidth={12}
                                onPress={() => handlePointClick("$20.00")}
                            />
                            <Tile
                                iconPath={require('../assets/valorant2.png')}
                                title={`3325 ${selectedTile.title} Points`}
                                sub={"$35.00"}
                                sideIconPath={require('../assets/money.png')}
                                sideIconWidth={12}
                                onPress={() => handlePointClick("$35.00")}
                            />
                            <Tile
                                iconPath={require('../assets/valorant2.png')}
                                title={`4750 ${selectedTile.title} Points`}
                                sub={"$50.00"}
                                sideIconPath={require('../assets/money.png')}
                                sideIconWidth={12}
                                onPress={() => handlePointClick("$50.00")}
                            />
                            <Tile
                                iconPath={require('../assets/valorant2.png')}
                                title={`9500 ${selectedTile.title} Points`}
                                sub={"$100.00"}
                                sideIconPath={require('../assets/money.png')}
                                sideIconWidth={12}
                                onPress={() => handlePointClick("$100.00")}
                            />
                        </View>

                    </View>



                ) : (
                    <View />
                )}
            </BottomDrawer>
        </View>
    );
}