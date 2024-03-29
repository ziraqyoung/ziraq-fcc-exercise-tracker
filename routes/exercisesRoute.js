const router = require('express').Router();

const User = require('../models/userModel');
const Exercise = require('../models/exerciseModel');

router.route('/').get((req, res) => {
  res.send("Hello World");
});
/**
 * User Routes
 */
// get all users
router.route('/user_log').get((req, res) => {
  User.find()
    .exec((err, users) => {
      if (err) { res.status(400).json({ message: err.message }) }
      res.json(users);
    });
});
// POST /api/exercise/new_user
router.route('/new-user').post( (req, res) => {
  const { username } = req.body;
  const newUser =  new User({
    username
  });
  newUser.save()
    .then((user) => res.json({message: 'User Added!', userId: user.id}))
    .catch(err => res.status(400).json({ error: err.message }))
});
/**
 * Exercise Routes
 */ 
// Get all exercises
// api/exercise/logExercises
router.route('/logExercises').get((req, res) => {
  Exercise.find()
    .exec((err, exercises) => {
      if (err) { res.status(400).json({ message: err.message }) }
      res.json(exercises);
    })
});
// POST /api/exercise/add
router.route('/add').post( (req, res) => {
   // params
  const userId = req.body.userId;
  const description = req.body.description;
  const duration = Number(req.body.duration);
  const date = Date.parse(req.body.date);
  
  if (!userId) {
    return res.status(400).json({ message: 'A user must exist' })
  } 
  
  User.findById(userId, function(err, doc) {
    if(err) res.status(400).json({ error: 'User cant be loaded' })
    // res.json({ id: doc._id });
  
    const newExercise = new Exercise({
      description: description,
      duration: duration,
      date: date,
      userId: doc._id
    });
    
    newExercise.save((err, newExer) => {
      if (err) { res.status(400).json({ message: err.message }) }
      res.json('Exercise Added Successfully.');
    });  
    
  });
  
});
// api/exercise/log?userId=12456&from=DATE&to=DATE&limit=10
router.route('/log').get((req, res) => {
  const userId = req.query.userId;
  const limit = Number(req.query.limit);
  const from = Date.parse(req.query.from);
  const to = Date.parse(req.query.to) || Date.now();
  if (!userId) {
    res.status(400).json({ error: 'Please provide a valid username' });
  } else {
    User.findById(userId)
      .exec()
      .then((doc) => {
        if (from && to) {
          let query = {
            userId: doc._id,
            date: { $gt: from, $lt: to }
          }
          Exercise.find(query)
            .limit(limit)
            .exec((err, exerciseDocs) => {
              if (err) { res.status(400).json({ message: err.message }) }
              res.json(exerciseDocs);
            });
        } else {
          Exercise.find({ userId: doc._id }, (err, exerciseDocs) => {
            if (err) { res.status(400).json({ message: err.message }) }
            res.json(exerciseDocs);
          });
        }
      })
      .catch(err => res.status(400).json('Error' + err));
  };
});

module.exports = router;
