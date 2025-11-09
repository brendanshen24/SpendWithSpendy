import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import NFCScanner from 'components/NFCScanner';

import HomeScreen from './pages/homePage';
import CartScreen from './pages/shoppingCartPage';
import SettingsScreen from './pages/settingsScreen';

export type RootTabParamList = {
    Home: undefined;
    Cart: undefined;
    Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: { backgroundColor: '#fff', height: 60 },
                    tabBarLabelStyle: { fontSize: 13 },
                    tabBarIcon: ({ color, size }) => {
                        let iconName: keyof typeof Ionicons.glyphMap;

                        switch (route.name) {
                            case 'Home':
                                iconName = 'home';
                                break;
                            case 'Cart':
                                iconName = 'cart';
                                break;
                            case 'Settings':
                                iconName = 'settings';
                                break;
                            default:
                                iconName = 'ellipse';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#007aff',
                    tabBarInactiveTintColor: 'gray',
                })}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Cart" component={CartScreen} />
                <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
