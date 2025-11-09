import { StatusBar } from 'expo-status-bar';
import {NFCScanner} from 'components/NFCScanner';
import { Text, View, Button, Image } from 'react-native';
import { useState } from 'react';
import TabSelector from "components/TabSelector";

export default function Tile({iconPath, title, sub, sideIconPath}:{iconPath: string, title: string, sub: string, sideIconPath: string}  ) {
    return (
        <View className="flex flex-row bg-[#F1F2F4] justify-between items-center rounded-[6px] w-[328px]">
            <View className={"flex flex-row items-center pl-[10px] py-[10px] gap-[15px]"}>
                <Image source={iconPath} className="w-[42px] h-[42px]"/>

                <View className="flex flex-col justify-center items-start">
                    <Text className="text-[16px] font-normal">{title}</Text>
                    <Text className="text-[12px] font-light">{sub}</Text>
                </View>
            </View>
            <View className={"flex pr-[22px]"}>
                <Image source={sideIconPath} className="w-[9px] h-[15px]"/>
            </View>
        </View>
    );
}