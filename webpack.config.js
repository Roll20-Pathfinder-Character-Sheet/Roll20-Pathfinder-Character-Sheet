var path = require('path');
var webpack = require('webpack');
var webpackSources = require('webpack-sources');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

var webpackConfig = {
  entry: path.join(__dirname, 'src/index.js'),
  resolve: {
    modules: [path.resolve(__dirname, "stubs"), "node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader'
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      inlineSource: '.js$'
    }),
    new HtmlWebpackInlineSourcePlugin(),
    function RegexReplace(...args) {
      const onPath = path.join(__dirname, 'stubs/on');

      this.plugin('compilation', function(compilation, params) {
        compilation.plugin('optimize-modules', function(modules) {
          modules.forEach((module) => {
            if(module.context === onPath) {
              module.source = () => new webpackSources.RawSource('module.exports = window.on');
            } else if(module.rawRequest === 'underscore') {
              module.source = () => new webpackSources.RawSource('module.exports = window._');
            }
          });
        })
      })

      this.plugin('emit', function(compilation, callback) {
        var oldSource = compilation.assets['index.html'].source;

        compilation.assets['index.html'].source = function() {
          return oldSource().replace('text/javascript', 'text/worker');
        }

        callback();
      });
    }
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js'
  }
};

module.exports = webpackConfig;
