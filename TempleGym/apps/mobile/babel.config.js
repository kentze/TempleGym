const path = require('path');

// Resolve babel-preset-expo explicitly from the SDK 54 copy inside expo's own
// node_modules, bypassing any mismatched version hoisted to the workspace root.
const presetPath = path.resolve(
  __dirname,
  'node_modules/expo/node_modules/babel-preset-expo',
);

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [presetPath],
  };
};
