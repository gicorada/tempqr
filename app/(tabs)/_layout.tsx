import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// import hook
import { useTranslation } from "react-i18next";




export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="home"
        options={{
          title: t('scan.title'),
          tabBarIcon: ({ color }) => <Ionicons name={'home'} size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: t('create.title'),
          tabBarIcon: ({ color }) => <Ionicons size={28} name="qr-code" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ color }) => <Ionicons size={28} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
