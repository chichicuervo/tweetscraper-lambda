const _ = require( 'lodash' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const sls = require( 'serverless-webpack' );

const CleanWebpackPlugin = require( 'clean-webpack-plugin' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin;
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );

const ROOT_DIR = path.resolve( __dirname, ".." );
const DEV_MODE = sls.lib.webpack.isLocal || process.env.IS_OFFLINE || process.env.NODE_ENV !== "production";
const BUILD_DIR = path.resolve( ROOT_DIR, "dist" )

const config = async () => {
	return {
		target: 'web',
		entry: [
            '@babel/polyfill',
            path.resolve( ROOT_DIR, 'src/client/index.js' ),
        ],
		mode: DEV_MODE ? "development" : "production",
		plugins: _.compact( [
            new webpack.DefinePlugin( {
				DEV_MODE: DEV_MODE,
				'process.env.BROWSER': true,
				'process.env.NODE_ENV': DEV_MODE ? '"development"' : '"production"'
			} ),
            new HtmlWebpackPlugin( {
				// put plugin params here
			} ),
            // DEV_MODE ? new webpack.HotModuleReplacementPlugin() : null,
            !DEV_MODE && new CleanWebpackPlugin( [ BUILD_DIR ] ),
			!DEV_MODE && new BundleAnalyzerPlugin( {
				analyzerMode: 'static',
				openAnalyzer: false
			} ),
        ] ),
		module: {
			rules: [ {
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ]
            }, {
				test: /\.(mjs|jsx?)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
					}
				}
            }, {
				test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
					}
				}
            } ]
		},
		optimization: {
			sideEffects: true,
			usedExports: true,
			minimizer: [
				new UglifyJsPlugin()
			]
		},
		output: {
			path: BUILD_DIR,
			filename: '[name].js',
			publicPath: "/",
		},
		resolve: {
			modules: [
                path.resolve( ROOT_DIR, "src/client" ),
                path.resolve( ROOT_DIR, "node_modules" )
            ]
		},
		devServer: {
			historyApiFallback: true,
			disableHostCheck: true,
			host: '0.0.0.0',
			port: 3001,
			hot: true
		},

	}
}

module.exports = config()
