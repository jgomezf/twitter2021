const { locale } = require("../../locale");
const Tweet = require("./model");
const { getTweetsByUsername } = require("../services/twitterService");

//list tweets
const list = (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  Tweet.find({}, ["content", "comments", "likes", "user", "createdAt"])
    .populate("user", ["name", "username"])
    .populate("comments.user", ["name", "username"])
    .limit(Number(limit))
    .skip(skip)
    .sort({ createdAt: -1 })
    .then(async (tweets) => {
      const total = await Tweet.estimatedDocumentCount();
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      res.status(200).json({
        hasMore,
        totalPages,
        total,
        data: tweets,
        currentPage: page,
      });
    });
};

//tweet
const getOne = (req, res) => {
  const { id } = req.params;

  Tweet.findById(id, ["content", "comments", "likes", "user", "createdAt"])
    .populate("user", ["name", "username"])
    .populate("comments.user", ["name", "username"])
    .then(async (tweet) => {
      res.status(200).json({
        data: tweet,
      });
    });
};

//create tweet
const create = async (req, res) => {
  const { content, userId } = req.body;

  const tweet = {
    content,
    user: userId,
  };

  const newTweet = new Tweet(tweet);

  await newTweet
    .save()
    .then((tweetCretaed) => {
      res.status(200).json(tweetCretaed);
    })
    .catch(() => {
      res
        .status(500)
        .json({ message: locale.translate("errors.tweet.onCreate") });
    });
};

//create Comment
const createComment = async (req, res) => {
  const { comment, tweetId, userId } = req.body;
  const comments = {
    comment,
    user: userId,
  };
  Tweet.updateOne({ _id: tweetId }, { $addToSet: { comments } })
    .then((tweetModified) => {
      res
        .status(200)
        .json({ message: locale.translate("success.comment.onCreate") });
    })
    .catch(() => {
      res
        .status(500)
        .json({ message: locale.translate("errors.comment.onCreate") });
    });
};

//delete tweet
const destroyTweet = async (req, res) => {
  const { tweetId, userId } = req.body;

  await Tweet.findOneAndDelete(
    {
      $and: [{ _id: { $eq: tweetId } }, { user: { $eq: userId } }],
    },
    (err, docs) => {
      if (err) {
        res.status(500).json({
          message: `${locale.translate("errors.tweet.onDelete")}`,
        });
      } else if (docs) {
        res.status(200).json({
          message: `${locale.translate("success.tweet.onDelete")}`,
          id: docs._id,
        });
      } else {
        res.status(404).json({
          message: `${locale.translate("errors.tweet.tweetNotExists")}`,
        });
      }
    }
  );
};

//create like
const likes = async (req, res) => {
  const { tweetId, userId } = req.body;
  const newlike = {
    like: true,
    user: userId,
  };
  const tweet = await Tweet.findOne({
    _id: tweetId,
  })
    .then((tweet) => {
      return tweet;
    })
    .catch((err) => {
      console.error(err);
    });

  const existLike = tweet.likes.find((l) => l.user.toString() === userId);

  if (existLike) {
    Tweet.updateOne(
      { _id: tweetId },
      { $set: { "likes.$[elem].like": !existLike.like } },
      { arrayFilters: [{ "elem.user": existLike.user }] }
    )
      .then(() => {
        res
          .status(200)
          .json({ message: locale.translate("success.like.onLike") });
      })
      .catch(() => {
        res
          .status(500)
          .json({ message: locale.translate("errors.like.onLike") });
      });
  } else {
    const likes = tweet.likes;
    likes.push(newlike);

    Tweet.updateOne({ _id: tweetId }, { $addToSet: { likes } })
      .then(() => {
        res
          .status(200)
          .json({ message: locale.translate("success.like.onLike") });
      })
      .catch(() => {
        res
          .status(500)
          .json({ message: locale.translate("errors.like.onLike") });
      });
  }
};

const getExternalTweetsByUsername = async (req, res) => {
  const { username } = req.params;
  const tweetsResponse = await getTweetsByUsername(username);
  const tweets = tweetsResponse.map(({ text, created_at }) => {
    return {
      text,
      created_at,
    };
  });
  res.status(200).json(tweets);
};

module.exports = {
  getOne,
  list,
  create,
  createComment,
  likes,
  destroyTweet,
  getExternalTweetsByUsername,
};
