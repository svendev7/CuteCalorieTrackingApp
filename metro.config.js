// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleImport, platform) => {
  // Always import the ESM version of all `@firebase/*` packages
  if (moduleImport.startsWith('@firebase/')) {
    return context.resolveRequest(
      {
        ...context,
        isESMImport: true, // Mark the import method as ESM
      },
      moduleImport,
      platform
    );
  }

  return context.resolveRequest(context, moduleImport, platform);
};
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
module.exports = config;