import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Import your screens
import Home from './home';
import Create from './create';
import Settings from './settings';
import ScanHistory from '../../components/ScanHistory';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function SettingsStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsMain"
        component={Settings}
        options={{ headerShown: false }} // Nasconde l'header per la schermata principale delle impostazioni
      />
      <Stack.Screen
        name="ScanHistory"
        component={ScanHistory}
        options={{ title: t('scanHistory.title') }}
      />
    </Stack.Navigator>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
      <Tab.Navigator screenOptions={{ tabBarActiveTintColor: 'blue' }}>
        <Tab.Screen
          name="home"
          component={Home}
          options={{
            title: t('scan.title'),
            tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
          }}
        />
        <Tab.Screen
          name="create"
          component={Create}
          options={{
            title: t('create.title'),
            tabBarIcon: ({ color }) => <Ionicons size={28} name="qr-code" color={color} />,
          }}
        />
        <Tab.Screen
          name="settings"
          component={SettingsStack} // Use the Stack Navigator here
          options={{
            title: t('settings.title'),
            tabBarIcon: ({ color }) => <Ionicons size={28} name="cog" color={color} />,
          }}
        />
      </Tab.Navigator>
  );
}
