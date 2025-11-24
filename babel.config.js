module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Expo SDK 50에서는 expo-router/babel 플러그인이 babel-preset-expo에 포함되어 있음
    // 별도로 추가할 필요 없음
  };
};

