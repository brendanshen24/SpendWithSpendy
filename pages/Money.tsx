import { StatusBar } from 'expo-status-bar';
// import { NFCScanner } from 'components/NFCScanner'; // Not used in this snippet
import { Text, View, Button } from 'react-native';
import { useState } from 'react';
// import TabSelector from "components/TabSelector"; // Not used in this snippet
import Ball from "components/Ball"; // Import the new Ball component

export default function Money({ balance, setBalance }: { balance: number, setBalance: (tab: number) => void }) {
    // State to store the height of the balls container view
    const [containerHeight, setContainerHeight] = useState(0);

    // Create an array to map over for rendering the balls
    const ballIndices = Array.from({ length: balance }, (_, i) => i);

    return (
        <View style={{ flex: 1 }}>
            {/* Top View for the balance display */}
            <View style={{ paddingVertical: 20 }}>
                <Text className={"text-[86px] font-semibold text-center"}>
                    ${balance}
                </Text>
            </View>

            {/* Balls Container - fills the rest of the screen */}
            <View
                style={{ flex: 1, overflow: 'hidden' }}
                // Use onLayout to dynamically get the height of the container
                onLayout={(event) => {
                    setContainerHeight(event.nativeEvent.layout.height);
                }}
            >
                {/* Render the balls only after the container height is known */}
                {containerHeight > 0 && ballIndices.map((index) => (
                    <Ball
                        key={index}
                        index={index} // Used for calculating the final resting position (stacking order)
                        totalBalls={balance}
                        containerHeight={containerHeight} // Pass the known height
                    />
                ))}

            </View>
        </View>
    ); //test comment
}