import express from 'express';

const apiRouter = express.Router();
const name = process.env.npm_package_name;
const version = process.env.npm_package_version;

apiRouter.get('/', (req, res) => {
  res.json({
    version: `${name}@${version}`,
    usage: 'GET /api/v1/{year}',
  });
});

export default apiRouter;
