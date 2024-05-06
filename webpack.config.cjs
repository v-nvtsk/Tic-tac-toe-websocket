const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

// const PUBLIC_PATH = process.env.CI ? "/otus-jsbasic-final-react/" : "/";
const PUBLIC_PATH = "/";
const SOCKET_PROTOCOL = process.env.SOCKET_PROTOCOL || "ws";
const SOCKET_PORT = process.env.SOCKET_PORT || 8080;

module.exports = (env) => ({
  mode: env.mode === "development" ? "development" : "production",
  context: path.resolve(__dirname, "src"),
  entry: "./index.tsx",
  output: {
    clean: true,
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js",
    publicPath: PUBLIC_PATH,
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      PUBLIC_PATH: JSON.stringify(PUBLIC_PATH),
      SOCKET_PROTOCOL: JSON.stringify(SOCKET_PROTOCOL),
      SOCKET_PORT: JSON.stringify(SOCKET_PORT),
    }),
    new webpack.ProvidePlugin({
      React: "react",
    }),
    new HtmlWebpackPlugin({
      title: "Tic-tac-toe",
    }),
  ],
});
