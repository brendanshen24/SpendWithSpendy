import { Text, View, Image } from 'react-native';
import { useState } from 'react';
import Tile from "../components/Tile";
import BottomDrawer from '../components/BottomDrawer';

type SelectedTile = {
    title: string;
    sub: string;
    icon: any;
    side: any;
};

export default function Store() {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null);

    const openFor = (tile: SelectedTile) => {
        setSelectedTile(tile);
        setDrawerVisible(true);
    };

    return (
        <View className={"flex items-start p-[22px]"}>
            <Text className={"text-[24px] font-semibold text-center"}>
                Game Shops
            </Text>

            <View className={"bg-[#E2E6EA] p-[11px] rounded-[8px]"}>
                <Tile
                    iconPath={require('../assets/Valorant.jpg')}
                    title={"Valorant"}
                    sub={"RIOT GAMES"}
                    sideIconPath={require('../assets/arrow.png')}
                    onPress={() => openFor({ title: 'Valorant', sub: 'RIOT GAMES', icon: require('../assets/Valorant.jpg'), side: require('../assets/arrow.png') })}
                />
                <Tile
                    iconPath={require('../assets/roblox.png')}
                    title={"Roblox"}
                    sub={"ROBLOX CORP."}
                    sideIconPath={require('../assets/arrow.png')}
                    onPress={() => openFor({ title: 'Roblox', sub: 'ROBLOX CORP.', icon: require('../assets/roblox.png'), side: require('../assets/arrow.png') })}
                />
                <Tile
                    iconPath={require('../assets/minecraft.jpg')}
                    title={"Minecraft"}
                    sub={"MOJANG STUDIOS"}
                    sideIconPath={require('../assets/arrow.png')}
                    onPress={() => openFor({ title: 'Minecraft', sub: 'MOJANG STUDIOS', icon: require('../assets/minecraft.jpg'), side: require('../assets/arrow.png') })}
                />
            </View>

            <Text className={"text-[24px] font-semibold text-center mt-4"}>
                Gift Cards
            </Text>

            <View className={"bg-[#E2E6EA] p-[11px] rounded-[8px] mt-2"}>
                <Tile
                    iconPath={require('../assets/Valorant.jpg')}
                    title={"Valorant"}
                    sub={"RIOT GAMES"}
                    sideIconPath={require('../assets/money.png')}
                    onPress={() => openFor({ title: 'Valorant', sub: 'RIOT GAMES', icon: require('../assets/Valorant.jpg'), side: require('../assets/money.png') })}
                />
                <Tile
                    iconPath={require('../assets/roblox.png')}
                    title={"Roblox"}
                    sub={"ROBLOX CORP."}
                    sideIconPath={require('../assets/money.png')}
                    onPress={() => openFor({ title: 'Roblox', sub: 'ROBLOX CORP.', icon: require('../assets/roblox.png'), side: require('../assets/money.png') })}
                />
                <Tile
                    iconPath={require('../assets/minecraft.jpg')}
                    title={"Minecraft"}
                    sub={"MOJANG STUDIOS"}
                    sideIconPath={require('../assets/money.png')}
                    onPress={() => openFor({ title: 'Minecraft', sub: 'MOJANG STUDIOS', icon: require('../assets/minecraft.jpg'), side: require('../assets/money.png') })}
                />
            </View>

            <BottomDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} height={{ fraction: 0.45 }}>
                {selectedTile ? (
                    <View className="flex flex-col items-center">
                        <Image source={selectedTile.icon} className="w-[84px] h-[84px] mb-4" />
                        <Text className="text-[20px] font-semibold mb-2">{selectedTile.title}</Text>
                        <Text className="text-[14px] font-light mb-6">{selectedTile.sub}</Text>
                        {/* Add any actions or details here */}
                    </View>
                ) : (
                    <View />
                )}
            </BottomDrawer>
        </View>
    );
}