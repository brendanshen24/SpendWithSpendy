import React from 'react';
import { Text, View, Image, Pressable } from 'react-native';

type TileProps = {
    iconPath: any;
    title: string;
    sub: string;
    sideIconPath: any;
    onPress?: () => void;
};

export default function Tile({ iconPath, title, sub, sideIconPath, onPress }: TileProps) {
    return (
        <Pressable onPress={onPress} className="mb-2">
            <View className="flex flex-row bg-[#F1F2F4] justify-between items-center rounded-[6px] w-[328px]">
                <View className={"flex flex-row items-center pl-[10px] py-[10px] gap-[15px]"}>
                    <Image source={iconPath} className="w-[42px] h-[42px]" />

                    <View className="flex flex-col justify-center items-start">
                        <Text className="text-[16px] font-normal">{title}</Text>
                        <Text className="text-[12px] font-light">{sub}</Text>
                    </View>
                </View>
                <View className={"flex pr-[22px]"}>
                    <Image source={sideIconPath} className="w-[32px] h-[23px]" />
                </View>
            </View>
        </Pressable>
    );
}