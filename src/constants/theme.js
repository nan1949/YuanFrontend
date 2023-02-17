
import { useWindowDimensions, Platform, Dimensions } from 'react-native';
const { width, height } = Dimensions.get("window");

/* Return the App Theme Object */
export default function getTheme(dark) {
  const { width, height } = useWindowDimensions();
  const normalize = (size, max) => Math.min(size * (width / 375), max);

  return {
    dark,
    width,
    height,
    ios: Platform.OS === 'ios',
    margin: normalize(20, 35),
    colors: {
      white: '#ffffff',
      primary: '#ff6b6b',
      success: '#20bf6b',
      warning: '#f39c12',
      error: '#e74c3c',
      text: dark ? '#f2f2f2' : '#1a1a1a',
      card: dark ? '#000000' : '#ffffff',
      background: dark ? '#1a1a1a' : '#f2f2f2',
      border: dark ? '#f2f2f2dd' : '#1a1a1add',
      button: dark ? '#1a1a1add' : '#f2f2f2dd',
    },
    font: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
    normalize,
  };
}

export const COLORS = {
  // base colors
  primary: "#F96D41",
  secondary: "#25282F",

  // colors
  black: "#1E1B26",
  white: "#FFFFFF",
  lightGray: "#64676D",
  lightGray2: "#EFEFF0",
  lightGray3: '#D4D5D6',
  lightGray4: '#7D7E84',
  gray: "#2D3038",
  gray1: "#282C35",
  darkRed: "#31262F",
  lightRed: "#C5505E",
  darkBlue: "#22273B",
  lightBlue: "#424BAF",
  darkGreen: "#213432",
  lightGreen: "#31Ad66",

};

export const SIZES = {
  // global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  padding2: 36,

  // font sizes
  largeTitle: 50,
  h1: 30,
  h2: 22,
  h3: 16,
  h4: 14,
  body1: 30,
  body2: 20,
  body3: 16,
  body4: 14,

  // app dimensions
  width,
  height
};

export const FONTS = {
  largeTitle: { fontFamily: "Roboto-regular", fontSize: SIZES.largeTitle, lineHeight: 55 },
  h1: { fontFamily: "Roboto-Black", fontSize: SIZES.h1, lineHeight: 36 },
  h2: { fontFamily: "Roboto-Bold", fontSize: SIZES.h2, lineHeight: 30 },
  h3: { fontFamily: "Roboto-Bold", fontSize: SIZES.h3, lineHeight: 22 },
  h4: { fontFamily: "Roboto-Bold", fontSize: SIZES.h4, lineHeight: 22 },
  body1: { fontFamily: "Roboto-Regular", fontSize: SIZES.body1, lineHeight: 36 },
  body2: { fontFamily: "Roboto-Regular", fontSize: SIZES.body2, lineHeight: 30 },
  body3: { fontFamily: "Roboto-Regular", fontSize: SIZES.body3, lineHeight: 22 },
  body4: { fontFamily: "Roboto-Regular", fontSize: SIZES.body4, lineHeight: 22 },
};