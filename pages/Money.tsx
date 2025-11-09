import { Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import Ball from "components/Ball";

export default function Money({ balance, setBalance }: { balance: number, setBalance: (tab: number) => void }) {
    const [containerHeight, setContainerHeight] = useState(0);
    const ballIndices = Array.from({ length: balance }, (_, i) => i);

    return (
        <View style={{ flex: 1 }}>
            <View style={{ paddingVertical: 20 }}>
                <Text className={"text-[86px] font-semibold text-center"}>
                    ${balance}
                </Text>
            </View>

            <View
                style={{ flex: 1, overflow: 'hidden', marginBottom: 30}}
                onLayout={(event) => {
                    setContainerHeight(event.nativeEvent.layout.height);
                }}
            >
                {containerHeight > 0 && ballIndices.map((index) => (
                    <Ball
                        key={index}
                        index={index}
                        totalBalls={balance}
                        containerHeight={containerHeight}
                    />
                ))}
            </View>
        </View>
    );
}