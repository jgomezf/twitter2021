const { locale } = require('../../locale');
const Tweet = require('./model');

const list = (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  Tweet.find({ }
    , ['content', 'comments','likes', 'user', 'createdAt'])
    .populate('user', ['name', 'username'])
    .populate('comments.user', ['name', 'username'])
    .limit(Number(limit))
    .skip(skip)
    .sort({ createdAt: -1})
    .then(async (tweets) => {
      const total = await Tweet.estimatedDocumentCount();
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      res.status(200).json({
        hasMore,
        totalPages,
        total,
        tweets,
        currentPage: page,
      });
    });
};

const create = async (req, res) => {
  const { content, userId } = req.body;

  const tweet = {
    content,
    user: userId,
  };

  const newTweet = new Tweet(tweet);
  
  await newTweet.save()
    .then((tweetCretaed) => {
      res.status(200).json(tweetCretaed);
    })
    .catch(() => {
      res.status(500).json({ message: locale.translate('errors.tweet.onCreate')});
    });

};

const createComment = async (req, res) => {
  const { comment, tweetId, userId } = req.body;
  const comments = {
    comment,
    user: userId,
  }
  Tweet.updateOne({ _id: tweetId }, { $addToSet: { comments } })
  .then((tweetModified => {
    res.status(200).json({ message: locale.translate('errors.tweet.tweetCreated') });
  }))
  .catch(() => {
    res.status(500).json({ message: locale.translate('errors.tweet.onModified') })
  });
}

const createlike = async (req, res) => {
  const { like, tweetId, userId } = req.body;
  const likes = {
    like,
    user: userId,
  }

  Tweet.updateOne({$and: [{ _id: tweetId }, { 'likes.user': userId }]}, { $addToSet: { likes } })
  .then(() => {
    res.status(200).json({ message: locale.translate('errors.tweet.tweetCreated') });
  })
  .catch(() => {
    res.status(500).json({ message: locale.translate('errors.tweet.onModified') })
  });
}

module.exports = { list, create, createComment, createlike };
