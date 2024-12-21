const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWorkerScriptPlugin = require('./HtmlWorkerScriptPlugin.js');
// const mode = process.env.NODE_ENV;

const webpackConfig = {
  entry: path.join(__dirname, 'src/index.js'),
  resolve: {
    modules: [path.resolve(__dirname, 'stubs'), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Updated preset
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      inlineSource: '.js$',
      minify: false,
      // inject: 'body',
      inject: false, // Disables automatic script injection
      // scriptLoading: 'blocking',
    }),
    new HtmlInlineScriptPlugin(),
    new HtmlWorkerScriptPlugin(),
    // function HtmlWorkerScriptPlugin() {
    //   this.plugin('emit', (compilation, callback) => {
    //     const htmlAsset = compilation.assets['index.html'];
    //     if (htmlAsset) {
    //       let html = htmlAsset.source();
    //       // replace <script> tag for roll20 sheetworkers
    //       html = html.replace(/<script>(.*?)<\/script>/gs, '<script type="text/worker">$1</script>');
    //       const currentDate = new Date().toUTCString();
    //       html = html.replace('$$CURRENTRELEASEDATE$$', currentDate);
    //       if (mode === 'production') {
    //         html = html.replace(/^\s*<!--DEVELOPMENT CODE\. NOT READY FOR PRODUCTION YET-->\s*\r?\n?/gm, '');
    //       }
    //       // Use compilation.assets['index.html'].source() to avoid unnecessary string conversion
    //       compilation.assets['index.html'] = {
    //         source: () => html,
    //         size: () => Buffer.byteLength(html, 'utf8'), // More accurate size calculation
    //       };
    //     }
    //     callback();
    //   });
    // },
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: true,
          mangle: true,
          format: {
            comments: false, // Removes comments
          },
        },
      }),
    ],
  },
  output: {
    path: path.join(__dirname, process.env.NODE_ENV === 'production' ? 'prod' : 'dist'),
    filename: 'index.js',
  },
};

module.exports = webpackConfig;
