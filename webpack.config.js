module.exports = {
  entry: './client/index.jsx',
  watch: true,
  mode: 'development',
  module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          loader: "babel-loader",
          exclude: /node_modules/,
          query: {
            presets: ["@babel/preset-env", "@babel/react"],
            plugins: [
                [
                  "@babel/plugin-transform-runtime",
                ],
                [
                  "@babel/plugin-transform-regenerator",
                ],
                "@babel/plugin-transform-modules-commonjs",
            ],
          }
        },
        {
          test: /\.(scss|css)$/,
          loaders: ["style-loader","css-loader","sass-loader"]
        }
      ]
  },
  resolve: {
      extensions: ['*', '.js', '.jsx']
  },
  output: {
      path: __dirname + '/',
      publicPath: '/',
      filename: 'client.min.js'
  },
  devServer: {
      contentBase: './static',
      host: 'localhost', // Defaults to `localhost`
      port: 3001, // Defaults to 8080,
  }
};