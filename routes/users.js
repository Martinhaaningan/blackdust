var express = require('express');
var router = express.Router();

const auth = require('../controllers/auth');

const { forwardAuthenticated, ensureAuthenticated} = require('../services/auth');


router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/login', auth.postLogin);

router.get('/logout', auth.logout);


router.get('/newchar', ensureAuthenticated, function (req, res, next) {
  res.render('newchar');
});

router.post('/register', auth.postRegister);

module.exports = router;
