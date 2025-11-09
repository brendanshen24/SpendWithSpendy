import React from 'react';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  const money: number = 20.0; // float

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <View className="absolute top-4 left-4">
        <Text className="text-2xl font-bold">{`$${money.toFixed(2)}`}</Text>
      </View>

      <Text className="text-lg">🏠 Home Page</Text>
    </View>
  );
}