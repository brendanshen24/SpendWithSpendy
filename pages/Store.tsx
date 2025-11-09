import { StatusBar } from 'expo-status-bar';
import {NFCScanner} from 'components/NFCScanner';
import { Text, View, Button } from 'react-native';
import { useState } from 'react';
import TabSelector from "components/TabSelector";
import Tile from "../components/Tile";

export default function Store() {
    return (
        <View className={"flex items-start p-[22px]"}>
            <Text className={"text-[24px] font-semibold text-center"}>
                Game Shops
            </Text>
            <View className={"bg-[#E2E6EA] p-[11px]"}>
                <Tile iconPath={require('../assets/Valorant.jpg')}
                      title={"Valorant"}
                      sub={"RIOT GAMES"}
                      sideIconPath={require('../assets/arrow.png')}
                />
            </View>

        </View>
    );
}