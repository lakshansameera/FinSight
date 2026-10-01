import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { TabParamList } from "./types";
import HomeScreen from "@/screens/HomeScreen";
import TransactionsScreen from "@/screens/TransactionsScreen";
import ScanScreen from "@/screens/ScanScreen";
import InsightsScreen from "@/screens/InsightsScreen";
import OffersScreen from "@/screens/OffersScreen";  

const Tab = createBottomTabNavigator<TabParamList>();

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Tab.Navigator ScreenOptions={{ headerShown: false }}>
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Transactions" component={TransactionsScreen} />
                <Tab.Screen name="Scan" component={ScanScreen} />
                <Tab.Screen name="Insights" component={InsightsScreen} />
                <Tab.Screen name="Offers" component={OffersScreen} />
            </Tab.Navigator>    
        </NavigationContainer>    
    );
}
