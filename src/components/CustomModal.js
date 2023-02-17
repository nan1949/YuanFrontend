import {Modal, Pressable, StyleSheet, Text, View} from "react-native";
import React from "react";

const CustomModal = (props) => {
    return (
        <Modal
            visible={props.showWarning}
            transparent
            onRequestClose={props.onRequestCloseFunction}
            animationType='slide'
        >
            <View style={styles.centered_view}>
                <View style={styles.warning_modal }>
                    <View style={styles.warning_title}>
                        <Text style={styles.text}>WARNING!</Text>
                    </View>
                    <View style={styles.warning_body}>
                        <Text style={styles.text}>The name must be longer than 3 characters.</Text>
                    </View>
                    <Pressable
                      onPress={props.onRequestCloseFunction}
                      style={styles.warning_button}
                  >
                    <Text style={styles.text}>OK</Text>
                  </Pressable>
                </View>
            </View>
        </Modal>
    )
}

export default CustomModal;

const styles = StyleSheet.create({

  text: {
    color: '#000000',
    fontSize: 20,
    margin: 10,
      textAlign: 'center',
  },

  button:{
    width: 150,
    height: 50,
    // backgroundColor: '#00ff00',
    alignItems: 'center',
  },
    centered_view: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000099'
    },
    warning_modal: {
      width: 300,
        height: 300,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 20,
    },
    warning_title: {
      height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff0',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
    },
    warning_body: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center'
    },
    warning_button: {
      backgroundColor: '#00ffff',
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
    },
});
