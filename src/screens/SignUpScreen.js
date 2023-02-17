import {ScrollView, StatusBar, TouchableOpacity, StyleSheet, Text, View, Alert} from "react-native";
import React, {Component, useContext, useState} from "react";
import {Button, TextInput} from "react-native-paper";
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { register } from '../redux/actions';


const SignUpScreen = ({navigation}) => {
    const [data, setData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
    })

    const { isLogin, userData } = useSelector(state => state.loginReducer)
    const dispatch = useDispatch()


    return(
        <View style={styles.container}>
           <StatusBar backgroundColor='#8226f5' barStyle='"light-content' />
            <View style={styles.header}>

                <ScrollView>
                    <View style={styles.action}>
                        <FontAwesome
                            name="user-o"
                            color="#05375a"
                            size={20}
                        />
                        <TextInput
                            placeholder="Your Username"
                            style={styles.textInput}
                            autoCapitalize="none"
                            onChangeText={username => setData({...data, username})}
                        />
                      
                    </View>
              
                    <View style={styles.action}>
                        <FontAwesome
                            name="user-o"
                            color="#05375a"
                            size={20}
                        />
                        <TextInput
                            placeholder="Your Email"
                            style={styles.textInput}
                            autoCapitalize="none"
                            onChangeText={email => setData({...data, email})}
                        />
                     
                    </View>
              
                    <View style={styles.action}>
                        <Feather
                            name="lock"
                            color="#05375a"
                            size={20}
                        />
                        <TextInput
                            placeholder="Your Password"
                            secureTextEntry
                            style={styles.textInput}
                            autoCapitalize="none"
                            onChangeText={password => setData({...data, password})}
                        />
                        
                    </View>
                    <View style={styles.action}>
                        <Feather
                            name="lock"
                            color="#05375a"
                            size={20}
                        />
                        <TextInput
                            placeholder="Confirm Your Password"
                            secureTextEntry
                            style={styles.textInput}
                            autoCapitalize="none"
                            onChangeText={confirm_password => setData({...data, confirm_password})}
                        />
             
                    </View>
                        <View style={styles.button}>
                        <TouchableOpacity
                            style={styles.signIn}
                            onPress={() => dispatch(register(data))}
                        >
                            <LinearGradient
                                colors={['#8226f5', '#8226f5']}
                                style={styles.signIn}
                            >
                                <Text style={[styles.textSign, {
                                    color:'#fff'
                                }]}>Sign Up</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                    </View>

                </ScrollView>
            
            </View>

        </View>
    )
}



export default SignUpScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#8226f5'
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50
    },
    footer: {
        flex: Platform.OS === 'ios' ? 3 : 5,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    text_header: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 30
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    button: {
        alignItems: 'center',
        marginTop: 30
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    textPrivate: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20
    },
    color_textPrivate: {
        color: 'grey'
    }
  });

