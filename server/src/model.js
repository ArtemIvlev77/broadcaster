const {
  User,
  Stream,
  StreamTag,
  Sequelize: { Op, fn, col },
} = require('../db/models');

function getUsersWithStreams(limit) {
  return Stream.findAll({
    attributes: [[fn('DISTINCT', col('user_id')), 'id']],
    limit,
    where: { path: { [Op.not]: null } },
    // order: [['updatedAt', 'DESC']],
  });
}

function getStreamById(id) {
  return Stream.findOne({ where: { id } });
}

function getStreamByStreamKey(streamKey) {
  return Stream.findOne({ where: { stream_key: streamKey } });
}

async function startStream(broadcastId, stream) {
  await Stream.update(
    { start: new Date(), broadcast_id: broadcastId },
    { where: { id: stream.id } },
  );

  return Stream.findOne({ where: { id: stream.id } });
}

function endStream(broadcastId, filePath) {
  Stream.update(
    {
      end: new Date(),
      path: filePath,
    },
    {
      where: { broadcast_id: broadcastId },
    },
  );
}

async function closeLostStreams(getStreamPathName) {
  const currStreams = await Stream.findAll({
    where: {
      end: { [Op.is]: null },
    },
    // include: User,
  });

  // const currStreams = streams.map((el) => ({
  //   id: el.id,
  //   user: { streamKey: el.stream_key },
  //   start: el.start,
  // }));
  const prms = [];
  currStreams.forEach((el) => {
    prms.push(getStreamPathName(el));
  });

  const paths = await Promise.all(prms);

  prms.splice();

  currStreams.forEach((el, ind) => {
    const prm = Stream.update(
      { end: new Date(), path: paths[ind] },
      { where: { id: el.id } },
    );
    prms.push(prm);
  });
  return Promise.all(prms);
}

function getAllUserStreams(userId) {
  return Stream.findAll({ where: { user_id: userId } });
}

function getActiveStreams() {
  return Stream.findAll({
    attributes: ['id', 'broadcast_id', 'title', 'start', 'stream_key', 'preview'],
    // include: {
    //   model: User,
    //   attributes: ['stream_key'],
    // },
    where: {
      end: { [Op.is]: null },
    },
  });
}

function getUserFinishedStreams(userId) {
  return Stream.findAll({
    attributes: ['id', 'broadcast_id', 'title', 'start', 'path', 'user_id', 'preview'],
    where: {
      path: { [Op.not]: null },
      user_id: { [Op.in]: userId },
    },
    order: [['updatedAt', 'DESC']],
  });
}

function createStream(fields) {
  return Stream.create(fields);
}

async function addTagsToStream(stream, tags) {
  if (!(tags && tags.length)) {
    return;
  }
  const prms = [];
  tags.forEach((el) => {
    if (el.id) {
      prms.push(StreamTag.create({ stream_id: stream.id, tag_id: el.id }));
    }
  });
  await Promise.all(prms);
}

module.exports = {
  getStreamByStreamKey,
  startStream,
  endStream,
  closeLostStreams,
  getAllUserStreams,
  getActiveStreams,
  getUserFinishedStreams,
  getUsersWithStreams,
  getStreamById,
  createStream,
  addTagsToStream,
};
