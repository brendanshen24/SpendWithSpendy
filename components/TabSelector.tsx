import { View, Text, TouchableOpacity } from 'react-native';

function TabSelector({ selectedTab, setSelectedTab }: { selectedTab: string, setSelectedTab: (tab: string) => void }) {
    return (
        <View className="flex flex-row justify-center items-center py-[11px] gap-0">
            <TouchableOpacity
                className={`flex flex-row justify-center items-center px-4 py-2 rounded ${
                    selectedTab === 'Money' ? 'bg-[#1F1B15]' : 'bg-[#E2E6EA]'
                }`}
                onPress={() => setSelectedTab('Money')}
            >
                <Text className={`text-xl font-bold ${
                    selectedTab === 'Money' ? 'text-[#E2E6EA]' : 'text-[#4B4D4E]'
                }`}>
                    Money
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className={`flex flex-row justify-center items-center px-4 py-2 rounded ml-2 ${
                    selectedTab === 'Store' ? 'bg-[#1F1B15]' : 'bg-[#E2E6EA]'
                }`}
                onPress={() => setSelectedTab('Store')}
            >
                <Text className={`text-xl font-bold ${
                    selectedTab === 'Store' ? 'text-white' : 'text-gray-600'
                }`}>
                    Store
                </Text>
            </TouchableOpacity>
        </View>
    );
}

export default TabSelector;