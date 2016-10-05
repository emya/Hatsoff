var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io').listen(app.listen(8889));
var mongoose = require('mongoose')
var users = {};
var chatusers = {};

/** redis
var redis = require('redis');
var sub = redis.createClient();

sub.on('connect', function(){
  console.log('first channel connection');
});

  sub.del('framework', function(err, reply){
     console.log(reply);
  });

  var d = new Date();
  console.log('date:'+d); 

  sub.set(d,{
     'message':'Hello'}, function(err, reply){
     console.log(reply);
  });
redis **/

mongoose.connect('mongodb://localhost/communitypost', function(err){
  if (err){
 	console.log(err);
  } else{
 	console.log('connected to mongo');
  }
});

var replySchema = mongoose.Schema({
  user: {uid: Number, first_name: String, last_name: String},
  content: String,
  created: {type: Date, default:Date.now}
});


var communitySchema = mongoose.Schema({
  user: {uid: Number, first_name: String, last_name: String},
  content: String,
  replys: [replySchema],
  created: {type: Date, default:Date.now}
});

var CommunityPost = mongoose.model('CommunityPost', communitySchema);

var commentSchema = mongoose.Schema({
  to_uid: Number,
  from_user: {uid: Number, first_name: String, last_name: String},
  content: String,
  created: {type: Date, default:Date.now}
});

var CommentPost = mongoose.model('CommentPost', commentSchema);

// action id  1:comment, 2:hatsoff, 3:shareskill, 4:like, 5:share, 6:thanks
var notificationSchema = mongoose.Schema({
  to_uid: Number,
  action_user: {uid: Number, first_name: String, last_name: String},
  action_id: Number,
  content_type: Number,
  content_id: String,
  created: {type: Date, default:Date.now}
});

var NotificationPost = mongoose.model('NotificationPost', notificationSchema);

var upcomingSchema = mongoose.Schema({
  to_uid: Number,
  user: {uid: Number, first_name: String, last_name: String},
  content: String,
  created: {type: Date, default:Date.now}
});

var UpcomingPost = mongoose.model('UpcomingPost', upcomingSchema);

var portfolioSchema = mongoose.Schema({
  to_uid: Number,
  p_id: Number,
  user: {uid: Number, first_name: String, last_name: String},
  content: String,
  created: {type: Date, default:Date.now}
});

var PortfolioPost = mongoose.model('PortfolioPost', portfolioSchema);

var shareskillSchema = mongoose.Schema({
  to_uid: Number,
  user: {uid: Number, first_name: String, last_name: String},
  community_id: String,
  created: {type: Date, default:Date.now}
});

var ShareSkillPost = mongoose.model('ShareSkillPost', shareskillSchema);

var likeSchema = mongoose.Schema({
  to_uid: Number,
  user: {uid: Number, first_name: String, last_name: String},
  content_type: Number,
  content_id: String,
  created: {type: Date, default:Date.now}
});
// content_type 1:community post 2:upcoming work 3:portfolio

var LikePost = mongoose.model('LikePost', likeSchema);

var ShareSchema = mongoose.Schema({
  to_uid: Number,
  user: {uid: Number, first_name: String, last_name: String},
  content_type: Number,
  content_id: String,
  created: {type: Date, default:Date.now}
});
// content_type 1:community post

var SharePost = mongoose.model('SharePost', ShareSchema);

var thanksSchema = mongoose.Schema({
  to_uid: Number,
  user: {uid: Number, first_name: String, last_name: String},
  created: {type: Date, default:Date.now}
});
// content_type 1:community post

var ThanksPost = mongoose.model('ThanksPost', thanksSchema);

var followSchema = mongoose.Schema({
  to_uid: Number,
  user: {uid: Number, first_name: String, last_name: String},
  created: {type: Date, default:Date.now}
});
// content_type 1:community post

var FollowPost = mongoose.model('FollowPost', followSchema);

var hatsoffSchema = mongoose.Schema({
  to_uid: Number,
  user: {uid: Number, first_name: String, last_name: String},
  created: {type: Date, default:Date.now}
});
// content_type 1:community post

var HatsoffPost = mongoose.model('HatsoffPost', hatsoffSchema);


app.get('/', function(req, res){
  /*res.sendFile(__dirname + '../recipe/templates/index.html');*/
  res.sendFile('../week1/templates/week1/message.html');
});

app.get('/', function(req, res){
  res.sendFile('../week1/templates/week1/private_message.html');
});

app.get('/', function(req, res){
  res.sendFile('../week1/templates/week1/userpage.html');
});

app.get('/', function(req, res){
  res.sendFile('../week1/templates/week1/home.html');
});

app.get('/', function(req, res){
  res.sendFile('../week1/templates/week1/community.html');
});

app.get('/', function(req, res){
  res.sendFile('../week1/templates/week1/results_friends.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

io.on('connection', function(socket){

  socket.on('join message', function(data){
     /** temporary
     PortfolioPost.find({}).remove().exec();
     PortfolioPost.find({p_id:2}).remove().exec();
     CommunityPost.find({}).remove().exec();
     CommentPost.find({}).remove().exec();
     NotificationPost.find({}).remove().exec();
     **/

     socket.uid = data.uid;
     socket.firstname = data.firstname;
     socket.lastname = data.lastname;
     users[socket.uid] = socket;
     console.log('join user:'+data.uid);
     console.log('join first:'+data.firstname);
     console.log('join users[data.uid]:'+users[data.uid]);
     console.log('join users[data.uid]:'+users[data.uid]["firstname"]);
     console.log('join users keys:'+Object.keys(users[data.uid]));
     updateUids();
  });

  socket.on('join chat', function(data){
     socket.uid = data.uid;
     socket.firstname = data.firstname;
     socket.lastname = data.lastname;
     chatusers[socket.uid] = socket;
     console.log('join chatusers:'+chatusers[socket.uid].firstname);
     updatechatUids();
  });

  socket.on('join community', function(data){
    console.log('join community');
    var query = CommunityPost.find({});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('join community'+docs);
      socket.emit('update community post', docs);
    }); 

  });

  socket.on('at folder', function(data){
    console.log('at home'+socket.uid);
    var query = ShareSkillPost.find({'to_uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('at folder'+docs);
      socket.emit('update shareskill', docs);
    }); 
  });

  socket.on('at hatsoff', function(data){
    console.log('at hatsoff'+socket.uid);
    var query = HatsoffPost.find({'to_uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('at hatsoffreceived'+docs);
      socket.emit('update hatsoffreceived', docs);
    }); 

    var query1 = HatsoffPost.find({'user.uid':socket.uid});
    query1.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('at hatsoffgave'+docs);
      socket.emit('update hatsoffgave', docs);
    }); 
  });


  socket.on('at thanks', function(data){
    console.log('at thanks'+socket.uid);
    var query = ThanksPost.find({'to_uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('at thanksreceived'+docs);
      socket.emit('update thanksreceived', docs);
    }); 

    var query1 = ThanksPost.find({'user.uid':socket.uid});
    query1.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('at thanksgave'+docs);
      socket.emit('update thanksgave', docs);
    }); 
  });

  socket.on('at follow', function(data){
    console.log('at follow'+socket.uid);
    var query = FollowPost.find({'to_uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('at followreceived'+docs);
      socket.emit('update followreceived', docs);
    }); 

    var query1 = FollowPost.find({'user.uid':socket.uid});
    query1.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('at folowgave'+docs);
      socket.emit('update followgave', docs);
    }); 
  });

  socket.on('at history', function(data){
    console.log('at history'+socket.uid);

    var query = CommunityPost.find({'user.uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, communitydocs){
      if (err) throw err;
      //console.log('community history'+communitydocs);
      socket.emit('update community post history', communitydocs);
    }); 

    var query1 = LikePost.find({'user.uid':socket.uid});
    query1.sort('-created').limit(30).exec(function(err, likedocs){
      if (err) throw err;
      socket.emit('update like history', likedocs);
    }); 

    var query2 = SharePost.find({'user.uid':socket.uid});
    query2.sort('-created').limit(30).exec(function(err, sharedocs){
      if (err) throw err;
      console.log('share history'+sharedocs);
      socket.emit('update share history', sharedocs);
    }); 

    var query3 = ShareSkillPost.find({'user.uid':socket.uid});
    query3.sort('-created').limit(30).exec(function(err, skilldocs){
      if (err) throw err;
      console.log('shareskill history'+skilldocs);
      socket.emit('update shareskill history', skilldocs);
    }); 

      //socket.emit('update community post history', docs);
    var query1 = CommentPost.find({'from_user.uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, commentdocs){
      if (err) throw err;
      //socket.emit('update comment history', docs);
    }); 


    var query2 = UpcomingPost.find({'user.uid':socket.uid});
    var upcomingdocs;
    query2.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      //console.log('upcoming comment at history'+docs);
      upcomingdocs = docs;
      //socket.emit('update upcoming comment history', docs);
    }); 

    var query3 = PortfolioPost.find({'user.uid':socket.uid});
    var portfoliodocs;
    query3.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      //console.log('portfolio comment at history'+docs);
      portfoliodocs = docs;
      //socket.emit('update portfolio comment history', docs);
    }); 



  });

  socket.on('at home', function(data){
    console.log('at home'+socket.uid);
    var query = CommentPost.find({'to_uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update comment', docs);
    }); 

    var query2 = UpcomingPost.find({'to_uid':socket.uid});
    query2.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update upcoming comment', docs);
    }); 

    var query3 = PortfolioPost.find({'to_uid':socket.uid});
    query3.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update portfolio comment', docs);
    }); 

    ThanksPost.find({'to_uid':socket.uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number thanks', count);
    }); 

    HatsoffPost.find({'to_uid':socket.uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number hatsoff', count);
    }); 

    FollowPost.find({'to_uid':socket.uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number follow', count);
    }); 

    var query_cp = CommunityPost.find({'user.uid':socket.uid});
    query_cp.sort('-created').limit(30).exec(function(err, communitydocs){
      if (err) throw err;
      var query_sh = SharePost.find({'user.uid':socket.uid});
      query_sh.sort('-created').limit(30).exec(function(err, sharedocs){
         if (err) throw err;
         socket.emit('update timeline history', {share:sharedocs, community:communitydocs});
      }); 
    }); 

  });
 
  socket.on('at userpage', function(data){
    console.log('at userpage'+socket.uid);
    var query = CommentPost.find({'to_uid':data.to_uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('at home');
      socket.emit('update comment', docs);
    }); 

    var query2 = UpcomingPost.find({'to_uid':data.to_uid});
    query2.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('upcoming comment at home');
      socket.emit('update upcoming comment', docs);
    }); 

    var query3 = PortfolioPost.find({'to_uid':data.to_uid});
    query3.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('portfolio comment at userpage');
      socket.emit('update portfolio comment', docs);
    }); 

    ThanksPost.find({'to_uid':data.to_uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number user thanks', count);
    }); 

    HatsoffPost.find({'to_uid':data.to_uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number user hatsoff', count);
    }); 

    FollowPost.find({'to_uid':data.to_uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number user follow', count);
    }); 

    var query_cp = CommunityPost.find({'user.uid':data.to_uid});
    query_cp.sort('-created').limit(30).exec(function(err, communitydocs){
      if (err) throw err;
      var query_sh = SharePost.find({'user.uid':data.to_uid});
      query_sh.sort('-created').limit(30).exec(function(err, sharedocs){
         if (err) throw err;
         socket.emit('update user timeline history', {share:sharedocs, community:communitydocs});
      }); 
    }); 

  });

  socket.on('change portfolio', function(data){
    console.log('change portfolio'+socket.uid);
    if (data.to_uid){
	var query = PortfolioPost.find({'to_uid':data.to_uid, 'p_id':data.p_id});
	query.sort('-created').limit(30).exec(function(err, docs){
	  if (err) throw err;
	  console.log('portfolio comment at userpage'+docs);
	  console.log('socket.uid'+socket.uid);
	  socket.emit('update portfolio comment', docs);
	}); 
    }else{
	var query = PortfolioPost.find({'to_uid':socket.uid, 'p_id':data.p_id});
	query.sort('-created').limit(30).exec(function(err, docs){
	  if (err) throw err;
	  console.log('portfolio comment at home'+docs);
	  socket.emit('update portfolio comment', docs);
	}); 
    }
  });

  socket.on('see userpage', function(data){
    console.log('at userpage'+socket.uid);
    var query = CommentPost.find({'to_uid':data.to});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('sending comments updates to userpage'+docs);
      socket.emit('update comment', docs);
    }); 
  });

  socket.on('check notification', function(){
    console.log('check notification');
    var query = NotificationPost.find({'to_uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('sending notification'+docs);
      socket.emit('update notification', docs);
    }); 
  });

  socket.on('hatsoff', function(uid){
    var newNotification = new NotificationPost({action_id:2, to_uid:uid, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        if (uid in users){
           users[uid].emit('new notification', {action_id:2, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        } else {
        }
      }
    });
    console.log('hatsoff to '+uid);
  });

  /**
  socket.on('new user', function(data, callback){
     if (data in users){
         console.log('false');
         callback(false);
     }else{
         callback(true);
         console.log('true');
         socket.nickname = data;
         users[socket.nickname] = socket;
         updateNicknames();
     }
  });
  **/
 
  function updateUids(){
    io.emit('usernames', Object.keys(users));
  }
  
  function updatechatUids(){
    io.emit('chatusers', Object.keys(chatusers));
    console.log(Object.keys(chatusers));
  }

  socket.on('chat message', function(data, callback){
    var msg = data.trim();
    if (msg.substr(0,3) === '/w '){
        msg = msg.substr(3);
        var ind = msg.indexOf(' ');
        if (ind !== -1){
            var name = msg.substring(0, ind);
            var msg = msg.substring(ind+1);
            if (name in users){
                users[name].emit('whisper', {msg:msg, nick:socket.uid});
	        console.log('whisper!');
	    }else{
                callback('Erorr! Enter valid user');
	    }
        }else{
            callback('Error! Please enter a meesage for your whisper.');
	}
    }else{
	io.emit('new message', {msg:msg, nick:socket.uid});
	console.log('message: ' + data);
    }
  });

  socket.on('private message', function(data, callback){
    if (data.uid in users){
        users[data.uid].emit('whisper', {msg:data.msg, uid:socket.uid, uname:socket.firstname});
        console.log(socket.uid, socket.firstname);
        console.log('private message!');
    }else{
        callback('Erorr! The user is not online');
    }
  });

  socket.on('community post', function(data, callback){
    var d = new Date();
    console.log('date:'+d); 
    
    var newPost = new CommunityPost({content:data.msg, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});
    newPost.save(function(err, post){
      if (err) {
        console.log(err);
      } else{
        console.log('saved:'+post.id);
        io.emit('new community post', {msg:data.msg, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname, community_id:post.id});
      }
    });
  });

  socket.on('reply community', function(data, callback){
    var d = new Date();
    console.log('date:'+d); 
    
    CommunityPost.findById(data.c_id, function(err, post){
      if (err) {
        console.log(err);
      } else{
        post.replys.push({user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content:data.msg});
        post.save(function (err) {
          if (!err) {
            console.log('Success!');
            io.emit('new reply community', {msg:data.msg, community_id:data.c_id, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname});
          }
        });
      }
    });
    
  });

  socket.on('share skill', function(data, callback){
    var d = new Date();
    console.log('date:'+d); 
    console.log('share skill by:'+socket.uid); 
    
    var newPost = new ShareSkillPost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, community_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved:');
      }
    });

    var newNotification = new NotificationPost({action_id:3, to_uid:data.to, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved:');
      }
    });
  });


  socket.on('give thanks', function(data, callback){
    var d = new Date();
    console.log('give thanks'+socket.uid); 
    
    var newPost = new ThanksPost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        socket.emit('new history', {to_uid:data.to_uid, content_type:1, content_id:data.c_id, action_id:6});
        if (data.to_uid in users){
            users[data.to_uid].emit('new notification', {action_id:6, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
        }
      }
    });

    var newNotification = new NotificationPost({action_id:6, to_uid:data.to, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        //console.log('saved:');
      }
    });
  });

  socket.on('give hatsoff', function(data, callback){
    var d = new Date();
    console.log('give hatsoff'+socket.uid); 
    
    var newPost = new HatsoffPost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        socket.emit('new history', {to_uid:data.to_uid, content_type:1, content_id:data.c_id, action_id:2});
        if (data.to_uid in users){
            users[data.to_uid].emit('new notification', {action_id:2, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
        }
      }
    });

    var newNotification = new NotificationPost({action_id:2, to_uid:data.to, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        //console.log('saved:');
      }
    });
  });


  socket.on('like community', function(data, callback){

    var d = new Date();
    console.log('like community:'+socket.uid); 
    
    var newPost = new LikePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:1, content_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved:');
        socket.emit('new history', {to_uid:data.to_uid, content_type:1, content_id:data.c_id, action_id:4});
        if (data.to_uid in users){
            users[data.to_uid].emit('new notification', {action_id:4, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
           //users[data.to].emit('new notification', {action_id:1, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        }
      }
    });

    var newNotification = new NotificationPost({action_id:4, to_uid:data.to_uid, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved notification:');
      }
    });
  });

  socket.on('like upcoming', function(data, callback){

    var d = new Date();
    console.log('like upcoming:'+socket.uid); 
    
    var newPost = new LikePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:2, content_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved:');
        socket.emit('new history', {to_uid:data.to_uid, content_type:2, content_id:data.c_id, action_id:4});
        if (data.to_uid in users){
            users[data.to_uid].emit('new notification', {action_id:4, content_type:2, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
        }
      }
    });

    var newNotification = new NotificationPost({action_id:4, content_type:2, content_id:data.c_id, to_uid:data.to_uid, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved notification:');
      }
    });
  });


  socket.on('like portfolio', function(data, callback){

    var d = new Date();
    console.log('like portfolio:'+socket.uid); 
    
    var newPost = new LikePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:3, content_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved:');
        socket.emit('new history', {to_uid:data.to_uid, content_type:2, content_id:data.c_id, action_id:4});
        if (data.to_uid in users){
            users[data.to_uid].emit('new notification', {action_id:4, content_type:3, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
        }
      }
    });

    var newNotification = new NotificationPost({action_id:4, content_type:3, content_id:data.c_id, to_uid:data.to_uid, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved notification:');
      }
    });
  });



  socket.on('share post', function(data, callback){

    var d = new Date();
    console.log('share community:'+socket.uid); 
    
    var newPost = new SharePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:1, content_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved share community:');
        socket.emit('new history', {to_uid:data.to_uid, content_type:1, content_id:data.c_id, action_id:5});
        if (data.to_uid in users){
            users[data.to_uid].emit('new notification', {action_id:5, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
           //users[data.to].emit('new notification', {action_id:1, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        }
      }
    });

    var newNotification = new NotificationPost({action_id:5, to_uid:data.to_uid, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved notification:');
      }
    });
  });


  socket.on('share upcoming', function(data, callback){

    var d = new Date();
    console.log('share upcoming:'+socket.uid); 
    
    var newPost = new SharePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:2, content_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved share community:');
        socket.emit('new history', {to_uid:data.to_uid, content_type:2, content_id:data.c_id, action_id:5});
        if (data.to_uid in users){
            users[data.to_uid].emit('new notification', {action_id:5, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
           //users[data.to].emit('new notification', {action_id:1, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        }
      }
    });

    var newNotification = new NotificationPost({action_id:5, content_type:2, content_id:data.c_id, to_uid:data.to_uid, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved notification:');
      }
    });
  });


  socket.on('share portfolio', function(data, callback){

    var d = new Date();
    console.log('share portfolio:'+socket.uid); 
    
    var newPost = new SharePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:3, content_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved share community:');
        socket.emit('new history', {to_uid:data.to_uid, content_type:3, content_id:data.c_id, action_id:5});
        if (data.to_uid in users){
            users[data.to_uid].emit('new notification', {action_id:5, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
           //users[data.to].emit('new notification', {action_id:1, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        }
      }
    });

    var newNotification = new NotificationPost({action_id:5, content_type:3, content_id:data.c_id, to_uid:data.to_uid, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved notification:');
      }
    });
  });


  socket.on('post comment', function(data, callback){
    console.log('post aomment');
    var newComment = new CommentPost({content:data.msg, to_uid:data.to, from_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newComment.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved:'+data.msg+' touid:'+data.to+' fromuid:'+data.from+' socket.uid:'+socket.uid);
        socket.emit('new comment', {msg:data.msg, from:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});

        if (data.to in users && data.to != socket.uid){
           users[data.to].emit('new comment', {msg:data.msg, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        }

      }
    });

    var newNotification = new NotificationPost({action_id:1, to_uid:data.to, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('notification!');
        if (data.to in users){
           console.log('new notification! to '+data.to);
           users[data.to].emit('new notification', {action_id:1, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        } else {
        }
      }
    });
  });

  socket.on('upcoming comment', function(data, callback){
    console.log('upcoming comment');
    var d = new Date();
    console.log('date:'+d); 
    
    var newPost = new UpcomingPost({content:data.msg, to_uid:data.to, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved');
        if (users[data.to]) {
            users[data.to].emit('new upcoming comment', {msg:data.msg, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        }
       
        if (data.uid) {
            console.log('data.uid'+data.uid);
            console.log('users'+users[data.uid]);
            users[data.uid].emit('new upcoming comment on userpage', {msg:data.msg, to:data.to, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        }
      }

    });
  });

  socket.on('portfolio comment', function(data, callback){
    console.log('portfolio comment');
    var d = new Date();
    console.log('date:'+d); 
    
    var newPost = new PortfolioPost({content:data.msg, to_uid:data.to, p_id:data.p_id, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved:'+data.msg);
        if (users[data.to]) {
            users[data.to].emit('new portfolio comment', {msg:data.msg, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname, p_id:data.p_id});
        }
       
        if (data.uid) {
            console.log('data.uid'+data.uid);
            console.log('users'+users[data.uid]);
            users[data.uid].emit('new portfolio comment', {msg:data.msg, to:data.to, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname, p_id:data.p_id});
        }
      }

    });
  });

  socket.on('subscribe', function(room){
    console.log('join room:'+room);
    socket.join(room);
  });

  socket.on('unsubscribe', function(room){
    console.log('leaving room:'+room);
    socket.leave(room);
  });

    /**
    if (data.to in users){
        users[data.to].emit('update comment', {msg:data.msg, uid:data.to, from:data.from});
        console.log('post aomment!');
    }else{
        console.log('post aomment! But Error'+data.to+' : '+socket.uid);
        callback('Erorr! The user is not online');
    }
    **/

  socket.on('disconnect', function(){
    if (!socket.uid) return ;
    delete users[socket.uid];
    updateUids();

    delete chatusers[socket.uid];
    updatechatUids();

    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
