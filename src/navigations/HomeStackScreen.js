import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from '@react-navigation/native';
import HomeScreen from "../screens/HomeScreen";
import { View } from "react-native-animatable";
import Icon from 'react-native-vector-icons/Ionicons'

const HomeStack = createStackNavigator();

const HomeStackScreen = ({navigation}) => {
    const {colors} = useTheme();

    return (
        <HomeStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroudColor: colors.background,
                    shadowColor: colors.background,
                    elevation: 0,
                },
                headerTintColor: colors.text,
            }}
        >
            <HomeStack.Screen
                name="Overview"
                component={HomeScreen}
                options={{
                    title: 'Overview',
                    headerLeft: () => (
                        <View style={{marginLeft: 10}}>
                            <Icon.Button
                                name="ios-menu"
                                size={25}
                                backgroundColor={colors.background}
                                color={colors.text}
                                onPress={() => navigation.openDrawer()}
                            />
                        </View>
                    )
                }}
            />

        </HomeStack.Navigator>
    )
}


export default HomeStackScreen;