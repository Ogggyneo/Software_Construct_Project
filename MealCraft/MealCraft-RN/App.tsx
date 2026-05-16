import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MealDetailScreen } from './src/screens/MealDetailScreen';
import { CookingMissionScreen } from './src/screens/CookingMissionScreen';
import { IngredientsScreen } from './src/screens/IngredientsScreen';
import { OrderFoodScreen } from './src/screens/OrderFoodScreen';
import { GroupChatScreen } from './src/screens/GroupChatScreen';
import { AIChatScreen } from './src/screens/AIChatScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const OrderStack = createNativeStackNavigator();

const TAB_ICONS: Record<string, string> = {
  'Khám phá': '🏠',
  'Nấu ăn':   '🍳',
  'Đặt món':  '🛍️',
  'AI Chat':  '🤖',
  'Profile':  '👤',
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="MealDetail" component={MealDetailScreen} />
      <HomeStack.Screen name="CookingMission" component={CookingMissionScreen} />
    </HomeStack.Navigator>
  );
}

function OrderStackNavigator() {
  return (
    <OrderStack.Navigator screenOptions={{ headerShown: false }}>
      <OrderStack.Screen name="OrderFood" component={OrderFoodScreen} />
      <OrderStack.Screen name="GroupChat" component={GroupChatScreen} />
    </OrderStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => (
          <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name] ?? '•'}</Text>
        ),
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 6, height: 62 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Khám phá" component={HomeStackNavigator} />
      <Tab.Screen name="Nấu ăn"   component={IngredientsScreen} />
      <Tab.Screen name="Đặt món"  component={OrderStackNavigator} />
      <Tab.Screen name="AI Chat"  component={AIChatScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppTabs /> : <LoginScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
