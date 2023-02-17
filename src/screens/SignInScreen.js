import React, {useState, useEffect, useContext} from "react";
import {View, StyleSheet, Image, Text, TextInput, Alert, StatusBar, TouchableOpacity} from "react-native";
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../redux/actions";


 const SignInScreen = ({ navigation })  => {

    const [data, setData] = useState({
        email: '',
        password: ''
    });
   

    const { isLogin, userData } = useSelector(state => state.loginReducer)
    const dispatch = useDispatch()


    return (
    <View style={{flex:1}}>
        <TextInput 
            autoCapitalize="none" 
            keyboardType="email-address" 
            style={{marginTop:200,marginHorizontal:40,height:40}} 
            placeholder="Enter email" 
            value={data.email} 
            onChangeText={email => setData({...data, email})}
        />
        <TextInput 
            autoCapitalize="none" 
            secureTextEntry 
            style={{marginTop:20,marginHorizontal:40,height:40}} 
            placeholder="Enter password" value={data.password} 
            onChangeText={password =>setData({...data, password})}
        />
        <TouchableOpacity onPress={() => dispatch(login(data))}> 
          <Text style={{marginTop:20,color:'black',textAlign:'center'}}>
     
            Login
          </Text>
        </TouchableOpacity>
        <Text>
            You are logined as {userData.username}
        </Text>
      </View>
    )
}

export default SignInScreen;

