const { Router } = require('express');

const { workController } = require('./controllers')
const {checkAccessTokenMiddleware} = require('./midllewares')

const worksRouter = Router();

worksRouter.post('/:id', checkAccessTokenMiddleware, workController.creareMembersWork);
worksRouter.get('/id/:id', workController.getWorksInfo);
worksRouter.delete('/:id', checkAccessTokenMiddleware, workController.deleteWork);
worksRouter.get('/search', workController.searchWork);
worksRouter.get('/search/body', workController.searchWorkByBody);


module.exports = worksRouter;
