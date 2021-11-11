var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let user = req.user ? req.user.email: null; 
  console.log(req.user);
  res.render('index', { title: 'Express',
  user: user });
});

module.exports = router;
