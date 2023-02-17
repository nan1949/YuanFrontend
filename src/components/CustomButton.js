import {Pressable, StyleSheet, Text} from "react-native";
import React from "react";


const CustomButton = (props) => {
    return (
         <Pressable
          onPress={props.onPressFunction}
          style={({ pressed }) => [
              {backgroundColor: pressed ? '#dddddd' : props.color},
              styles.button,
              {...props.style}
          ]}
      >
        <Text style={styles.text}>
          {props.title}
        </Text>
      </Pressable>
    )
}

export default CustomButton;

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
    alignItems: 'center',
  },
});
