const { connecMongooseService, elasticClient, worksService } = require('../services');

module.exports = {
  creareMembersWork: async (req, res) => {
    try {
      let memberWorks = req.body;
      let { id: user_id } = req.params;
      await connecMongooseService.connectionDB();
      const { _id } = await worksService.createWorks({ ...memberWorks, user_id });
      let newWorks = await worksService.findMemberWorksById({ user_id });
      await worksService.updataMemberWorksByID(user_id, _id);

      await elasticClient.client().index({
        index: 'works',
        id: _id.toString(),
        body: newWorks
      });

      await elasticClient.client().update({
        index: 'members',
        id: user_id,
        body: {
          script: {
            inline: 'ctx._source.works.add(params.arr)',
            params: { arr: _id }
          },
        }
      });

      res.end('Success new work creared!');
    } catch (err) {
      if (err) res.status(400).end(err);
    }
  },
  getWorksInfo: async (req, res) => {
    try {
      let { id } = req.params;
      await connecMongooseService.connectionDB();
      let works = await worksService.findWorkByWorkId(id);
      if (!works) throw new Error('Works not found');
      const styleCodes = await worksService.getCountryCode('workStyle');
      const styleCode = works.style;
      works.style = styleCodes.find(el => el.code === styleCode).name;

      res.json(works);

    } catch (err) {
      if (err) res.status(400).end(err.message);
    }
  },
  searchWork: async (req, res) => {
    const { style, title, user_id, createdAt,updatedAt,date, dateGte, dateLte } = req.query;
    try {
      let body = await elasticClient.client().search({
        index: 'works',
        body: {
          query: {
            bool: {
              should: [
                { match: { style } },
                { match: { title } },
                { match: { user_id } }],
            },
          },
          sort: [
            { "createdAt": { "order": createdAt } },
            { "updatedAt": { "order": updatedAt } },
            { "date": { "order": date } }],
        }
      });

      await connecMongooseService.connectionDB();
      const countryCodes = await worksService.getCountryCode('workStyle');
      if (body.hits.hits) {
        for (const el of body.hits.hits) {
          const styleCode = el._source.style;
          el._source.style = countryCodes.find(el => el.code === styleCode).name;
        }
      }


      res.json(body);
    } catch (err) {
      if (err) res.status(400).end(err.message);
    }
  },
  deleteWork: async (req, res) => {
    let { id } = req.params;
    try {
      await connecMongooseService.connectionDB();
      let { user_id } = await worksService.findUserIdByWorkId(id);
      if (!user_id) throw new Error('Members work do not found');
      await worksService.findWorksByIdAndDelete(id);
      await elasticClient.client().delete({
        index: 'works',
        id: id
      });
      await worksService.updataPullMemberWorksByID(user_id, id);
      await elasticClient.client().update({
        index: 'members',
        id: user_id.toString(),
        body: {
          script: {
            inline: 'ctx._source.works.remove(ctx._source.works.indexOf(params.arr))',
            params: { arr: id }
          },
        }
      });

      res.end('DELETED!');
    } catch (err) {
      if (err) res.status(400).end(err.message);
    }
  },
}
