import { StatusBar } from 'expo-status-bar';
import {NFCScanner} from 'components/NFCScanner';
import { Text, View, Button } from 'react-native';
import { useState } from 'react';
import TabSelector from "components/TabSelector";

export default function Money({balance, setBalance}:{balance: number, setBalance: (tab: number) => void }  ) {

    const [tabState, setTabState] = useState('Money'); // 'Money' or 'Store'

    return (
        <View>
            <View>
                <Text className={"text-3xl font-bold text-center"}>
                    {balance}
                </Text>
            </View>


            <NFCScanner onTagDetected={() => {
                console.log('Tag detected!');
            }} />

        {/*    Balls*/}
        </View>
    );
}