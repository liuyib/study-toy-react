module.exports = {
  entry: {
    dist: "./src/index.js",
    demo: "./src/index.js",
  },
  output: {
    path: __dirname,
    filename: "[name]/bundle.js",
  },
  mode: "development" /* process.env.NODE_ENV */,
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",
                {
                  pragma: "ToyReact.createElement",
                },
              ],
            ],
          },
        },
      },
    ],
  },
};
