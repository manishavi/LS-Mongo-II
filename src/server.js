const bodyParser = require('body-parser');
const express = require('express');

const STATUS_USER_ERROR = 422;
const STATUS_OK = 200;
const Post = require('./post.js');

const server = express();
// to enable parsing of json bodies for post requests
server.use(bodyParser.json());

const sendUserError = (error, res) => {
  res.status(STATUS_USER_ERROR);
  res.json({ error });
};

// TODO: write your route handlers here
server.get('/accepted-answer/:soID', (req, res) => {
  const { soID } = req.params;
  Post.findOne({ soID }, (err, post) => {
    if (!post) {
      sendUserError({ error: 'User Error in accepted-answer' }, res);
      return;
    }
    Post.findOne({ soID: post.acceptedAnswerID }, (error, answer) => {
      if (!answer) {
        sendUserError({ error: 'User Error in accepted answer findOne' }, res);
        return;
      }
      res.json(answer);
    });
  });
});

server.get('/top-answer/:soID', (req, res) => {
  const { soID } = req.params;
  Post.findOne({ soID }, (err, post) => {
    if (!post) {
      sendUserError({ error: `User Error in top-answer with ${soID}` }, res);
      return;
    }
    Post.find({ $and: [{ parentID: soID }, { soID: { $ne: post.acceptedAnswerID } }] }, (error, answers) => {
      if (!answers || !answers.length) {
        sendUserError({ error: 'User Error in top-answer find' }, res);
        return;
      }
      const topAnswer = answers.reduce((ta, e) => {
        return e.score > ta.score ? e : ta;
      }, answers[0]);
      res.json(topAnswer);
    });
  });
});

server.get('/popular-jquery-questions', (req, res) => {
  Post.find({ $and: [{ tags: { $in: ['jquery'] } },
            { $or: [{ score: { $gt: 5000 } }, { 'user.reputation': { $gt: 200000 } }] }] })
    .exec((err, post) => {
      if (!post) {
        sendUserError(err, res);
      } else {
        res.json(post);
      }
    });
});

server.get('/npm-answers', (req, res) => {
  const { soID } = req.params;
  Post.find({ tags: { $in: ['npm'] } })
  .exec((err, post) => {
    if (!post) {
      sendUserError(err, res);
      return;
    }
    Post.findOne({ post }, (errr, aanswer) => {
      if (!aanswer) {
        res.status(200);
        res.json({ errr });
        return;
      }
      res.json(aanswer);
    });
  });
});


module.exports = { server };
