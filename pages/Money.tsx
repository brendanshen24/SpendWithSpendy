import { StatusBar } from 'expo-status-bar';
import {NFCScanner} from 'components/NFCScanner';
import { Text, View, Button } from 'react-native';
import { useState } from 'react';
import TabSelector from "components/TabSelector";

export default function Money({balance, setBalance}:{balance: number, setBalance: (tab: number) => void }  ) {
    return (
        <View>
            <View>
                <Text className={"text-[86px] font-semibold text-center"}>
                    ${balance}
                </Text>
            </View>



        {/*    Balls*/}
        </View>
    );
}