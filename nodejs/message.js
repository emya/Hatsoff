var app = require('express')();
var async = require('async');
var http = require('http').Server(app);
var io = require('socket.io').listen(app.listen(8889));
var mongoose = require('mongoose')
var users = {};
var chatusers = {};

var dbfile = '../db.sqlite3';
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbfile);




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
  image: { data: Buffer, contentType: String },
  replys: [replySchema],
  skillls: [String],
  tag: Number,//1: Yes, -1: No
  sharedBy: Number,
  likes: Number,
  shares: Number,
  content_id: String,
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

// action id  1:comment, 2:hatsoff, 3:shareskill, 4:like, 5:share, 6:thanks, 7:collaborate, 8:follow
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

var collaborateSchema = mongoose.Schema({
  to_uid: Number,
  user: {uid: Number, first_name: String, last_name: String},
  content_type: Number,
  content_id: String,
  created: {type: Date, default:Date.now}
});

var CollaboratePost = mongoose.model('CollaboratePost', collaborateSchema);

var likeSchema = mongoose.Schema({
  to_uid: Number,
  user: {uid: Number, first_name: String, last_name: String},
  content_type: Number,
  content_id: String,
  created: {type: Date, default:Date.now}
});
// content_type 1:community post 2:upcoming work 3:portfolio 4:shared post

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

//Status 1:only action user follows, 2:follow each other 
var followSchema = mongoose.Schema({
  uid1: Number,
  uid2: Number,
  action_user: Number,//1 or 2
  status: Number,//1: sent request, 2:accepted, 3:blocked
  //to_uid: Number,
  //user: {uid: Number, first_name: String, last_name: String},
  created: {type: Date, default:Date.now}
});
// content_type 1:community post

var FollowPost = mongoose.model('FollowPost', followSchema);

var hatsoffSchema = mongoose.Schema({
  to_uid: Number,
  content_type: Number,
  content_id: String,
  user: {uid: Number, first_name: String, last_name: String},
  created: {type: Date, default:Date.now}
});

// content_type 1:community post 2:upcoming work 3:portfolio 4:shared post 5:profile
var HatsoffPost = mongoose.model('HatsoffPost', hatsoffSchema);

var messageSchema = mongoose.Schema({
  uid: Number,
  content: String,//1: sent request, 2:accepted, 3:blocked
  image: { data: Buffer, contentType: String },
  created: {type: Date, default:Date.now}
});

var MessagePost = mongoose.model('MessagePost', messageSchema);

var messageRelationSchema = mongoose.Schema({
  uid1: Number,
  uid2: Number,
  action_user: Number,//1 or 2
  status: Number,//1: sent request, 2:accepted, 3:blocked
  messages: [messageSchema],
  created: {type: Date, default:Date.now}
});
// content_type 1:community post

var MessageRelation = mongoose.model('MessageRelation', messageRelationSchema);

var communityMemberSchema = mongoose.Schema({
  uid: Number,
  friends: [Number],
  created: {type: Date, default:Date.now}
});
// content_type 1:community post

var CommunityMember = mongoose.model('CommunityMember', communityMemberSchema);

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
     /**
     PortfolioPost.find({p_id:2}).remove().exec();
     PortfolioPost.find({}).remove().exec();
     CommunityPost.find({}).remove().exec();
     CommentPost.find({}).remove().exec();
     SharePost.find({}).remove().exec();
     ShareSkillPost.find({}).remove().exec();
     MessageRelation.find({}).remove().exec();
     NotificationPost.find({}).remove().exec();
     CommunityMember.find({}).remove().exec();
     FollowPost.find({}).remove().exec();
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

  socket.on('at community members', function(data){
    CommunityMember.findOne({uid:socket.uid}).exec(function(err, result){
      if(!result){
        console.log("no results");
      }else{
        console.log(result);
        console.log(typeof result);
        var friends = result.friends;
        var tuplestr = "(";
        for (var i = 0; i < friends.length; i++){
          tuplestr += "?,";
        }
        tuplestr = tuplestr.substring(0, tuplestr.length - 1);
        tuplestr += ")";

        var liststr = "("+friends.join(",")+")";
        console.log(friends.length);
        console.log(liststr);
        db.all("SELECT DISTINCT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM auth_user, week1_profile WHERE week1_profile.user_id==auth_user.id AND week1_profile.user_id in "+tuplestr, friends, function(err, rows){
          //db.all("SELECT user_id FROM week1_profile WHERE user_id!=? AND ( skill1 in "+tuplestr+" or skill2 in "+tuplestr+" or skill3 in "+tuplestr+" or skill4 in "+tuplestr+" or skill5  )", (socket.uid, skillls, skillls), function(err, rows){
          socket.emit('get community members', rows);
          console.log("collaborators"+rows);
        });
      }
    });
  });

  socket.on('join community', function(data){
    console.log('join community');
    var query = CommunityPost.find({});
    /*
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('join community');
      socket.emit('update community post', docs);
    }); 
    */

    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      var query1 = LikePost.find({'user.uid':socket.uid, 'content_type':1}).select('content_id -_id');
      query1.sort('-created').limit(30).exec(function(err1, likedocs){
        if (err1) throw err1;

        var query2 = SharePost.find({'user.uid':socket.uid, 'content_type':1}).select('content_id -_id');
        query2.sort('-created').limit(30).exec(function(err2, sharedocs){
          if (err2) throw err2;

          var query3 = HatsoffPost.find({'user.uid':socket.uid, 'content_type':1}).select('content_id -_id');
          query3.sort('-created').limit(30).exec(function(err3, hatsoffdocs){
            if (err3) throw err3;

            socket.emit('update community post', {sharedocs:sharedocs, likedocs:likedocs, hatsoffdocs:hatsoffdocs, docs:docs});
          });
        });
      });
    }); 

   


    db.serialize(function() {
      db.each("SELECT skill1, skill2, skill3, skill4, skill5, skill6, skill7, skill8, skill9, skill10 FROM week1_profile where user_id=? ", socket.uid, function(err, row) {
        if(err){
          console.log(err);
        }
        else {
          if (row.skill1 != "" || row.skill2 != "" || row.skill3 !="" || row.skill4 != "" || row.skill5 != "" || row.skill6 != "" || row.skill7 !="" || row.skill8 != "" || row.skill9 != "" || row.skill10 != "" ){
            var skillls_empty = [row.skill1, row.skill2, row.skill3, row.skill4, row.skill5, row.skill6, row.skill7, row.skill8, row.skill9, row.skill10];
            console.log("skillls:"+skillls);
            var skillls = [];
            for (var i = 0; i < 10; i++){
              if (skillls_empty[i] == ""){
                skillls.push(skillls_empty[0])
              }else{
                skillls.push(skillls_empty[i])
              }
            }
            var newdocs = [];
            var query = CommunityPost.find({});
            query.sort('-created').limit(50).exec(function(err, docs){
              if (err) throw err;

              var fixed_len = 3;
              var len = (fixed_len < docs.length) ? fixed_len: docs.length;
              var curIdx = 0;
              async.each(docs, function(doc){

                if(doc.skillls && doc.skillls.length != 0){
                  for (var j = 0; j < doc.skillls.length; j++) {
                    var item = doc.skillls[j];  // Calling myNodeList.item(i) isn't necessary in JavaScript
                    //console.log("item:"+item);
                    if (item != "" && skillls.indexOf(item) != -1 ){
                      console.log("push");
                      newdocs.push(doc);
                    }
                  }
                }
                curIdx += 1;
                if (len == curIdx){
                  console.log("newdocs:"+newdocs.length);
                  console.log("newdocs:"+newdocs);
                  socket.emit('three community posts need you', newdocs);
                }
              });
            });

            //var uids = [];
            var tuplestr = "(?,?,?,?,?,?,?,?,?,?)";
            var liststr = "("+skillls.join(",")+")";
            console.log(liststr);
            db.all("SELECT DISTINCT user_id FROM week1_upcomingwork WHERE user_id!=? AND (collaborator_skill1 in "+tuplestr+" or collaborator_skill2 in "+tuplestr+" or collaborator_skill3 in "+tuplestr+" or collaborator_skill4 in "+tuplestr+" or collaborator_skill5 in "+tuplestr+" or collaborator_skill6 in "+tuplestr+" or collaborator_skill7 in "+tuplestr+" or collaborator_skill8 in "+tuplestr+" or collaborator_skill9 in "+tuplestr+" or collaborator_skill10 in "+tuplestr+") GROUP BY user_id limit 3", (socket.uid, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls), function(err, rows){
            //db.all("SELECT user_id FROM week1_profile WHERE user_id!=? AND ( skill1 in "+tuplestr+" or skill2 in "+tuplestr+" or skill3 in "+tuplestr+" or skill4 in "+tuplestr+" or skill5  )", (socket.uid, skillls, skillls), function(err, rows){
              socket.emit('three collaborators need you', rows);
              console.log("collaborators"+rows);
            });
          } 
        }
      });

      db.each("SELECT collaborator_skill1, collaborator_skill2, collaborator_skill3, collaborator_skill4, collaborator_skill5, collaborator_skill6, collaborator_skill7, collaborator_skill8, collaborator_skill9, collaborator_skill10 FROM week1_upcomingwork where user_id=? limit 1", socket.uid, function(err, row) {
        if(err){
          console.log(err);
        }
        else{
          if (row.collaborator_skill1 != "" || row.collaborator_skill2 != "" || row.collaborator_skill3 !="" || row.collaborator_skill4 != "" || row.collaborator_skill5 != "" || row.collaborator_skill6 != "" || row.collaborator_skill7 !="" || row.collaborator_skill8 != "" || row.collaborator_skill9 != "" || row.collaborator_skill10 != "" ){

            var skillls_empty = [row.collaborator_skill1, row.collaborator_skill2, row.collaborator_skill3, row.collaborator_skill4, row.collaborator_skill5, row.collaborator_skill6, row.collaborator_skill7, row.collaborator_skill8, row.collaborator_skill9, row.collaborator_skill10];
            var skillls = [];
            for (var i = 0; i < 10; i++){
              if (skillls_empty[i] == ""){
                skillls.push(skillls_empty[0])
              }else{
                skillls.push(skillls_empty[i])
              }
            }
            var tuplestr = "(?,?,?,?,?,?,?,?,?,?)";
            var liststr = "("+skillls.join(",")+")";
            console.log(liststr);
            db.all("SELECT user_id FROM week1_profile WHERE user_id!=? AND (skill1 in "+tuplestr+" or skill2 in "+tuplestr+" or skill3 in "+tuplestr+" or skill4 in "+tuplestr+" or skill5 in "+tuplestr+" or skill6 in "+tuplestr+" or skill7 in "+tuplestr+" or skill8 in "+tuplestr+" or skill9 in "+tuplestr+" or skill10 in "+tuplestr+") GROUP BY week1_profile.user_id limit 3", (socket.uid, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls), function(err, rows){
            //db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.profession, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!=? AND (week1_profile.skill1 in "+tuplestr+" or week1_profile.skill2 in "+tuplestr+" or week1_profile.skill3 in "+tuplestr+" or week1_profile.skill4 in "+tuplestr+" or week1_profile.skill5 in "+tuplestr+" or week1_profile.skill6 in "+tuplestr+" or week1_profile.skill7 in "+tuplestr+" or week1_profile.skill8 in "+tuplestr+" or week1_profile.skill9 in "+tuplestr+" or week1_profile.skill10 in "+tuplestr+") GROUP BY week1_profile.user_id", (socket.uid, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls), function(err, rows){
              socket.emit('three collaborators you need', rows);
              console.log("collaborators you need"+rows);
            });
            
          }
        }
      });


    });


  });

  socket.on('join community post', function(data){
    console.log('join community');
    CommunityPost.findById(data.c_id, function(err, post){
      if (err) throw err;
      console.log('join community'+post);
      socket.emit('get community post', post);
    });

  });

  socket.on('at community needs you', function(data){
    console.log('at community needs you');


      /////new lines
    db.serialize(function() {
      db.each("SELECT skill1, skill2, skill3, skill4, skill5, skill6, skill7, skill8, skill9, skill10 FROM week1_profile where user_id=?", socket.uid, function(err, row) {
        if(err){
          console.log(err);
        }
        else {
          if (row.skill1 != "" || row.skill2 != "" || row.skill3 !="" || row.skill4 != "" || row.skill5 != "" || row.skill6 != "" || row.skill7 !="" || row.skill8 != "" || row.skill9 != "" || row.skill10 != "" ){
            var skillls = [row.skill1, row.skill2, row.skill3, row.skill4, row.skill5, row.skill6, row.skill7, row.skill8, row.skill9, row.skill10];
            console.log("skillls:"+skillls);
            var newdocs = [];
            var query = CommunityPost.find({});
            query.sort('-created').limit(50).exec(function(err, docs){
              if (err) throw err;

              var len = docs.length;
              var curIdx = 0;
              async.each(docs, function(doc){

                if(doc.skillls && doc.skillls.length != 0){
                  for (var j = 0; j < doc.skillls.length; j++) {
                    var item = doc.skillls[j];  // Calling myNodeList.item(i) isn't necessary in JavaScript
                    console.log("item:"+item);
                    if (item != "" && skillls.indexOf(item) != -1 ){
                      console.log("push");
                      newdocs.push(doc);
                    }
                  }
                }
                curIdx += 1;
                if (len == curIdx){
                  console.log("newdocs:"+newdocs.length);
                  console.log("newdocs:"+newdocs);
                  socket.emit('update community post needs you', newdocs);
                }
              });
            });
          } 
        }
      });
    });

  });

  socket.on('at collaborators you need', function(data){
    console.log('at community needs you');

    db.each("SELECT collaborator1, collaborator2, collaborator3, collaborator4, collaborator5, collaborator_skill1, collaborator_skill2, collaborator_skill3, collaborator_skill4, collaborator_skill5, collaborator_skill6, collaborator_skill7, collaborator_skill8, collaborator_skill9, collaborator_skill10 FROM week1_upcomingwork where user_id=? limit 1", socket.uid, function(err, row) {
        if(err){
          console.log(err);
        }
        else{
          if (row.collaborator_skill1 != "" || row.collaborator_skill2 != "" || row.collaborator_skill3 !="" || row.collaborator_skill4 != "" || row.collaborator_skill5 != "" || row.collaborator_skill6 != "" || row.collaborator_skill7 !="" || row.collaborator_skill8 != "" || row.collaborator_skill9 != "" || row.collaborator_skill10 != "" ){
            var skillls_empty = [row.collaborator_skill1, row.collaborator_skill2, row.collaborator_skill3, row.collaborator_skill4, row.collaborator_skill5, row.collaborator_skill6, row.collaborator_skill7, row.collaborator_skill8, row.collaborator_skill9, row.collaborator_skill10];
            var skillls = [];
            for (var i = 0; i < 10; i++){
              if (skillls_empty[i] == ""){
                skillls.push(skillls_empty[0]);
              }else{
                skillls.push(skillls_empty[i]);
              }
            }
            var tuplestr = "(?,?,?,?,?,?,?,?,?,?)";
            var liststr = "("+skillls.join(",")+")";
            console.log(skillls);

            if (row.collaborator1 != "" || row.collaborator2 != "" || row.collaborator3 !="" || row.collaborator4 != "" || row.collaborator5 != "" ){
              var collaborators_empty = [row.collaborator1, row.collaborator2, row.collaborator3, row.collaborator4, row.collaborator5];
              var collaboratorls = [];
              for (var i = 0; i < 5; i++){
                if (collaborators_empty[i] == ""){
                  collaboratorls.push(collaborators_empty[0]);
                }else{
                  collaboratorls.push(collaborators_empty[i]);
                }
              }
              var c_tuplestr = "(?,?,?,?,?)";
              var c_liststr = "("+collaboratorls.join(",")+")";
              console.log(socket.uid);
              console.log(tuplestr);
              console.log(c_tuplestr);
              console.log(collaboratorls);
              var c_liststr = "('"+collaboratorls[0]+"'";
              for (var i = 1; i < 5; i++){
                c_liststr += ", '"+ collaboratorls[i]+"'";
              }
              c_liststr += ")";

              var liststr = "('"+skillls[0]+"'";
              for (var i = 1; i < 10; i++){
                liststr += ", '"+ skillls[i]+"'";
              }
              liststr += ")";
              console.log(c_liststr);
              console.log(liststr);

              db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!="+socket.uid+" AND week1_profile.user_id=auth_user.id AND (week1_profile.profession1 in "+c_liststr+" OR week1_profile.profession2 in "+c_liststr+" OR week1_profile.profession3 in "+c_liststr+" OR week1_profile.profession4 in "+c_liststr+" OR week1_profile.profession5 in "+c_liststr+" OR week1_profile.skill1 in "+liststr+" OR week1_profile.skill2 in "+liststr+" OR week1_profile.skill3 in "+liststr+" OR week1_profile.skill4 in "+liststr+" OR week1_profile.skill5 in "+liststr+" OR week1_profile.skill6 in "+liststr+" OR week1_profile.skill7 in "+liststr+" OR week1_profile.skill8 in "+liststr+" OR week1_profile.skill9 in "+liststr+" OR week1_profile.skill10 in "+liststr+") GROUP BY week1_profile.user_id", function(err, rows){
              //db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!=? AND week1_profile.user_id=auth_user.id AND (week1_profile.skill1 in "+tuplestr+" or week1_profile.skill2 in "+tuplestr+" or week1_profile.skill3 in "+tuplestr+" or week1_profile.skill4 in "+tuplestr+" or week1_profile.skill5 in "+tuplestr+" or week1_profile.skill6 in "+tuplestr+" or week1_profile.skill7 in "+tuplestr+" or week1_profile.skill8 in "+tuplestr+" or week1_profile.skill9 in "+tuplestr+" or week1_profile.skill10 in "+tuplestr+" or week1_profile.profession1 in "+c_tuplestr+" or week1_profile.profession2 in "+c_tuplestr+" or week1_profile.profession3 in "+c_tuplestr+" or week1_profile.profession4 in "+c_tuplestr+" or week1_profile.profession5 in "+c_tuplestr+" ) GROUP BY week1_profile.user_id", (socket.uid, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, collaboratorls, collaboratorls, collaboratorls, collaboratorls, collaboratorls), function(err, rows){
                socket.emit('get collaborators you need', rows);
                console.log("collaborators you need in if "+rows);
              });


            }else{
              db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!="+socket.uid+" AND week1_profile.user_id=auth_user.id AND (week1_profile.skill1 in "+liststr+" or week1_profile.skill2 in "+liststr+" or week1_profile.skill3 in "+liststr+" or week1_profile.skill4 in "+liststr+" or week1_profile.skill5 in "+liststr+" or week1_profile.skill6 in "+liststr+" or week1_profile.skill7 in "+liststr+" or week1_profile.skill8 in "+liststr+" or week1_profile.skill9 in "+liststr+" or week1_profile.skill10 in "+liststr+") GROUP BY week1_profile.user_id", function(err, rows){
              //db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.profession, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!=? AND (week1_profile.skill1 in "+tuplestr+" or week1_profile.skill2 in "+tuplestr+" or week1_profile.skill3 in "+tuplestr+" or week1_profile.skill4 in "+tuplestr+" or week1_profile.skill5 in "+tuplestr+" or week1_profile.skill6 in "+tuplestr+" or week1_profile.skill7 in "+tuplestr+" or week1_profile.skill8 in "+tuplestr+" or week1_profile.skill9 in "+tuplestr+" or week1_profile.skill10 in "+tuplestr+") GROUP BY week1_profile.user_id", (socket.uid, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls), function(err, rows){
                socket.emit('get collaborators you need', rows);
                console.log("collaborators you need in else"+rows);
              });
              
            }

          }
        }
      });

  });

  socket.on('at collaborators need you', function(data){

      db.each("SELECT skill1, skill2, skill3, skill4, skill5, skill6, skill7, skill8, skill9, skill10 FROM week1_profile where user_id=? ", socket.uid, function(err, row) {
        if(err){
          console.log(err);
        }
        else {
          if (row.skill1 != "" || row.skill2 != "" || row.skill3 !="" || row.skill4 != "" || row.skill5 != "" || row.skill6 != "" || row.skill7 !="" || row.skill8 != "" || row.skill9 != "" || row.skill10 != "" ){
            var skillls_empty = [row.skill1, row.skill2, row.skill3, row.skill4, row.skill5, row.skill6, row.skill7, row.skill8, row.skill9, row.skill10];
            console.log("skillls:"+skillls);
            var skillls = [];
            for (var i = 0; i < 10; i++){
              if (skillls_empty[i] == ""){
                skillls.push(skillls_empty[0])
              }else{
                skillls.push(skillls_empty[i])
              }
            }
            var newdocs = [];

            //var uids = [];
            var tuplestr = "(?,?,?,?,?,?,?,?,?,?)";
            var liststr = "("+skillls.join(",")+")";
            console.log(liststr);
            db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM auth_user, week1_profile, week1_upcomingwork WHERE week1_profile.user_id!=? AND week1_profile.user_id=auth_user.id AND week1_profile.user_id=week1_upcomingwork.user_id AND (week1_upcomingwork.collaborator_skill1 in "+tuplestr+" or week1_upcomingwork.collaborator_skill2 in "+tuplestr+" or week1_upcomingwork.collaborator_skill3 in "+tuplestr+" or week1_upcomingwork.collaborator_skill4 in "+tuplestr+" or week1_upcomingwork.collaborator_skill5 in "+tuplestr+" or week1_upcomingwork.collaborator_skill6 in "+tuplestr+" or week1_upcomingwork.collaborator_skill7 in "+tuplestr+" or week1_upcomingwork.collaborator_skill8 in "+tuplestr+" or week1_upcomingwork.collaborator_skill9 in "+tuplestr+" or week1_upcomingwork.collaborator_skill10 in "+tuplestr+") GROUP BY week1_profile.user_id ", (socket.uid, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls), function(err, rows){
            //db.all("SELECT user_id FROM week1_profile WHERE user_id!=? AND ( skill1 in "+tuplestr+" or skill2 in "+tuplestr+" or skill3 in "+tuplestr+" or skill4 in "+tuplestr+" or skill5  )", (socket.uid, skillls, skillls), function(err, rows){
              socket.emit('get collaborators need you', rows);
              console.log("collaborators"+rows);
            });
          } 
        }
      });

  });

  socket.on('at talent list', function(data){
    var query = data.query;
    console.log("query:"+query);
    db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM auth_user, week1_profile WHERE (week1_profile.skill1=? OR week1_profile.skill2=? OR week1_profile.skill3=? OR week1_profile.skill4=? OR week1_profile.skill5=? OR week1_profile.skill6=? OR week1_profile.skill7=? OR week1_profile.skill8=? OR week1_profile.skill9=? OR week1_profile.skill10=?) AND week1_profile.user_id=auth_user.id GROUP BY week1_profile.user_id ", [query, query, query, query, query, query, query, query, query, query], function(err, rows){
      socket.emit('get talent list', rows);
      console.log("talent "+rows);
    });
  });

  socket.on('at folder', function(data){
    var query = CollaboratePost.find({'to_uid':socket.uid});
      query.sort('-created').limit(30).exec(function(err, collaboratedocs){
           console.log('share skill:'+collaboratedocs);
           var newdocs = [];
           var curIdx = 0;
           var len = collaboratedocs.length;
     });
      /***
    var query = ShareSkillPost.find({'to_uid':socket.uid});
      query.sort('-created').limit(30).exec(function(err, sharedocs){
           console.log('share skill:'+sharedocs);
           var newdocs = [];
           var curIdx = 0;
           var len = sharedocs.length;
           async.each(sharedocs, function(docs){
              async.waterfall([
                 function(callback){
                    CommunityPost.findOne({'_id':docs.community_id}).exec(function(err, post){
                      callback(null, post);
                    });
                 },
                 function(post){
                   console.log("second");
                   if (post){
                      docs.set('community', post.toJSON(), {strict: false});
                      newdocs.push(docs);
                   }else{
                      newdocs.push(docs);
                   }
                   //console.log("****newdocs****:"+newdocs);
                   curIdx += 1;
                   if (curIdx == len){
                     console.log("***********************************length of newdocs:"+newdocs.length);
                     socket.emit('update shareskill', newdocs);
                   }
                 }
              ], function(err, result){
              });
            });
     });
     ***/

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

    var query = FollowPost.find().or([{ uid1:socket.uid, action_user:2, status:1 }, { uid1:socket.uid, status:2 }, { uid2:socket.uid, action_user:1, status:1 }, { uid2:socket.uid, status:2 }]);
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('at folowgave'+docs);
      socket.emit('update followreceived', docs);
    }); 

    var query1 = FollowPost.find().or([{ uid1:socket.uid, action_user:1 }, { uid1:socket.uid, status:2 }, { uid2:socket.uid, action_user:2 }, { uid2:socket.uid, status:2 }]);
    query1.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('at folowgave'+docs);
      socket.emit('update followgave', docs);
    }); 
  });


  socket.on('at chat message', function(data){

    MessageRelation.find().
      or([{ uid1:socket.uid, action_user:2, status:1 }, {uid2:socket.uid, action_user:1, status:1}]).sort('-created').exec(function(err, result){
      if (err) {
        console.log(err);
      }else {
        if (result){
          console.log("result");
          socket.emit('update first message', result);
        }

      }
    });

    MessageRelation.find().
      or([{ uid1:socket.uid, status:2 }, {uid2:socket.uid, status:2}]).sort('-created').exec(function(err, result){
      if (err) {
        console.log(err);
      }else {
        if (result){
          console.log("chat result");
          socket.emit('update chat message', result);
          for (var i = 0; i < result.length; i++){
             socket.join(result[i]._id);
             console.log("join "+result[i]._id);
          }
        }

      }
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
      console.log("portfolio:"+docs);
      socket.emit('update portfolio comment', docs);
    }); 

    ThanksPost.find({'to_uid':socket.uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number thanks', count);
    }); 

    HatsoffPost.find({'to_uid':socket.uid}).count(function(err, count){
      if (err) throw err;
      console.log("count:"+count);
      socket.emit('number hatsoff', count);
    }); 

    FollowPost.find().or([{uid1:socket.uid, action_user:2, status:1}, {uid1:socket.uid, status:2}, {uid2:socket.uid, action_user:1, status:1}, {uid2:socket.uid, status:2}]).count(function(err, count){
      if (err) throw err;
      socket.emit('number follow', count);
    }); 

    // content_type 1:community post 2:upcoming work 3:portfolio 4:shared post
    var query_cp = CommunityPost.find({'user.uid':socket.uid});
    async.waterfall([
        function(callback){
           console.log("communitydocs");
           var query_cp = CommunityPost.find({'user.uid':socket.uid});
           query_cp.sort('-created').limit(30).exec(function(err, communitydocs){
              callback(null, communitydocs);
           });
        },
        function(communitydocs, callback){
           console.log("communitydocs:"+communitydocs.length);
       	   var query_sh = SharePost.find({'user.uid':socket.uid});
      	   query_sh.sort('-created').limit(30).exec(function(err, sharedocs){
                    callback(null, communitydocs, sharedocs);
                 });
        },
        function(communitydocs, sharedocs){ 
           var newdocs = [];
           var curIdx = 0;
           var len = sharedocs.length;
           if (len == 0){
               socket.emit('update timeline history', {share:newdocs, community:communitydocs});
           }else{

    		   async.each(sharedocs, function(docs){
    			  if (docs.content_type == 1){
    			  async.waterfall([
    			     function(callback){
    				      CommunityPost.findOne({'_id':docs.content_id}).exec(function(err, post){
    				        callback(null, post);
    				      });
    			     },
    			     function(post){
        				 console.log("second");
        				 docs.set('content', post.toJSON(), {strict: false});
        				 newdocs.push(docs);
        				 //console.log("****newdocs****:"+newdocs);
        				 curIdx += 1;
        				 if (curIdx == len){
        				  console.log("***********************************length of newdocs:"+newdocs.length);
        				  socket.emit('update timeline history', {share:newdocs, community:communitydocs});
        				 }
        			 }
        		], function(err, result){
    	});

			} else if(docs.content_type == 2){
			 curIdx += 1;
			 if (curIdx == len){
			  console.log("***********************************length of newdocs:"+newdocs.length);
			  socket.emit('update timeline history', {share:newdocs, community:communitydocs});
			 }
			} else if(docs.content_type == 3){
			 curIdx += 1;
			 if (curIdx == len){
			  console.log("***********************************length of newdocs:"+newdocs.length);
			  socket.emit('update timeline history', {share:newdocs, community:communitydocs});
			 }
			} else if(docs.content_type == 4){
			 curIdx += 1;
			 if (curIdx == len){
			  console.log("***********************************length of newdocs:"+newdocs.length);
			  socket.emit('update timeline history', {share:newdocs, community:communitydocs});
			 }
			} else{
			 curIdx += 1;
			 if (curIdx == len){
			  console.log("***********************************length of newdocs:"+newdocs.length);
			  socket.emit('update timeline history', {share:newdocs, community:communitydocs});
			 }
			}
                    });
           }
        },
        ], function(err, result){
          console.log("err:"+err);
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

    /*
    HatsoffPost.find({'to_uid':data.to_uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number user hatsoff', count);
    }); 
    */

    FollowPost.find().or([{uid1:data.to_uid, action_user:2, status:1}, {uid1:data.to_uid, status:2}, {uid2:data.to_uid, action_user:1, status:1}, {uid2:data.to_uid, status:2}]).count(function(err, count){
      if (err) throw err;
      socket.emit('number user follow', count);
    }); 


    var uid1, uid2, action_user;
    if (socket.uid < data.to_uid){
      uid1 = socket.uid;
      uid2 = data.to_uid; 
      action_user = 1;
    }else{
      uid2 = socket.uid;
      uid1 = data.to_uid; 
      action_user = 2;
    }

    MessageRelation.findOne({ uid1:uid1, uid2:uid2 }).exec(function(err, result){
      if (err) {
        console.log(err);
      }else {
        if (result){
          socket.join(result._id);
          socket.emit('set message', result);
          console.log('result:'+result);
        }else{
          //Default status is 2
          var newMessageRelation = new MessageRelation({uid1:uid1, uid2:uid2, action_user:action_user, status:2 });
          newMessageRelation.save(function(error, newdata){

            if (error) {
              console.log(error);
            }else{
              /** emmit new message to data.to_uid message.html **/
                socket.join(newdata._id);
                console.log('newdata:'+newdata);
                socket.emit('set message', newdata) 
            }
          });
        }
      }
    });

    LikePost.find({'to_uid':data.to_uid, 'user.uid':socket.uid}).exec(function(error, result){
      if(error) throw error;

      if(result){
        socket.emit('like status', result);
      }
    }); 

    // Follow status 0:not following, 1:following
    FollowPost.find().or([{uid1:data.to_uid, action_user:2, status:1}, {uid1:data.to_uid, status:2}, {uid2:data.to_uid, action_user:1, status:1}, {uid2:data.to_uid, status:2}]).count(function(error, count){
      if(error) throw error;
       
      FollowPost.findOne({uid1:uid1, uid2:uid2}).exec(function(err, result){
        if(err){
        }else{
          if(result){
            if( result.status == 2 || (result.uid1==socket.uid && result.action_user==1) || (result.uid2==socket.uid && result.action_user==2)){
              socket.emit('follow status', {status:1, count:count});
            }else{
              socket.emit('follow status', {status:0, count:count});
            }
          }else{
            socket.emit('follow status', {status:0, count:count});
          }
        }
      });
    }); 

    HatsoffPost.find({'to_uid':data.to_uid}).count(function(err, count){
      if (err) throw err;
      HatsoffPost.find({'user.uid':socket.uid, 'to_uid':data.to_uid}).exec(function(error, docs){
        if(error) throw error;
        console.log('hatsoff status:'+docs);
        socket.emit('hatsoff status', {docs:docs, count:count});
      }); 
    });

    /***
    var query_cp = CommunityPost.find({'user.uid':data.to_uid});
    query_cp.sort('-created').limit(30).exec(function(err, communitydocs){
      if (err) throw err;
      var query_sh = SharePost.find({'user.uid':data.to_uid});
      query_sh.sort('-created').limit(30).exec(function(err, sharedocs){
         if (err) throw err;
         socket.emit('update user timeline history', {share:sharedocs, community:communitydocs});
      }); 
    }); 
    ***/

    var query_cp = CommunityPost.find({'user.uid':data.to_uid});
      async.waterfall([
        function(callback){
           console.log("communitydocs");
           var query_cp = CommunityPost.find({'user.uid':data.to_uid});
           query_cp.sort('-created').limit(30).exec(function(err, communitydocs){
              callback(null, communitydocs);
           });
        },
        function(communitydocs, callback){
           console.log("communitydocs:"+communitydocs.length);
           var query_sh = SharePost.find({'user.uid':data.to_uid});
           query_sh.sort('-created').limit(30).exec(function(err, sharedocs){
              callback(null, communitydocs, sharedocs);
           });
        },
        function(communitydocs, sharedocs){ 
           var newdocs = [];
           var curIdx = 0;
           var len = sharedocs.length;
           if (len == 0){
               socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
           }else{

               async.each(sharedocs, function(docs){
                if (docs.content_type == 1){
                  async.waterfall([
                     function(callback){
                        CommunityPost.findOne({'_id':docs.content_id}).exec(function(err, post){
                          callback(null, post);
                        });
                     },
                     function(post){
                       console.log("second");
                       docs.set('content', post.toJSON(), {strict: false});
                       newdocs.push(docs);
                       //console.log("****newdocs****:"+newdocs);
                       curIdx += 1;
                       if (curIdx == len){
                        console.log("***********************************length of newdocs:"+newdocs.length);
                        socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                       }
                     }
                  ], function(err, result){
                });

                } else if(docs.content_type == 2){
                 curIdx += 1;
                 if (curIdx == len){
                  console.log("***********************************length of newdocs:"+newdocs.length);
                  socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                 }
                } else if(docs.content_type == 3){
                 curIdx += 1;
                 if (curIdx == len){
                  console.log("***********************************length of newdocs:"+newdocs.length);
                  socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                 }
                } else if(docs.content_type == 4){
                 curIdx += 1;
                 if (curIdx == len){
                  console.log("***********************************length of newdocs:"+newdocs.length);
                  socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                 }
                } else{
                 curIdx += 1;
                 if (curIdx == len){
                  console.log("***********************************length of newdocs:"+newdocs.length);
                  socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                 }
                }
                    });
           }
        },
        ], function(err, result){
          console.log("err:"+err);
        }); 

    /**
    var query_cp = CommunityPost.find({'user.uid':data.to_uid});
    async.waterfall([
        function(callback){
           console.log("communitydocs");
           var query_cp = CommunityPost.find({'user.uid':data.to_uid});
           query_cp.sort('-created').limit(30).exec(function(err, communitydocs){
              callback(null, communitydocs);
           });
        },
        function(communitydocs, callback){
           console.log("communitydocs:"+communitydocs.length);
       	   var query_sh = SharePost.find({'user.uid':data.to_uid});
	   query_sh.sort('-created').limit(30).exec(function(err, sharedocs){
              callback(null, communitydocs, sharedocs);
           });
        },
        function(communitydocs, sharedocs){ 
           var newdocs = [];
           var curIdx = 0;
           var len = sharedocs.length;
	   async.each(sharedocs, function(docs){
		if (docs.content_type == 1){
		  async.waterfall([
		     function(callback){
		         CommunityPost.findOne({'_id':docs.content_id}).exec(function(err, post){
                            callback(null, post);
                         });
		     },
		     function(post){
		         console.log("second");
		         docs.set('content', post.toJSON(), {strict: false});
		         newdocs.push(docs);
		         //console.log("****newdocs****:"+newdocs);
		         curIdx += 1;
                         if (curIdx == len){
			  console.log("***********************************length of newdocs:"+newdocs);
			  socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                         }
		     }
		  ], function(err, result){
	          });
		} else if(docs.content_type == 2){
		 curIdx += 1;
                 if (curIdx == len){
		  console.log("***********************************length of newdocs:"+newdocs);
		  socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                 }
		} else if(docs.content_type == 3){
		 curIdx += 1;
                 if (curIdx == len){
		  console.log("***********************************length of newdocs:"+newdocs);
		  socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                 }
		} else if(docs.content_type == 4){
		 curIdx += 1;
                 if (curIdx == len){
		  console.log("***********************************length of newdocs:"+newdocs);
		  socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                 }
		} else{
		 curIdx += 1;
                 if (curIdx == len){
		  console.log("***********************************length of newdocs:"+newdocs);
		  socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                 }
		}
          });
        },
        ], function(err, result){
          console.log("err:"+err);
        });
    **/

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

  socket.on('at notification', function(){
    console.log('check notification');
    var newdocs = [];
    var query = NotificationPost.find({'to_uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('sending notification'+docs);
      //socket.emit('update notification', docs);
      var len = docs.length;
      var curIdx = 0;
      async.each(docs, function(doc){
         var uid = doc.action_user.uid;
         async.waterfall([
                 function(callback){
                    //CommunityMember.findOne({ uid : uid }).lean().exec(function(err, post){
                    CommunityMember.findOne({ uid : uid }, function(err, post){
                      console.log('Community post:'+post);
                      console.log('Community post:'+ typeof post );
                      callback(null, post);
                    });
                 },
                 function(post, callback){
                    //CommunityMember.findOne({ uid : uid }).lean().exec(function(err, post){
                    var uid1, uid2, action_user;
                    if (socket.uid < uid){
                      uid1 = socket.uid;
                      uid2 = uid; 
                      action_user = 1;
                    }else{
                      uid2 = socket.uid;
                      uid1 = uid; 
                      action_user = 2;
                    }

                    FollowPost.findOne({uid1:uid1, uid2:uid2}).exec(function(err, result){
                      var fstatus = 0;
                      if (result){
                        if(result.status == 2){
                          fstatus = 1;
                        }else if (result.status == 1 && uid1 == socket.uid && result.action_user == 1){
                          fstatus = 1;
                        }else if (result.status == 1 && uid2 == socket.uid && result.action_user == 2){
                          fstatus = 1;
                        }

                      }
                      callback(null, post, fstatus);
                    });
                 },
                 function(post, fstatus){
                   console.log("second:"+uid);
                   if (post != null){
                      console.log("::::::::::::::::::::::not null:::::::::::::::::");
                      var friend = JSON.stringify(post);
                      var obj = JSON.parse(friend);
                      console.log(obj);
                      var f = obj["friends"];
                      doc.set('friends', f, {strict: false});
                      doc.set('fstatus', fstatus, {strict: false});
                      console.log("friend doooooooooooooc:"+doc);
                      newdocs.push(doc);
                   }else{
                      doc.set('fstatus', fstatus, {strict: false});
                      newdocs.push(doc);
                   }
                   //console.log("****newdocs****:"+newdocs);
                   curIdx += 1;
                   if (curIdx == len){
                      console.log("***********************************length of notification newdocs:"+newdocs.length);
                      console.log(newdocs);
                      console.log("***********************************");
                      CommunityMember.findOne({ uid : socket.uid }, function(err, mycm){
                        console.log("mycm:"+mycm);
                        socket.emit('update notification', {newdocs:newdocs, myMember:mycm});
                      });
                   }
                 }
          ], function(err, result){
        });
      });
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
    console.log("data type:", typeof data.data);
    console.log('tag:'+data.tag); 
    var ls = [];
    if(data.skillls.length != 0){
      for (var i = 0; i < data.skillls.length; i++) {
        var item = data.skillls[i];  // Calling myNodeList.item(i) isn't necessary in JavaScript
        ls.push(item);
        console.log(item);
      }
      if (data.skillls.length < 5){
        for (var i = data.skillls.length; i <= 5; i++){
          ls.push(data.skillls[0]);
        }
      }
    }

    db.serialize(function() {
     db.each("SELECT * FROM week1_profile where skill1 in ('"+ls[0]+" \',\' "+ls[1]+" \',\' "+ls[2]+" \',\'"+ls[3]+" \',\'"+ls[4]+"') OR skill2 in ('"+ls[0]+" \',\' "+ls[1]+" \',\' "+ls[2]+" \',\'"+ls[3]+" \',\'"+ls[4]+"') OR skill3 in ('"+ls[0]+" \',\' "+ls[1]+" \',\' "+ls[2]+" \',\'"+ls[3]+" \',\'"+ls[4]+"') OR skill4 in ('"+ls[0]+" \',\' "+ls[1]+" \',\' "+ls[2]+" \',\'"+ls[3]+" \',\'"+ls[4]+"') OR skill5 in ('"+ls[0]+" \',\' "+ls[1]+" \',\' "+ls[2]+" \',\'"+ls[3]+" \',\'"+ls[4]+"') OR skill6 in ('"+ls[0]+" \',\' "+ls[1]+" \',\' "+ls[2]+" \',\'"+ls[3]+" \',\'"+ls[4]+"') OR skill7 in ('"+ls[0]+" \',\' "+ls[1]+" \',\' "+ls[2]+" \',\'"+ls[3]+" \',\'"+ls[4]+"') OR skill8 in ('"+ls[0]+" \',\' "+ls[1]+" \',\' "+ls[2]+" \',\'"+ls[3]+" \',\'"+ls[4]+"') OR skill9 in ('"+ls[0]+" \',\' "+ls[1]+" \',\' "+ls[2]+" \',\'"+ls[3]+" \',\'"+ls[4]+"') OR skill10 in ('"+ls[0]+" \',\' "+ls[1]+" \',\' "+ls[2]+" \',\'"+ls[3]+" \',\'"+ls[4]+"')",  function(err, row) {
        if(err){
          console.log(err);
        }
        console.log(row.user_id + ": " + row.profession);
     });
    });

    var newPost;    
    if (data.data){
      newPost = new CommunityPost({content:data.msg, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, tag:data.tag, skillls:data.skillls, image:{data:data.data['file'], contentType: data.data['type']}, shares:0, likes:0});
    }else{
      newPost = new CommunityPost({content:data.msg, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, tag:data.tag, skillls:data.skillls, shares:0, likes:0});
    }
    newPost.save(function(err, post){
      if (err) {
        console.log(err);
      } else{
        console.log('saved:'+post);
        io.emit('new community post', {msg:data.msg, image:data.data, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname, community_id:post.id, tag:data.tag, skillls:data.skillls});
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

  socket.on('community comment', function(data, callback){
    var d = new Date();
    console.log('community comment date:'+d); 
    
    CommunityPost.findById(data.c_id, function(err, post){
      if (err) {
        console.log(err);
      } else{
        post.replys.push({user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content:data.msg});
        post.save(function (err) {
          if (!err) {
            console.log('Success!');
            io.emit('new community comment', {msg:data.msg, community_id:data.c_id, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname});
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

  socket.on('give collaborate', function(data, callback){
    var d = new Date();
    console.log('date:'+d); 
    console.log('give collaborate:'+socket.uid); 
    
    var newPost = new CollaboratePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_id:data.c_id, content_type:data.c_type});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('saved:');
      }
    });

    var newNotification = new NotificationPost({action_id:7, to_uid:data.to, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_id:data.c_id, content_type:data.c_type});

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

/*
    var newhat = new HatsoffPost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:data.content_type, content_id:data.content_id});
    newhat.save(function(err){
      if (err) {
        console.log(err);
      } else{
        socket.emit('new history', {to_uid:data.to_uid, content_type:data.content_type, content_id:data.content_id, action_id:2});
        if (data.to_uid in users){
          users[data.to_uid].emit('new notification', {action_id:2, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
        }
      }

    });
*/

    HatsoffPost.findOne({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:data.content_type, content_id:data.content_id}).exec(function(err, result){
      if(err){
        console.log(err);
      }else{
        if (!result){
          var newPost = new HatsoffPost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:data.content_type, content_id:data.content_id});
          newPost.save(function(err){
              if (err) {
                console.log(err);
              } else{
                socket.emit('new history', {to_uid:data.to_uid, content_type:data.content_type, content_id:data.content_id, action_id:2});
                socket.emit('new hatsoff userpage');
                if (data.to_uid in users){
                    users[data.to_uid].emit('new notification', {action_id:2, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
                }
              }
          });

        } 
      }
    });

    var newNotification = new NotificationPost({action_id:2, to_uid:data.to_uid, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        //console.log('saved:');
      }
    });
  });

  socket.on('give follow', function(data, callback){
    var d = new Date();
    console.log('give follow'+socket.uid); 

    var uid1, uid2, action_user;
    if (socket.uid < data.to_uid){
      uid1 = socket.uid;
      uid2 = data.to_uid; 
      action_user = 1;
    }else{
      uid2 = socket.uid;
      uid1 = data.to_uid; 
      action_user = 2;
    }
    
    FollowPost.findOne({uid1:uid1, uid2:uid2}).exec(function(err, result){
      if(err){
      }else{

        if(!result){
          var newPost = new FollowPost({uid1:uid1, uid2:uid2, action_user:action_user, status:1});
          newPost.save(function(err){
            if (err) {
              console.log(err);
            } else{
              console.log('new history');
              socket.emit('new history', {to_uid:data.to_uid, content_type:1, action_id:8});
              if (data.to_uid in users){
                  users[data.to_uid].emit('new notification', {action_id:8, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
              }
            }
          }); 
        }else{
          console.log('result:'+result);
          if (result.action_user != action_user && result.status != 2){
            result.status = 2;
            result.save();
            CommunityMember.findOne({uid:uid1}).exec(function(err, result){
              if (result){
                result.friends.push(uid2);
                result.save(function (er) {
                  console.log("friends saved");
                });
              }else{
                var cm = new CommunityMember({uid:uid1, friends:[uid2]})
                cm.save(function(e){
                  console.log("new friends saved");
                })
              }

            });

            CommunityMember.findOne({uid:uid2}).exec(function(err, result){
              if(result){
                result.friends.push(uid1);
                result.save(function (err) {
                  console.log("friends saved");
                });
              }else{
                var cm = new CommunityMember({uid:uid2, friends:[uid1]})
                cm.save(function(e){
                  console.log("new friends saved");
                })
              }
            });

          }else{
            console.log("status:"+result.status); 
          }
         }

      }
    });

    var newNotification = new NotificationPost({action_id:8, to_uid:data.to_uid, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('notification saved:');
      }
    });
  });

  socket.on('get community likeusers', function(data){
    LikePost.find({'content_type':1, content_id:data.c_id}).exec(function(err, docs){
      socket.emit('list community likeusers', {c_id:data.c_id, result:docs});
    });
  });

  socket.on('unlike community', function(data, callback){
    LikePost.find({'to_uid':data.to_uid, 'user.uid':socket.uid, 'content_type':1}).remove().exec();
    CommunityPost.findById(data.c_id, function(err, doc){
      if (err) console.log(err);

      if (doc.likes > 0){
        doc.likes -= 1;
        doc.save(callback);
      }
    });

    console.log('unlike community');
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

    CommunityPost.findById(data.c_id, function(err, doc){
      if (err) console.log(err);

      doc.likes += 1;
      doc.save(callback);
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

  socket.on('unlike upcoming', function(data, callback){
    LikePost.find({'to_uid':data.to_uid, 'user.uid':socket.uid, 'content_type':2}).remove().exec();
    console.log('unlike upcoming');
  });

  socket.on('unlike portfolio', function(data, callback){
    LikePost.find({'to_uid':data.to_uid, 'user.uid':socket.uid, 'content_type':3, 'content_id':data.c_id}).remove().exec();
    console.log('unlike portfolio');
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

    CommunityPost.findById(data.c_id, function(err, post){
      if (err) {
        console.log(err);
      } else{
         var newPost = new CommunityPost({content:post.content, user:{uid:post.user.uid, first_name:post.user.first_name, last_name:post.user.last_name}, tag:post.tag, skillls:post.skillls, sharedBy:socket.uid, content_id:data.c_id});
         newPost.save(function(error, newpost){
            if (error) {
              console.log(error);
            } else{
              console.log('saved:'+newpost);
              //io.emit('new community post', {msg:data.msg, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname, community_id:post.id, tag:data.tag, skillls:data.skillls});
            }
         });
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

  socket.on('search query', function(query){
    console.log('search query'+query);

    //db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!=? AND week1_profile.user_id=auth_user.id AND (week1_profile.skill1=? OR week1_profile.skill2=? OR week1_profile.skill3=? OR week1_profile.skill4=? OR week1_profile.skill5=? OR week1_profile.skill6=? OR week1_profile.skill7=? OR week1_profile.skill8=? OR week1_profile.skill9=? OR week1_profile.skill10=?) GROUP BY week1_profile.user_id", [socket.uid, query, query, query, query, query, query, query, query, query, query], function(err, rows){
    db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!=? AND week1_profile.user_id=auth_user.id AND (week1_profile.profession1=? OR week1_profile.profession2=? OR week1_profile.profession3=? OR week1_profile.profession4=? OR week1_profile.profession5=?) GROUP BY week1_profile.user_id", [socket.uid, query, query, query, query, query], function(err, rows){
      socket.emit('get search result by profession', rows);
      console.log("search result by profession"+rows);
    });

    db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!=? AND week1_profile.user_id=auth_user.id AND (week1_profile.skill1=? OR week1_profile.skill2=? OR week1_profile.skill3=? OR week1_profile.skill4=? OR week1_profile.skill5=? OR week1_profile.skill6=? OR week1_profile.skill7=? OR week1_profile.skill8=? OR week1_profile.skill9=? OR week1_profile.skill10=?) GROUP BY week1_profile.user_id", [socket.uid, query, query, query, query, query, query, query, query, query, query], function(err, rows){
      socket.emit('get search result by skill', rows);
      console.log("search result by skill"+rows);
    });

    //db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!=? AND week1_profile.user_id=auth_user.id AND (auth_user.first_name=? OR auth_user.last_name=? ) GROUP BY week1_profile.user_id", [socket.uid, query, query], function(err, rows){
    db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!=? AND week1_profile.user_id=auth_user.id AND (auth_user.first_name=? OR auth_user.last_name=? ) GROUP BY week1_profile.user_id ", [socket.uid, query, query], function(err, rows){
      socket.emit('get search result by user name', rows);
      console.log("search result by user name"+rows);
    });

    db.all("SELECT week1_showcase.user_id, auth_user.first_name, auth_user.last_name, week1_showcase.title, week1_showcase.image, week1_showcase.tag1, week1_showcase.tag2, week1_showcase.tag3, week1_showcase.describe FROM week1_showcase, auth_user WHERE week1_showcase.user_id!=? AND week1_showcase.user_id=auth_user.id AND (week1_showcase.tag1=? OR week1_showcase.tag2=? ) ", [socket.uid, query, query], function(err, rows){
      socket.emit('get search result by portfolio', rows);
      console.log("search result by portfolio"+rows);
    });

    db.all("SELECT week1_upcomingwork.user_id, auth_user.first_name, auth_user.last_name, week1_upcomingwork.title, week1_upcomingwork.image, week1_upcomingwork.tag1, week1_upcomingwork.tag2, week1_upcomingwork.tag3, week1_upcomingwork.describe FROM week1_upcomingwork, auth_user WHERE week1_upcomingwork.user_id!=? AND week1_upcomingwork.user_id=auth_user.id AND (week1_upcomingwork.tag1=? OR week1_upcomingwork.tag2=? ) ", [socket.uid, query, query], function(err, rows){
      socket.emit('get search result by upcoming', rows);
      console.log("search result by upcoming"+rows);
    });

  });


  socket.on('send message', function(data){
    console.log('send message');

    if(data.to_uid){
      var uid1, uid2, action_user;
      if (socket.uid < data.to_uid){
        uid1 = data.uid;
        uid2 = data.to_uid; 
        action_user = 1;
      }else{
        uid2 = data.uid;
        uid1 = data.to_uid; 
        action_user = 2;
      }

      console.log('uid1:'+uid1);
      console.log('uid2:'+uid2);
      MessageRelation.findOne({ uid1:uid1, uid2:uid2 }).exec(function(err, result){
        if (err) {
          console.log(err);
        }else {
          if (result){

            if(data.data && data.data != {}){
              result.messages.push({uid:data.uid, content:data.msg, image:{data:data.data['file'], contentType: data.data['type']}});
            }else{
              result.messages.push({uid:data.uid, content:data.msg});
            }
            result.save(function (error) {
              if (!error) {
                console.log('Succeed to send message!');
              }
              console.log('sent message is saved!');
              socket.join(result._id);
              //socket.emit('new message', {uid:data.uid, content:data.msg});
              io.sockets.in(result._id).emit('new message', {uid:data.uid, to_uid:data.to_uid, content:data.msg, room_id:result._id, image:data.data});
              console.log('result:'+result);
            });

          }else{

          }

        }
      });
    }else if(data.room_id){

      MessageRelation.findById(data.room_id, function(err, result){
        if (err) {
          console.log(err);
        }else {
          if (result){

            if(data.data && data.data != {}){
              result.messages.push({uid:data.uid, content:data.msg, image:{data:data.data['file'], contentType: data.data['type']}});
            }else{
              result.messages.push({uid:data.uid, content:data.msg});
            }
            result.save(function (error) {
              if (!error) {
                console.log('Succeed to send message!');
              }
              console.log('sent message is saved!');
              socket.join(result._id);
              io.sockets.in(result._id).emit('new message', {uid:data.uid, to_uid:data.to_uid, content:data.msg, room_id:result._id, image:data.data});
              console.log('result:'+result);
            });

          }else{

          }

        }
      });

    }

  });


/*
  socket.on('send message', function(data){
    io.sockets.in(data.room_id).emit('room message', data);

    MessageRelation.findById(data.room_id, function(err, post){
      if (err) {
        console.log(err);
      } else{
        post.messages.push({uid:socket.uid, content:data.msg});
        post.save(function (error) {
          if (!error) {
            console.log('Succeed to send message!');
          }
        });
      }
    });

  });
  */

  socket.on('get message', function(data){
    console.log('start message');
    var uid1, uid2, action_user;
    if (socket.uid < data.to_uid){
      uid1 = socket.uid;
      uid2 = data.to_uid; 
      action_user = 1;
    }else{
      uid2 = socket.uid;
      uid1 = data.to_uid; 
      action_user = 2;
    }

    MessageRelation.findOne({ uid1:uid1, uid2:uid2 }).exec(function(err, result){
      if (err) {
        console.log(err);
      }else {
        if (result){
          socket.join(result._id);
          socket.emit('set message', result);
          console.log('result:'+result);
        }else{

          var newMessageRelation = new MessageRelation({uid1:uid1, uid2:uid2, action_user:action_user, status:1 });
          newMessageRelation.save(function(error, newdata){

            if (error) {
              console.log(error);
            }else{
              /** emmit new message to data.to_uid message.html **/
                console.log('newdata:'+newdata);
                socket.emit('set message', newdata) 
            }
          });

        }

      }
    });

  });


  /***
  uid1: Number,
  uid2: Number,
  action_user: Number,//1 or 2
  status: Number,//1: sent request, 2:accepted, 3:blocked
  **/

  socket.on('start message', function(data){
    console.log('start message');
    var uid1, uid2, action_user;
    if (socket.uid < data.to_uid){
      uid1 = socket.uid;
      uid2 = data.to_uid; 
      action_user = 1;
    }else{
      uid2 = socket.uid;
      uid1 = data.to_uid; 
      action_user = 2;
    }

    MessageRelation.findOne({ uid1:uid1, uid2:uid2 }).exec(function(err, result){
      if (err) {
        console.log(err);
      }else {
        if (!result){

          console.log("no result");

          var newMessageRelation = new MessageRelation({uid1:uid1, uid2:uid2, action_user:action_user, status:1, messages:{uid:socket.uid, content:data.msg}});
          newMessageRelation.save(function(error, newdata){

            if (error) {
              console.log(error);
            }else{
              /** emmit new message to data.to_uid message.html **/
              if (users[data.to_uid]){
                users[data.to_uid].emit('send first message', {uid:socket.uid, msg:data.msg, room_id:newdata._id}) 
                console.log("send first message!");
              }
            }
          });

        } else{
          socket.emit();
        }

      }
    });

  });

  socket.on('accept first message', function(data){
    var uid1, uid2, action_user;
    if (socket.uid < data.to_uid){
      uid1 = socket.uid;
      uid2 = data.to_uid; 
      action_user = 1;
    }else{
      uid2 = socket.uid;
      uid1 = data.to_uid; 
      action_user = 2;
    }

    var query = { uid1:uid1, uid2:uid2 };
    var option = {upsert:false};

    MessageRelation.update(query, {action_user:action_user, status:2}, option, function(err, raw){
      if ( err ) console.log(err);
      socket.emit('new accept user', {uid:data.to_uid, msg:data.msg, room_id:data.room_id});
     });

  });
  
  socket.on('block first message', function(data){

    var uid1, uid2, action_user;
    if (socket.uid < data.to_uid){
      uid1 = socket.uid;
      uid2 = data.to_uid; 
      action_user = 1;
    }else{
      uid2 = socket.uid;
      uid1 = data.to_uid; 
      action_user = 2;
    }

    var query = { uid1:uid1, uid2:uid };
    var option = {upsert:false};

    MessageRelation.update(query, {action_user:action_user, status:3}, option, function(err, raw){
      if ( err ) console.log(err);
      socket.emit('new block user', data.to_uid);
    });

  });

  socket.on('subscribe message room', function(room){
    console.log('join message room:'+room);
    socket.join(room);
  });

  socket.on('unsubscribe message room', function(room){
    console.log('leave message room:'+room);
    socket.leave(room);
  });


  socket.on('subscribe', function(room){
    console.log('join room:'+room);
    socket.join(room);
  });

  socket.on('unsubscribe', function(room){
    console.log('leaving room:'+room);
    socket.leave(room);
  });

  socket.on('send chat message', function(data) {
    console.log('sending message');
    io.sockets.in(data.room).emit('chat message', data);
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

