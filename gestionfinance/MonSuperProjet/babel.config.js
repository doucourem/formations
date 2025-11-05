module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // This is the plugin you need to add
      ['module:react-native-dotenv', {
        "env": ["SUPABASE_URL", "SUPABASE_ANON_KEY"]
      }],
    ],
  };
};