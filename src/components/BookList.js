import React, {useEffect, useState} from 'react';
import {
    View, FlatList, ScrollView,
    StyleSheet, Pressable,
    ActivityIndicator,
} from "react-native";
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useTheme, useNavigation } from '@react-navigation/native';
import AntDesign from "react-native-vector-icons/AntDesign";
import { useSelector, useDispatch } from "react-redux";
import { getBooks } from "../redux/actions";
import SearchBar from './SearchBar';

import Text from './Text';
import Book from './Book';


const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);


const BookList = ({ books, title }) => {
    const { width, margin, colors } = useTheme();
    const navigation = useNavigation();
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: ({ contentOffset }) => {
          scrollX.value = contentOffset.x;
        },
    });

    const styles = StyleSheet.create({
        list: {
          backgroundColor: colors.card,
          paddingTop: (title === 'Reading' ? margin : 0),
        },
        heading: {
          paddingTop: margin,
          paddingHorizontal: margin,
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        listContainer: {
          padding: margin,
        },
        emptyContainer: {
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          width: width - margin * 2,
          paddingVertical: margin * 3,
          backgroundColor: colors.background,
        },
        emptyText: {
          padding: margin,
        },
      });

      const EmptyList = () => (
        <Pressable style={styles.emptyContainer}>
          <AntDesign color={colors.text} size={27} name="book" />
          <Text size={16} center style={styles.emptyText}>
            {'I\'m lonely. \n Add something here.'}
          </Text>
        </Pressable>
      );
    
      return (
        <View style={styles.list}>
          <View style={styles.heading}>
            <Text size={17} bold>{title}</Text>
            <Text size={17}>{books.length}</Text>
          </View>
          <AnimatedFlatList
            horizontal
            onScroll={scrollHandler}
            scrollEventThrottle={1}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            data={books}
            keyExtractor={(i) => i.bookId}
            renderItem={({ item, index }) => (
              <Pressable>
                <Book book={item} index={index} scrollX={scrollX} />
              </Pressable>
            )}
            ListEmptyComponent={<EmptyList />}
          />
        </View>
      );
    

    // 旧版本
    // const { books } = useSelector(state => state.userReducer);
    // const dispatch = useDispatch();
    // const [searchPhrase, setSearchPhrase] = useState("");
    // const [clicked, setClicked] = useState(false);


    // useEffect(() => {
    //     dispatch(getBooks(q='日本'));
    // },[]);

    // return (
    //         <View>
    //             <SearchBar 
    //                 searchPhrase={searchPhrase}
    //                 setSearchPhrase={setSearchPhrase}
    //                 clicked={clicked}
    //                 setClicked={setClicked}
    //             />
    //             <ScrollView>
    //                 {
    //                     books.map((item) => {
    //                         return (
    //                             <View key={item.id}>
    //                                 <TouchableOpacity
    //                                     onPress={() => navigation.navigate('BookDetail')}
    //                                 >
    //                                     <Text style={styles.title}> {item.name} </Text>
    //                                 </TouchableOpacity>
    //                                 <Text> {item.author}</Text>
    //                                 <Text>{item.description}</Text>
                                    
    //                             </View>
    //                         )
    //                     })
    //                 }

    //             </ScrollView>
    //         </View>
    // )
}
  
;

export default React.memo(BookList);

// const styles = StyleSheet.create({
//     root: {
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     title: {
//       width: "100%",
//       marginTop: 20,
//       fontSize: 25,
//       fontWeight: "bold",
//       marginLeft: "10%",
//     },
//   });