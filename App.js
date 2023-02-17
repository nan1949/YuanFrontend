import React, { useMemo, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

import { DrawerContent } from './src/screens/DrawerContent';
import MainTabScreen from './src/navigations/MainTabScreen';
import SupportScreen from './src/screens/SupportScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BookmarkScreen from './src/screens/BookmarkScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { Store } from './src/redux/store';
import getTheme from './src/constants/theme';
import { ThemeContext } from './src/components/context';

const Drawer = createDrawerNavigator();

const App = () => {

  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const themeContext = useMemo(() => ({
    toggleTheme: () => {
      setIsDarkTheme(isDarkTheme => !isDarkTheme)
    },
  }), [])


  return (
    <ReduxProvider store={Store}>
      <ThemeContext.Provider value={themeContext}>
        <NavigationContainer theme={getTheme(isDarkTheme)}>
          <Drawer.Navigator 
            drawerContent={props => <DrawerContent {...props} />}
            screenOptions={{
              headerShown: false
            }}
          >
              <Drawer.Screen name="HomeDrawer" component={MainTabScreen} />
              <Drawer.Screen name="SupportScreen" component={SupportScreen} />
              <Drawer.Screen name="SettingsScreen" component={SettingsScreen} />
              <Drawer.Screen name="BookmarkScreen" component={BookmarkScreen} />
            </Drawer.Navigator>
        </NavigationContainer>
      </ThemeContext.Provider>
    </ReduxProvider>
  )
};

export default App;

