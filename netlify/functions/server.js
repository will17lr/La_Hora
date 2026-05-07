const serverless = require('serverless-http');
const { app, ensureDatabase } = require('../../app');

const handler = serverless(app);

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  await ensureDatabase();

  return handler(event, context);
};