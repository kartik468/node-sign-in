var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/signin', function(req, res, next) {
  res.render('user/signin', { title: 'Node Authentication' });
});

module.exports = router;
