import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function shoppingCartPage() {
  return (
    <View style={styles.container}>
      <Text>🏠 Shopping Cart Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
