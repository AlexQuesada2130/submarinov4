const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push("glb", "gltf", "png", "jpg");
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  (ext) => !config.resolver.assetExts.includes(ext)
);
module.exports = config;
