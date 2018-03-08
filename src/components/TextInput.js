/* @flow */

import * as React from 'react';
import colorModule from 'color';
import {
  View,
  Animated,
  TextInput as NativeTextInput,
  StyleSheet,
} from 'react-native';
import Text from './Typography/Text';
import withTheme from '../core/withTheme';
import { black, white } from '../styles/colors';
import type { Theme } from '../types';

const AnimatedText = Animated.createAnimatedComponent(Text);

const minimizedLabelYOffset = -22;
const maximizedLabelFontSize = 16;
const minimizedLabelFontSize = 12;
const labelWiggleXOffset = 4;
const underlineAreaHeight = 16;

type Props = {
  /**
   * If true, user won't be able to interact with the component.
   */
  disabled?: boolean,
  /**
   * The text to use for the floating label.
   */
  label?: string,
  /**
   * Placeholder for the input.
   */
  placeholder?: string,
  /**
   * Helper text to display under the input.
   */
  helperText?: string,
  /**
   * Whether to style the TextInput with error style.
   */
  hasError: boolean,
  /**
   * Text to replace the helper text with on error.
   */
  errorText?: string,
  /**
   * Callback that is called when the text input's text changes. Changed text is passed as an argument to the callback handler.
   */
  onChangeText?: Function,
  /**
   * Underline color of the input.
   */
  underlineColor?: string,
  /**
   * Whether the input can have multiple lines.
   */
  multiline?: boolean,
  /**
   * The number of lines to show in the input (Android only).
   */
  numberOfLines?: number,
  /**
   * Callback that is called when the text input is focused.
   */
  onFocus?: Function,
  /**
   * Callback that is called when the text input is blurred.
   */
  onBlur?: Function,
  /**
   * Value of the text input.
   */
  value?: string,
  style?: any,
  /**
   * @optional
   */
  theme: Theme,
};

type State = {
  focused: Animated.Value,
  errorShown: Animated.Value,
  placeholder: ?string,
};

/**
 * TextInputs allow users to input text.
 *
 * <div class="screenshots">
 *   <figure>
 *     <img src="screenshots/textinput.unfocused.png" />
 *     <figcaption>Unfocused</span>
 *   </figure>
 *   <figure>
 *     <img src="screenshots/textinput.focused.png" />
 *     <figcaption>Focused</figcaption>
 *   </figure>
 * </div>
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { TextInput } from 'react-native-paper';
 *
 * class MyComponent extends React.Component {
 *   state = {
 *     text: ''
 *   };
 *
 *   render(){
 *     return (
 *       <TextInput
 *         label='Email'
 *         value={this.state.text}
 *         onChangeText={text => this.setState({ text })}
 *       />
 *     );
 *   }
 * }
 * ```
 *
 * @extends TextInput props https://facebook.github.io/react-native/docs/textinput.html#props
 *
 */

class TextInput extends React.Component<Props, State> {
  static defaultProps = {
    disabled: false,
    hasError: false,
    multiline: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      focused: new Animated.Value(0),
      errorShown: new Animated.Value(props.hasError ? 1 : 0),
      placeholder: '',
    };
  }

  state: State;

  componentWillReceiveProps(nextProps) {
    if (nextProps.hasError !== this.props.hasError) {
      (nextProps.hasError ? this._animateFocus : this._animateBlur)(
        this.state.errorShown
      );
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.value !== this.props.value ||
        prevProps.placeholder !== this.props.placeholder) &&
      this.props.value === ''
    ) {
      this._setPlaceholder();
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timer);
  }

  _setPlaceholder = () => {
    clearTimeout(this._timer);
    this._timer = setTimeout(
      () =>
        this.setState({
          placeholder: this.props.placeholder,
        }),
      50
    );
  };

  _removePlaceholder = () =>
    this.setState({
      placeholder: '',
    });

  _timer: any;
  _root: any;
  _setRef: any = (c: Object) => {
    this._root = c;
  };

  _animateFocus = (animatedValue: Animated.Value) => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 150,
    }).start(this._setPlaceholder);
  };

  _animateBlur = (animatedValue: Animated.Value) => {
    this._removePlaceholder();
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 180,
    }).start();
  };

  _handleFocus = (...args) => {
    this._animateFocus(this.state.focused);
    if (this.props.onFocus) {
      this.props.onFocus(...args);
    }
  };

  _handleBlur = (...args) => {
    this._animateBlur(this.state.focused);
    if (this.props.onBlur) {
      this.props.onBlur(...args);
    }
  };

  setNativeProps(...args) {
    return this._root.setNativeProps(...args);
  }

  isFocused(...args) {
    return this._root.isFocused(...args);
  }

  clear(...args) {
    return this._root.clear(...args);
  }

  focus(...args) {
    return this._root.focus(...args);
  }

  blur(...args) {
    return this._root.blur(...args);
  }

  renderUnderlineText(text?: string, containerStyle: Object, color: string) {
    return (
      text && (
        <Animated.View style={containerStyle}>
          {text && <Text style={[styles.helperText, { color }]}>{text}</Text>}
        </Animated.View>
      )
    );
  }

  static getHelperTextColor(dark: boolean) {
    return dark
      ? colorModule(white)
          .alpha(0.7)
          .rgb()
          .string()
      : colorModule(black)
          .alpha(0.54)
          .rgb()
          .string();
  }

  render() {
    const {
      value,
      disabled,
      label,
      helperText,
      hasError,
      errorText,
      underlineColor,
      style,
      theme,
      ...rest
    } = this.props;
    const { colors, fonts, dark } = theme;
    const fontFamily = fonts.regular;
    const {
      primary: primaryColor,
      disabled: inactiveColor,
      error: errorColor,
      errorText: errorTextColor,
    } = colors;

    let inputTextColor, labelColor, bottomLineColor, helperTextColor;

    if (!disabled) {
      inputTextColor = colors.text;
      labelColor = (hasError && errorColor) || primaryColor;
      bottomLineColor = underlineColor || primaryColor;
      helperTextColor =
        underlineColor ||
        (hasError && errorTextColor) ||
        TextInput.getHelperTextColor(dark);
    } else {
      inputTextColor = labelColor = bottomLineColor = helperTextColor = inactiveColor;
    }

    const labelColorAnimation = this.state.focused.interpolate({
      inputRange: [0, 1],
      outputRange: [inactiveColor, labelColor],
    });

    /* Wiggle when error appears and label is minimized */
    const labelTranslateX =
      value && hasError
        ? this.state.errorShown.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, labelWiggleXOffset, 0],
          })
        : 0;

    /* Move label to top if value is set */
    const labelTranslateY = value
      ? minimizedLabelYOffset
      : this.state.focused.interpolate({
          inputRange: [0, 1],
          outputRange: [0, minimizedLabelYOffset],
        });

    const labelFontSize = value
      ? minimizedLabelFontSize
      : this.state.focused.interpolate({
          inputRange: [0, 1],
          outputRange: [maximizedLabelFontSize, minimizedLabelFontSize],
        });

    const labelStyle = {
      color: labelColorAnimation,
      fontFamily,
      fontSize: labelFontSize,
      transform: [
        { translateX: labelTranslateX },
        { translateY: labelTranslateY },
      ],
    };

    const underlineArea = {
      height: Animated.multiply(
        underlineAreaHeight,
        helperText ? 1 : errorText ? this.state.errorShown : 0
      ),
      width: '100%',
    };

    const helperTextContainer = {
      opacity: errorText
        ? Animated.add(1, Animated.multiply(this.state.errorShown, -1))
        : 1,
    };

    const errorTextContainer = {
      position: 'absolute',
      opacity: this.state.errorShown,
      transform: [
        {
          translateY: this.state.errorShown.interpolate({
            inputRange: [0, 1],
            outputRange: [-underlineAreaHeight, 0],
          }),
        },
      ],
    };

    const getBottomLineStyle = (
      color: string,
      animatedValue: Animated.Value
    ) => ({
      backgroundColor: color,
      transform: [{ scaleX: animatedValue }],
      opacity: animatedValue.interpolate({
        inputRange: [0, 0.1, 1],
        outputRange: [0, 1, 1],
      }),
    });

    return (
      <View style={style}>
        <AnimatedText
          pointerEvents="none"
          style={[styles.placeholder, labelStyle]}
        >
          {label}
        </AnimatedText>
        <NativeTextInput
          {...rest}
          value={value}
          placeholder={this.state.placeholder}
          placeholderTextColor={colors.placeholder}
          editable={!disabled}
          ref={this._setRef}
          selectionColor={labelColor}
          onFocus={this._handleFocus}
          onBlur={this._handleBlur}
          underlineColorAndroid="transparent"
          style={[
            styles.input,
            rest.multiline && styles.multiline,
            {
              color: inputTextColor,
              fontFamily,
            },
          ]}
        />
        <View pointerEvents="none" style={styles.bottomLineContainer}>
          <View
            style={[
              styles.bottomLine,
              { backgroundColor: hasError ? errorColor : inactiveColor },
            ]}
          />
          <Animated.View
            style={[
              styles.bottomLine,
              styles.focusLine,
              getBottomLineStyle(bottomLineColor, this.state.focused),
            ]}
          />
          <Animated.View
            style={[
              styles.bottomLine,
              styles.focusLine,
              getBottomLineStyle(
                errorColor,
                // $FlowFixMe$
                Animated.multiply(this.state.focused, this.state.errorShown)
              ),
            ]}
          />
        </View>
        {helperText || errorText ? (
          <Animated.View style={underlineArea}>
            {this.renderUnderlineText(
              helperText,
              helperTextContainer,
              helperTextColor
            )}
            {this.renderUnderlineText(
              errorText,
              errorTextContainer,
              errorTextColor
            )}
          </Animated.View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  placeholder: {
    position: 'absolute',
    left: 0,
    top: 38,
    fontSize: 16,
  },
  input: {
    minHeight: 64,
    paddingTop: 20,
    paddingBottom: 0,
    marginTop: 8,
    marginBottom: -4,
  },
  multiline: {
    paddingTop: 30,
  },
  bottomLineContainer: {
    marginBottom: 4,
    height: StyleSheet.hairlineWidth * 4,
  },
  bottomLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: StyleSheet.hairlineWidth,
  },
  focusLine: {
    height: StyleSheet.hairlineWidth * 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default withTheme(TextInput);
