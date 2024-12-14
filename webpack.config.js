const path = require('path');
const webpack = require('webpack');
const webpackSources = require('webpack-sources');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const webpackConfig = {
  entry: path.join(__dirname, 'src/index.js'),
  resolve: {
    modules: [path.resolve(__dirname, 'stubs'), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      sourceMap: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      inlineSource: '.js$',
    }),
    new HtmlWebpackInlineSourcePlugin(),
    function RegexReplace(...args) {
      const onPath = path.join(__dirname, 'stubs/on');
      this.plugin('compilation', function (compilation, params) {
        compilation.plugin('optimize-modules', function (modules) {
          modules.forEach((module) => {
            if (module.context === onPath) {
              module.source = () => new webpackSources.RawSource('module.exports = window.on');
            } else if (module.rawRequest === 'underscore') {
              module.source = () => new webpackSources.RawSource('module.exports = window._');
            }
          });
        });
      });

      this.plugin('emit', function (compilation, callback) {
        const oldSource = compilation.assets['index.html'].source;

        compilation.assets['index.html'].source = function () {
          let str = oldSource().replace('text/javascript', 'text/worker');
          const d = new Date();
          let n = d.toString();
          n = n.slice(0, n.indexOf('GMT') + 3);
          str = str.replace('$$CURRENTRELEASEDATE$$', n);
          return str;
        };

        callback();
      });
    },
  ],
  output: {
    path: path.join(__dirname, process.env.NODE_ENV === 'production' ? 'prod' : 'dist'),
    filename: 'index.js',
  },
};

module.exports = webpackConfig;
