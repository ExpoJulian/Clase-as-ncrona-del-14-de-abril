import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';

import HomeScreen     from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import { initDB, getPreferences } from './db/database';

const Tab = createBottomTabNavigator();

// Icono simple en texto (evita dependencias extra)
function TabIcon({ name, focused, color }) {
  const icons = { Home: '🏠', Settings: '⚙️' };
  return (
    <View style={{ opacity: focused ? 1 : 0.5 }}>
    </View>
  );
}

export default function App() {
  const [ready, setReady]   = useState(false);
  const [theme, setTheme]   = useState('light');

  useEffect(() => {
    (async () => {
      try {
        await initDB();
        const prefs = await getPreferences();
        if (prefs) setTheme(prefs.theme);
      } catch (e) {
        console.error('Error inicializando BD:', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Refresca el tema cuando regresa a la app desde Settings
  const refreshTheme = useCallback(async () => {
    try {
      const prefs = await getPreferences();
      if (prefs) setTheme(prefs.theme);
    } catch (_) {}
  }, []);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const navTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...navTheme,
        colors: {
          ...navTheme.colors,
          background:   theme === 'dark' ? '#0F0F1A' : '#F1F5F9',
          card:         theme === 'dark' ? '#1E1E2E' : '#FFFFFF',
          border:       theme === 'dark' ? '#2D2D3F' : '#E2E8F0',
          primary:      '#6366F1',
          text:         theme === 'dark' ? '#F1F5F9' : '#0F172A',
          notification: '#6366F1',
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            const icons = { Hábitos: '🏠', Configuración: '⚙️' };
            return (
              <View style={{ opacity: focused ? 1 : 0.45 }}>
              </View>
            );
          },
          tabBarLabel: route.name,
          tabBarActiveTintColor:   '#6366F1',
          tabBarInactiveTintColor: theme === 'dark' ? '#64748B' : '#94A3B8',
          tabBarStyle: {
            backgroundColor: theme === 'dark' ? '#1E1E2E' : '#FFFFFF',
            borderTopColor:  theme === 'dark' ? '#2D2D3F' : '#E2E8F0',
            paddingBottom: 4,
            height: 56,
          },
          headerStyle: {
            backgroundColor: theme === 'dark' ? '#1E1E2E' : '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme === 'dark' ? '#2D2D3F' : '#E2E8F0',
          },
          headerTintColor: theme === 'dark' ? '#F1F5F9' : '#0F172A',
        })}
      >
        <Tab.Screen
          name="Hábitos"
          component={HomeScreen}
          options={{ tabBarLabel: '🏠  Hábitos' }}
        />
        <Tab.Screen
          name="Configuración"
          component={SettingsScreen}
          options={{ tabBarLabel: '⚙️  Configuración' }}
          listeners={{ focus: refreshTheme }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
});