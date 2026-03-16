import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { AuthStackParamList } from './types';
import LoginScreen from '../screens/auth/LoginScreen';
import AppNavigator from './AppNavigator';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, setUser, rehydrate, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await rehydrate();
      if (token) {
        try {
          const { data } = await api.get('/me');
          setUser(data);
        } catch {
          await logout();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppNavigator />
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
