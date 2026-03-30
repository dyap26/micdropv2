import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function RootNavigator() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return null; // splash screen stays visible until this resolves
  }

  return <AppNavigator isLoggedIn={isLoggedIn} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
