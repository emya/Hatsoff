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

var communitySchema = mongoose.Schema({
  user: {uid: Number, first_name: String, last_name: String},
  content: String,
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

var notificationSchema = mongoose.Schema({
  to_uid: Number,
  action_user: {uid: Number, first_name: String, last_name: String},
  action_id: Number,
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

  socket.on('at home', function(data){
    console.log('at home'+socket.uid);
    var query = CommentPost.find({'to_uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('at home'+docs);
      socket.emit('update comment', docs);
    }); 

    var query2 = UpcomingPost.find({'to_uid':socket.uid});
    query2.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('upcoming comment at home'+docs);
      socket.emit('update upcoming comment', docs);
    }); 
  });
 
  socket.on('at userpage', function(data){
    console.log('at userpage'+socket.uid);
    var query = CommentPost.find({'to_uid':data.to_uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('at home'+docs);
      socket.emit('update comment', docs);
    }); 

    var query2 = UpcomingPost.find({'to_uid':data.to_uid});
    query2.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('upcoming comment at home'+docs);
      socket.emit('update upcoming comment', docs);
    }); 
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
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved');
        io.emit('new community post', {msg:data.msg, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname});
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
        io.emit('update comment', {msg:data.msg, from:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});

        if (data.to in users){
           users[data.to].emit('new comment', {msg:data.msg, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        } else {
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
            users[data.uid].emit('new upcoming comment', {msg:data.msg, to:data.to, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        }
      }

    });
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
