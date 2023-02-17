import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    FlatList,
    Button
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getTopics, getBooks } from '../redux/actions';

import { COLORS, FONTS, SIZES, icons, images } from '../constants';


function BookListScreen({ navigation }) {

  const [selectedTopic, setSelectedTopic] = useState('');
  const { topics, books } = useSelector(state => state.topicsReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTopics());
    dispatch(getBooks('小说'));
  }, []);


  function renderTopicHeader() {

    const renderItem = ({item}) => {
      return (
        <TouchableOpacity
          style={{ flex: 1, marginRight: SIZES.padding }}
          onPress={() => {
            setSelectedTopic(item.name);
            dispatch(getBooks(item.name));
          }}
        >
          {
            selectedTopic == item.name &&
            <Text style={{...FONTS.h2, color: COLORS.white}}>{item.name}</Text>
          }
          {
            selectedTopic != item.name &&
            <Text style={{...FONTS.h2, color: COLORS.lightGray}}>{item.name}</Text>
          }
        </TouchableOpacity>
      )
    }

    return (
      <View style={{ flex: 1, paddingLeft: SIZES.padding }}>
        <FlatList 
          data={topics}
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={ item => `${item.name}`}
          horizontal
        />
      </View>
    )
  }

  function renderBookData() {

    const renderItem = ({item}) => {
      return (
        <View style={{ marginVertical: SIZES.base }}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row' }}
            onPress={() => console.log('book item pressed')}
          >
            <Image 
              source={{uri: item.book_cover}}
              resizeMode='cover'
              style={{ width: 100, height: 150, borderRadius: 10 }}
            />

            {/* Book name and author */}
            <View style={{ flex: 1, marginLeft: SIZES.radius }}>
              <View>
                <Text style={{paddingRight: SIZES.padding, ...FONTS.h2, color: COLORS.white}}>{item.name}</Text>
                <Text style={{...FONTS.h3, color: COLORS.lightGray}}>{item.author}</Text>
              </View>
                
              {/* Book Info */}
              <View style={{ flexDirection: 'row', marginTop: SIZES.radius }}>
                <Image 
                  source={icons.page_filled_icon}
                  resizeMode='contain'
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: COLORS.lightGray
                  }}
                />
                <Text style={{ ...FONTS.body4, color: COLORS.lightGray, paddingHorizontal: SIZES.radius }}>{item.page_no}</Text>

                <Image 
                  source={icons.read_icon}
                  resizeMode='contain'
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: COLORS.lightGray
                  }}
                />
                <Text style={{ ...FONTS.body4, color: COLORS.lightGray, paddingHorizontal: SIZES.radius }}>{item.words_total}</Text>
              </View>
              
            </View>

          </TouchableOpacity>
        </View>
      )
     
    }

    return (
      <View style={{ flex: 1, marginTop: SIZES.radius, paddingLeft: SIZES.padding }}>
        <FlatList 
          data={books}
          renderItem={renderItem}
          keyExtractor={item => `${item.id}`}
          showsVerticalScrollIndicator={false}
        />
      </View>
    )
  }

  return (
 
      <ScrollView style={{ marginTop: SIZES.radius }}>
        <View style={{ marginTop: SIZES.padding }}>
          <View>
            {renderTopicHeader()}
          </View>
          {/* <View>
            {renderBookData()}
          </View> */}
          <Text>Book list</Text>
        </View>
      </ScrollView>

 
     
    
  )
}

export default React.memo(BookListScreen);
