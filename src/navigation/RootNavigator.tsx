import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "./types";
import { NavBar } from "@/components/NavBar";
import HomeScreen from "@/screens/HomeScreen";
import TransactionsScreen from "@/screens/TransactionsScreen";
import ScanScreen from "@/screens/ScanScreen";
import InsightsScreen from "@/screens/InsightsScreen";
import OffersScreen from "@/screens/OffersScreen";  
import TransactionFormScreen from '@/screens/TransactionFormScreen';
import BudgetsScreen from '@/screens/BudgetsScreen';
import BillsScreen from '@/screens/BillsScreen';
import BillDetailScreen from '@/screens/BillDetailScreen';
import SmsReviewScreen from '@/screens/SmsReviewScreen';
import OfferDetailScreen from '@/screens/OfferDetailScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import GalleryScreen from '@/screens/GalleryScreen';
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
    return (

            <Tab.Navigator
                screenOptions={{ headerShown: false }}
                tabBar={(props) => <NavBar {...props} />}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Transactions" component={TransactionsScreen} />
                <Tab.Screen name="Scan" component={ScanScreen} />
                <Tab.Screen name="Insights" component={InsightsScreen} />
                <Tab.Screen name="Offers" component={OffersScreen} />
                
            </Tab.Navigator>        

    );

}

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="Tabs" component={Tabs} />
                <Stack.Screen name="TransactionForm" component={TransactionFormScreen} />
                <Stack.Screen name="Budgets" component={BudgetsScreen} />
                <Stack.Screen name="Bills" component={BillsScreen} />
                <Stack.Screen name="BillDetail" component={BillDetailScreen} />
                <Stack.Screen name="SmsReview" component={SmsReviewScreen} />
                <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Gallery" component={GalleryScreen} /> 
            </Stack.Navigator>
        </NavigationContainer>
    );
}
