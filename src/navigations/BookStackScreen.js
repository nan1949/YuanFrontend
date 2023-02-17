import React from "react";
import {createMaterialBottomTabNavigator} from "@react-navigation/material-bottom-tabs";
import {useTheme, Avatar} from 'react-native-paper';
import {createStackNavigator} from "@react-navigation/stack";
import Icon from 'react-native-vector-icons/Ionicons'
import {View} from "react-native-animatable";

import BookList from "../components/BookList"
import BookDetail from "../screens/BookDetail"


const BookStack = createStackNavigator();

const BookStackScreen = ({navigation}) => {
    
    return (
        <BookStack.Navigator
        >
            <BookStack.Screen
                name="BookList"
                component={BookList}
            />
            <BookStack.Screen 
                name="BookDetail"
                component={BookDetail}
            />

        </BookStack.Navigator>
    )
}

export default BookStackScreen;