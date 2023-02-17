import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { Image } from "react-native";

import HomeStackScreen from "../navigations/HomeStackScreen";
import ExploreScreen from "../screens/ExploreScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import BookListScreen from "../screens/BookListScreen";
import { icons, COLORS } from '../constants';


const Tab = createMaterialBottomTabNavigator();

const tabOptions = {
    showLabel: false,
    style: {
        height: '10%',
        backgroudColor: COLORS.black
    }
}

const MainTabScreen = () => (

        <Tab.Navigator 
            tabOptions={tabOptions}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => {
                    const tintColor = focused ? COLORS.white : COLORS.gray;
                    
                    switch (route.name) {
                        case 'Home':
                            return (
                                <Image 
                                    source={icons.dashboard_icon}
                                    resizeMode="contain"
                                    style={{
                                        tintColor: tintColor,
                                        width: 25,
                                        height: 25
                                    }}
                                />
                            )
                        case "Books":
                            return (
                                <Image
                                    source={icons.search_icon}
                                    resizeMode="contain"
                                    style={{
                                        tintColor: tintColor,
                                        width: 25,
                                        height: 25
                                    }}
                                />
                            )

                        case "Profile":
                            return (
                                <Image
                                    source={icons.notification_icon}
                                    resizeMode="contain"
                                    style={{
                                        tintColor: tintColor,
                                        width: 25,
                                        height: 25
                                    }}
                                />
                            )

                        case "Explore":
                            return (
                                <Image
                                    source={icons.menu_icon}
                                    resizeMode="contain"
                                    style={{
                                        tintColor: tintColor,
                                        width: 25,
                                        height: 25
                                    }}
                                />
                            )
                    }
                }
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeStackScreen}
            />
            <Tab.Screen
                name="Books"
                component={BookListScreen}
            />
            <Tab.Screen
                name="Profile"
                component={SignInScreen}
            />
            <Tab.Screen
                name="Explore"
                component={SignUpScreen}
            />
        </Tab.Navigator>

)

export default MainTabScreen;
