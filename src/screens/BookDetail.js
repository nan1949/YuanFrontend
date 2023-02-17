import React, {useEffect, useState} from 'react';
import { FlatList, Text, View} from "react-native";
import { TouchableOpacity } from 'react-native-gesture-handler';

import { useSelector, useDispatch } from "react-redux";
import { getBooks } from "../redux/actions";


const BookDetail = ({ navigation }) => {

    return (

        <View><Text>this is book detail</Text></View>
    )
}
  
;

export default BookDetail;