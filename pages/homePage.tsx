import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';

export default function HomeScreen() {
  const money: number = 20.0; // float

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Replace this block to ensure true centering and bold font */}
      <View className="w-full h-1/4 items-center justify-center">
        <Text
          className="text-5xl font-extrabold"
          style={{ fontSize: 48, fontWeight: '800', textAlign: 'center' }}
        >
          {`$${money.toFixed(2)}`}
        </Text>
      </View>
    </SafeAreaView>
  );
}