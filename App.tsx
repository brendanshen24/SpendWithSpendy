import './global.css';
import { useState } from 'react';
import Money from "pages/Money";
import {Text, View} from "react-native";
import TabSelector from "./components/TabSelector";
import Store from "pages/Store";

export default function App() {
    const [balance, setBalance] = useState(24);
    const [tabState, setTabState] = useState('Money');

    return (
        <>
            <View className='h-full w-full font-sf-pro-regular'>
                {/*Spacer*/}
                <View className="flex w-full h-[80px]"></View>

                {/*Money/Store selector*/}
                <View className="flex flex-row justify-center items-center py-[11px]">
                    <TabSelector selectedTab={tabState} setSelectedTab={setTabState} />
                </View>


                {tabState === 'Money' && <Money balance={balance} setBalance={setBalance}/>}

                {tabState === 'Store' && <Store balance={balance} setBalance={setBalance}/>}

                {tabState === 'Lock' && <View />}
            </View>
        </>
    );
}