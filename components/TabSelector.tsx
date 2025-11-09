import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

function TabSelector({
                         selectedTab,
                         setSelectedTab,
                     }: {
    selectedTab: string;
    setSelectedTab: (tab: string) => void;
}) {
    return (
        <View className="flex flex-row justify-center items-center">
            <TouchableOpacity
                className={`flex flex-row justify-center items-center py-2 px-4 rounded-l-md ${
                    selectedTab === 'Money' ? 'bg-[#1F1B15]' : 'bg-[#E2E6EA]'
                }`}
                onPress={() => setSelectedTab('Money')}
            >
                <Text
                    className={`text-xl font-bold ${
                        selectedTab === 'Money' ? 'text-[#E2E6EA]' : 'text-[#4B4D4E]'
                    }`}
                >
                    Money
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className={`flex flex-row justify-center items-center py-2 px-4 ${
                    selectedTab === 'Store' ? 'bg-[#1F1B15]' : 'bg-[#E2E6EA]'
                }`}
                onPress={() => setSelectedTab('Store')}
            >
                <Text
                    className={`text-xl font-bold ${
                        selectedTab === 'Store' ? 'text-[#E2E6EA]' : 'text-[#4B4D4E]'
                    }`}
                >
                    Store
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className={`flex flex-row justify-center items-center py-2 px-4 rounded-r-md ${
                    selectedTab === 'Parent' ? 'bg-[#1F1B15]' : 'bg-[#E2E6EA]'
                }`}
                onPress={() => setSelectedTab('Parent')}
            >
                <MaterialIcons
                    name="lock"
                    size={24}
                    color={selectedTab === 'Parent' ? '#E2E6EA' : '#4B4D4E'}
                />
            </TouchableOpacity>
        </View>
    );
}

export default TabSelector;
