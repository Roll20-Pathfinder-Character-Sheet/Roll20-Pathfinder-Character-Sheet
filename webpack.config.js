const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const webpackConfig = {
	entry: path.join(__dirname, "src/index.js"),
	resolve: {
		modules: [path.resolve(__dirname, "stubs"), "node_modules"],
		alias: {
			// Easier way to handle TheAaronSheet
			TheAaronSheet: path.resolve(__dirname, "src/TheAaronSheet.js"), // Assuming it's in src
		},
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"], // Updated preset
					},
				},
			},
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env.NODE_ENV": JSON.stringify(
				process.env.NODE_ENV || "development",
			),
		}),
		new webpack.optimize.UglifyJsPlugin({
			// Consider using TerserPlugin in webpack 4/5
			comments: false,
			sourceMap: false,
		}),
		new HtmlWebpackPlugin({
			template: path.join(__dirname, "src/index.html"),
			inlineSource: ".js$",
		}),
		new HtmlWebpackInlineSourcePlugin(),
		function HtmlWorkerScriptPlugin() {
			this.plugin("emit", (compilation, callback) => {
				const htmlAsset = compilation.assets["index.html"];
				if (htmlAsset) {
					let html = htmlAsset.source();
					html = html.replace(
						/<script\s+type\s*=\s*["']?\s*text\/javascript\s*["']?>(.*?)<\/script>/gs,
						'<script type="text/worker">$1</script>',
					);
					const currentDate = new Date().toUTCString();
					html = html.replace("$$CURRENTRELEASEDATE$$", currentDate);
					// Use compilation.assets['index.html'].source() to avoid unnecessary string conversion
					compilation.assets["index.html"] = {
						source: () => html,
						size: () => Buffer.byteLength(html, "utf8"), // More accurate size calculation
					};
				}
				callback();
			});
		},
	],
	output: {
		path: path.join(
			__dirname,
			process.env.NODE_ENV === "production" ? "prod" : "dist",
		),
		filename: "index.js",
	},
};

module.exports = webpackConfig;
