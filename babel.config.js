const _ = require( 'lodash' );
const sls = require( 'serverless-webpack' );

const server = !!sls.lib.serverless;

if ( server ) {
	var runtime = sls.lib.serverless.service.provider.runtime
	runtime = runtime && runtime.replace( /^nodejs/, '' ) || "8.10"
}

module.exports = function ( api ) {
	const presets = _.compact( [
		server && [ "@babel/preset-env", {
			targets: {
				node: `${runtime}`
			}
		} ],
		!server && [ "@babel/preset-env", {
			modules: false
		} ],
		!server && '@babel/preset-react',
	] );
	const plugins = _.compact( [
		!server && 'react-hot-loader/babel',
		'@babel/plugin-proposal-class-properties',
	] );

	api.cache( false );

	return {
		presets,
		plugins
	};
}
