module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // Reanimated 4 icin gerekli; her zaman listenin SONUNDA kalmali.
    plugins: ['react-native-worklets/plugin'],
  };
};
