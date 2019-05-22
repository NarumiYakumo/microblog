
/* GET home page. */
var router = require('express').Router();
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');

router.get('/', function(req, res){
  throw new Error('An error has occured');
  Post.get(null, function(err, posts){
    if (err){
      posts = [];
    }
    res.render('layout',{
      title: '首页',
      page: 'index',
      posts: posts,
    });
  });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res){
  res.render('layout',{
    title: '用户注册',
    page: 'reg'
  });
});

router.post('/reg', checkNotLogin);
router.post('/reg',function(req, res){
  if (req.body['password-repeat'] != req.body['password']){
    req.flash('error', '两次输入的口令不一致');
    return res.redirect('/reg');
  }
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  var newUser = new User({
    name: req.body.username,
    password: password,
  });

  User.get(newUser.name, function(err, user){
    if (user)
      err = 'Username already exists.';
    if (err){
      req.flash('error', err);
      return res.redirect('/reg');
    }
    newUser.save(function(err){
      if (err){
        req.flash('error', err);
        return res.redirect('/reg');
      }
      req.session.user = newUser;
      req.flash('success', '注册成功');
      res.redirect('/');
    });
  });
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res){
  res.render('layout', {
    title: '用户登入',
    page: 'login'
  });
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res){
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  User.get(req.body.username, function(err, user){
    if (!user){
      req.flash('error', '用户不存在');
      return res.redirect('/');
    }
    if (user.password != password){
      req.flash('error', '用户口令错误');
      return res.redirect('/login');
    }
    req.session.user = user;
    req.flash('success', '登入成功');
    res.redirect('/');
  });
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res){
  req.session.user = null;
  req.flash('success', '登出成功');
  res.redirect('/');
});

function checkLogin(req, res, next){
  if(!req.session.user){
    req.flash('error', '未登入');
    return res.redirect('/login');
  }
  next();
};

function checkNotLogin(req, res, next){
  if(req.session.user){
    req.flash('error', '已登入');
    return res.redirect('/');
  }
  next();
};

router.post('/post' ,checkLogin);
router.post('/post', function(req, res){
  var currentUser = req.session.user;
  var post = new Post(currentUser.name, req.body.post);
  post.save(function(err){
    if (err){
      req.flash('error', err);
      return res.redirect('/');
    }

    req.flash('success', '发表成功');
    res.redirect('/u/'+currentUser.name);
  });
});

router.get('/u/:user', function(req, res){
  User.get(req.params.user, function(err, user){
    if (!user){
      req.flash('error', '用户不存在');
      res.redirect('/');
    }
    Post.get(user.name, function(err, posts){
      if (err){
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('layout', {
        title : user.name,
        posts : posts,
        page : 'user',
      });
    });
  });
});

module.exports = router;

