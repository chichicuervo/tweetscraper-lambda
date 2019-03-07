'use strict';

import API from 'lambda-api';

const api = API()

api.get('/api/hello', async (req, res) => {
	return {
		message: 'Go Serverless v1.0! Your function executed successfully!',
	}
})

export default async ( event, context ) => {
	return await api.run(event, context);
};
