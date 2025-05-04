module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@assets': './assets',
            '@components': './components',
            '@screens': './screens',
            '@services': './services',
            '@hooks': './hooks',
            '@context': './context',
            '@types': './types',
            '@config': './config'
          },
        },
      ],
    ],
  };
}; 