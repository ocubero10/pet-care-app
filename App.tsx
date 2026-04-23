import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';

export default function App(): React.ReactElement {
  useEffect(() => {
    // Initialize app - load saved auth state, etc.
    // TODO: Load stored auth token and user data
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <PaperProvider>
          <RootNavigator />
          <StatusBar style="dark" />
        </PaperProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}
