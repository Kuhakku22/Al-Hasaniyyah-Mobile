const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { pathToFileURL } = require("url");

const config = getDefaultConfig(__dirname);

// Fix for Node.js ESM loader on Windows
const projectRoot = process.platform === "win32" 
  ? pathToFileURL(__dirname).toString() 
  : __dirname;

module.exports = withNativeWind(config, { 
  input: "./src/global.css",
  projectRoot
});
