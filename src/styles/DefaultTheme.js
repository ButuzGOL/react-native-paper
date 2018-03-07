/* @flow */

import color from 'color';
import { indigo500, pinkA200, black, white, grey50, redA400 } from './colors';
import fonts from './fonts';

export default {
  dark: false,
  roundness: 2,
  colors: {
    primary: indigo500,
    accent: pinkA200,
    background: grey50,
    paper: white,
    error: redA400,
    text: black,
    disabled: color(black)
      .alpha(0.26)
      .rgb()
      .string(),
    placeholder: color(black)
      .alpha(0.38)
      .rgb()
      .string(),
    helperText: color(black)
      .alpha(0.54)
      .rgb()
      .string(),
    errorText: color(redA400)
      .alpha(0.87)
      .rgb()
      .string(),
  },
  fonts,
};
