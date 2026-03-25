// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix: Add 'react-native' condition for web platform resolution.
// Without this, packages like zustand that have both CJS (react-native condition)
// and ESM (import condition) builds get resolved to the ESM version on web.
// The ESM build uses import.meta.env which causes a SyntaxError because Metro
// serves the bundle as a classic <script> (not type="module").
// Since this project uses react-native-web, the react-native condition is correct.
config.resolver.unstable_conditionsByPlatform = {
  ...config.resolver.unstable_conditionsByPlatform,
  web: [
    'react-native',
    ...(config.resolver.unstable_conditionsByPlatform?.web ?? []),
  ],
};

module.exports = config;
