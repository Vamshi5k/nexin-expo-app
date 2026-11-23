module.exports = function (api) {
  api.cache(true);
  // Strip console.* from production bundles (BLUEPRINT bug 5: tokens were logged).
  // console.error/warn are kept so crash reporters still see them.
  const isProd = process.env.NODE_ENV === 'production' || process.env.BABEL_ENV === 'production';
  return {
    presets: ['babel-preset-expo'],
    plugins: isProd ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] : [],
  };
};
