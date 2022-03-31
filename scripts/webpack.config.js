/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { seekViewPath } = require("./entry");

const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';
const webpackEntries = {};
const webpackHtmlPlugins = [];

seekViewPath("../src/views/*", (entry) => {
  webpackEntries[entry.name] = `${entry.entryAbsPath}/${entry.entryFileName}`;
  webpackHtmlPlugins.push(new HtmlWebpackPlugin({
    template: `${entry.entryAbsPath}/index.html`,
    filename: `views/${entry.name}/index.html`,
    chunks: ["app", entry.name],
    inject: "body",
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: false,
      minifyCSS: true,
      minifyJS: true,
    },
  }));
});

module.exports = {
  entry: webpackEntries,
  output: {
    filename: isDev ? 'static/js/[name].js' : 'static/js/[name].[hash:7].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.html$/,
        use: [
          'html-loader',
          'webpack-html-include-loader'
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: !isDev
                ? 'static/img/[name].[hash:7].[ext]'
                : 'static/img/[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  // 提取公共模块
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'app',
          chunks: 'all',
          minChunks: 2,
        },
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: !isDev
        ? 'static/css/[name].[hash:7].css'
        : 'static/css/[name].css',
      chunkFilename: !isDev
        ? 'static/css/[name].[hash:7].css'
        : 'static/css/[name].css',
    }),

    new OptimizeCSSPlugin({
      safe: true,
      map: false,
      discardComments: { removeAll: true },
    }),

    ...webpackHtmlPlugins,
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../src/layouts'),
          to: './layouts',
        },
      ],
    }),
  ],
  devtool: 'cheap-module-source-map',
  watchOptions: {
    ignored: ['**/dist', '**/scripts', '**/node_modules'],
  },
}

