const { Router } = require('express');

const { workController } = require('./controllers')
// const {} = require('./midllewares')

const worksRouter = Router();

worksRouter.post('/:id', workController.creareMembersWork);
worksRouter.get('/id/:id', workController.getWorksInfo);
worksRouter.delete('/:id', workController.deleteWork);
worksRouter.get('/search', workController.searchWork);


module.exports = worksRouter;
