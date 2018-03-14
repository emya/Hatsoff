var app = require('express')();
var async = require('async');
var aws = require('aws-sdk');
var http = require('http').Server(app);
var io = require('socket.io').listen(app.listen(8889));
var mongoose = require('mongoose')
var users = {};
var chatusers = {};

var dbfile = '../db.sqlite3';
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbfile);

var redis = require('redis');
var client = redis.createClient();

client.on('connect', function() {
    console.log('redis connected');
});

var config = require('./config');

aws.config.update({ accessKeyId: config.aws.accessKeyId, secretAccessKey: config.aws.secretAccessKey });

var s3 = new aws.S3();

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
  user: {uid: String, first_name: String, last_name: String},
  content: String,
  created: {type: Date, default:Date.now}
});

var communitySchema = mongoose.Schema({
  user: {uid: String, first_name: String, last_name: String},
  content: String,
  portfolio : { image: String, title: String, description: String},
  upcoming : { image: String, title: String, description: String},
  image: { data: Boolean, contentType: String },
  replys: [replySchema],
  skillls: [String],
  tag: Number,//1: Yes, -1: No
  communityFlag: Number,//0: public, 1: private 
  sharedBy: Number,
  likes: Number,
  shares: Number,
  content_id: String,
  created: {type: Date, default:Date.now}
});

var CommunityPost = mongoose.model('CommunityPost', communitySchema);

var commentSchema = mongoose.Schema({
  to_uid: String,
  from_user: {uid: String, first_name: String, last_name: String},
  content: String,
  created: {type: Date, default:Date.now}
});

var CommentPost = mongoose.model('CommentPost', commentSchema);

// action id  1:comment, 2:hatsoff, 3:shareskill, 4:like, 5:share, 6:thanks, 7:collaborate, 8:follow
var notificationSchema = mongoose.Schema({
  to_uid: String,
  action_user: {uid: String, first_name: String, last_name: String},
  action_id: Number,
  content_type: Number,
  content_id: String,
  created: {type: Date, default:Date.now}
});

var NotificationPost = mongoose.model('NotificationPost', notificationSchema);

var upcomingSchema = mongoose.Schema({
  to_uid: String,
  user: {uid: String, first_name: String, last_name: String},
  content: String,
  created: {type: Date, default:Date.now}
});

var UpcomingPost = mongoose.model('UpcomingPost', upcomingSchema);

var portfolioSchema = mongoose.Schema({
  to_uid: String,
  p_id: Number,
  user: {uid: String, first_name: String, last_name: String},
  content: String,
  created: {type: Date, default:Date.now}
});

var PortfolioPost = mongoose.model('PortfolioPost', portfolioSchema);

var shareskillSchema = mongoose.Schema({
  to_uid: String,
  user: {uid: String, first_name: String, last_name: String},
  community_id: String,
  created: {type: Date, default:Date.now}
});

var ShareSkillPost = mongoose.model('ShareSkillPost', shareskillSchema);

var collaborateSchema = mongoose.Schema({
  to_uid: String,
  user: {uid: String, first_name: String, last_name: String},
  content_type: Number,
  content_id: String,
  created: {type: Date, default:Date.now}
});

var CollaboratePost = mongoose.model('CollaboratePost', collaborateSchema);

var likeSchema = mongoose.Schema({
  to_uid: String,
  user: {uid: String, first_name: String, last_name: String},
  content_type: Number,
  content_id: String,
  created: {type: Date, default:Date.now}
});
// content_type 1:community post 2:upcoming work 3:portfolio 4:shared post

var LikePost = mongoose.model('LikePost', likeSchema);

var ShareSchema = mongoose.Schema({
  to_uid: String,
  user: {uid: String, first_name: String, last_name: String},
  content_type: Number,
  content_id: String,
  created: {type: Date, default:Date.now}
});
// content_type 1:community post

var SharePost = mongoose.model('SharePost', ShareSchema);

var thanksSchema = mongoose.Schema({
  to_uid: String,
  user: {uid: String, first_name: String, last_name: String},
  created: {type: Date, default:Date.now}
});
// content_type 1:community post

var ThanksPost = mongoose.model('ThanksPost', thanksSchema);

//Status 1:only action user follows, 2:follow each other 
var followSchema = mongoose.Schema({
  uid1: String,
  uid2: String,
  action_user: Number,//1 or 2
  status: Number,//1: sent request, 2:accepted, 3:blocked
  //to_uid: Number,
  //user: {uid: Number, first_name: String, last_name: String},
  created: {type: Date, default:Date.now}
});
// content_type 1:community post

var FollowPost = mongoose.model('FollowPost', followSchema);

var hatsoffSchema = mongoose.Schema({
  to_uid: String,
  content_type: Number,
  content_id: String,
  user: {uid: String, first_name: String, last_name: String},
  created: {type: Date, default:Date.now}
});

// content_type 1:community post 2:upcoming work 3:portfolio 4:shared post 5:profile
var HatsoffPost = mongoose.model('HatsoffPost', hatsoffSchema);

var messageSchema = mongoose.Schema({
  uid: String,
  content: String,//1: sent request, 2:accepted, 3:blocked
  image: { data: Buffer, contentType: String },
  created: {type: Date, default:Date.now}
});

var MessagePost = mongoose.model('MessagePost', messageSchema);

var messageRelationSchema = mongoose.Schema({
  uid1: String,
  uid2: String,
  action_user: Number,//1 or 2
  status: Number,//1: sent request, 2:accepted, 3:blocked
  messages: [messageSchema],
  created: {type: Date, default:Date.now}
});
// content_type 1:community post

var MessageRelation = mongoose.model('MessageRelation', messageRelationSchema);

var communityMemberSchema = mongoose.Schema({
  uid: String,
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
  //console.log('a user connected');
});

io.on('connection', function(socket){

  socket.on('join message', function(data){
    /*
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
     */

     socket.uid = data.uid;
     socket.firstname = data.firstname;
     socket.lastname = data.lastname;
     users[socket.uid] = socket;
     updateUids();
  });

  socket.on('join chat', function(data){
     socket.uid = data.uid;
     socket.firstname = data.firstname;
     socket.lastname = data.lastname;
     chatusers[socket.uid] = socket;
     updatechatUids();
  });

  socket.on('at community members', function(data){
    CommunityMember.findOne({uid:socket.uid}).exec(function(err, result){
      if(result){
        var friends = result.friends;
        var tuplestr = "(";
        for (var i = 0; i < friends.length; i++){
          tuplestr += "?,";
        }
        tuplestr = tuplestr.substring(0, tuplestr.length - 1);
        tuplestr += ")";

        var liststr = "("+friends.join(",")+")";
        db.all("SELECT DISTINCT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM auth_user, week1_profile WHERE week1_profile.user_id==auth_user.id AND week1_profile.user_id in "+tuplestr, friends, function(err, rows){
          //db.all("SELECT user_id FROM week1_profile WHERE user_id!=? AND ( skill1 in "+tuplestr+" or skill2 in "+tuplestr+" or skill3 in "+tuplestr+" or skill4 in "+tuplestr+" or skill5  )", (socket.uid, skillls, skillls), function(err, rows){
          socket.emit('get community members', rows);
        });
      }
    });
  });

  socket.on('join community', function(data){
    var query = CommunityPost.find({});

    /*
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      console.log('join community');
      socket.emit('update community post', docs);
    }); 
    */

    key = "community_"+socket.uid;

/*
    client.del(key, function(err, response) {
      if (response == 1) {
        console.log("Deleted Successfully!")
      } else{
        console.log("Cannot delete")
      }
    });
*/
    var currentDate = new Date();
    var is_sent = false;

    client.exists(key, function(err, reply) {
      if (reply === 1) {
        client.hgetall(key, function(err, data) {
          var diffMs = currentDate - data.last_update;
          var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
          if (diffMins > 2){
            socket.emit('update community post', data);
            is_sent = true;
          }
        });
      }

      if (!is_sent) {
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

                CommunityMember.findOne({uid:socket.uid}).exec(function(err, result){
                  var friends = [];
                  if(result){
                    friends = result.friends;
                  }
                  socket.emit('update community post', {"sharedocs":sharedocs, "likedocs":likedocs, "hatsoffdocs":hatsoffdocs, "docs":docs, "friends":friends});
                  client.hmset(key, {
                      'sharedocs': JSON.stringify(sharedocs),
                      'likedocs': JSON.stringify(likedocs),
                      'hatsoffdocs': JSON.stringify(hatsoffdocs),
                      'docs': JSON.stringify(docs),
                      'friends': JSON.stringify(friends),
                      'last_update': new Date() 
                  });
                });
              });
            });
          });
        }); 
      }
    });

    db.serialize(function() {
      var base_query = `
          SELECT 
              week1_profile.skill1, week1_profile.skill2, week1_profile.skill3, week1_profile.skill4, week1_profile.skill5, 
              week1_profile.skill6, week1_profile.skill7, week1_profile.skill8, week1_profile.skill9, week1_profile.skill10
          FROM
              week1_profile, week1_user
          WHERE week1_user.uid='${socket.uid}' AND week1_user.id = week1_profile.user_id 
      `;
      //db.each("SELECT week1_profile.skill1, week1_profile.skill2, week1_profile.skill3, week1_profile.skill4, week1_profile.skill5, week1_profile.skill6, week1_profile.skill7, week1_profile.skill8, week1_profile.skill9, week1_profile.skill10 FROM week1_profile, week1_user where week1_user.uid =? AND week1_user.id = week1_profile.user_id ", socket.uid, function(err, row) {
      db.each(base_query, function(err, row) {
        if(err){
          console.log(err);
        }
        else {
          if (row.skill1 != "" || row.skill2 != "" || row.skill3 !="" || row.skill4 != "" || row.skill5 != "" || row.skill6 != "" || row.skill7 !="" || row.skill8 != "" || row.skill9 != "" || row.skill10 != "" ){
            var skillls_empty = [row.skill1, row.skill2, row.skill3, row.skill4, row.skill5, row.skill6, row.skill7, row.skill8, row.skill9, row.skill10];
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
                      newdocs.push(doc);
                    }
                  }
                }
                curIdx += 1;
                if (len == curIdx){
                  socket.emit('three community posts need you', newdocs);
                }
              });
            });

            //var uids = [];
            var tuplestr = "(?,?,?,?,?,?,?,?,?,?)";
            var liststr = "('"+skillls.join("','")+"')";
            var collaborator_skill_query = `
                SELECT DISTINCT 
                    a.uid, a.first_name, a.last_name, p.profession1
                FROM 
                    week1_upcomingwork u, week1_user a, week1_profile p 
                WHERE 
                    u.user_id=a.id AND u.user_id=p.user_id AND a.uid!='${socket.uid}' AND
                   (u.collaborator_skill1 in ${liststr} or u.collaborator_skill2 in ${liststr} or u.collaborator_skill3 in ${liststr} or u.collaborator_skill4 in ${liststr} or u.collaborator_skill5 in ${liststr} or u.collaborator_skill6 in ${liststr} or u.collaborator_skill7 in ${liststr} or u.collaborator_skill8 in ${liststr} or u.collaborator_skill9 in ${liststr} or u.collaborator_skill10 in ${liststr})
                GROUP BY a.uid limit 3
                `;
            //db.all("SELECT DISTINCT a.uid, a.first_name, a.last_name, p.profession1 FROM week1_upcomingwork u, week1_user a, week1_profile p WHERE u.user_id=a.id AND u.user_id=p.user_id AND a.uid!=? AND (u.collaborator_skill1 in "+tuplestr+" or u.collaborator_skill2 in "+tuplestr+" or u.collaborator_skill3 in "+tuplestr+" or u.collaborator_skill4 in "+tuplestr+" or u.collaborator_skill5 in "+tuplestr+" or u.collaborator_skill6 in "+tuplestr+" or u.collaborator_skill7 in "+tuplestr+" or u.collaborator_skill8 in "+tuplestr+" or u.collaborator_skill9 in "+tuplestr+" or u.collaborator_skill10 in "+tuplestr+") GROUP BY a.uid limit 3", (socket.uid, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls), function(err, rows){
            db.all(collaborator_skill_query, function(err, rows){
              socket.emit('three collaborators need you', rows);
            });
          } 
        }
      });

      var upcoming_collaborator_skill_query = `
          SELECT 
              uw.collaborator_skill1, uw.collaborator_skill2, uw.collaborator_skill3, uw.collaborator_skill4, uw.collaborator_skill5, 
              uw.collaborator_skill6, uw.collaborator_skill7, uw.collaborator_skill8, uw.collaborator_skill9, uw.collaborator_skill10
          FROM
              week1_upcomingwork uw, week1_user u 
          WHERE u.id=uw.user_id AND u.uid='${socket.uid}' limit 1
      `;

      //db.each("SELECT uw.collaborator_skill1, uw.collaborator_skill2, uw.collaborator_skill3, uw.collaborator_skill4, uw.collaborator_skill5, uw.collaborator_skill6, uw.collaborator_skill7, uw.collaborator_skill8, uw.collaborator_skill9, uw.collaborator_skill10 FROM week1_upcomingwork uw, week1_user u where u.id=uw.user_id AND u.uid=? limit 1", socket.uid, function(err, row) {
      db.each(upcoming_collaborator_skill_query, function(err, row) {
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
            var liststr = "('"+skillls.join("','")+"')";
            var profession_query = `
                SELECT
                    a.uid, a.first_name, a.last_name, p.profession1 
                FROM week1_profile p, week1_user a 
                WHERE a.uid!='${socket.uid}' AND p.user_id=a.id AND 
                  (p.skill1 in ${liststr} or p.skill2 in ${liststr} or p.skill3 in ${liststr} or p.skill4 in ${liststr} or p.skill5 in ${liststr} or p.skill6 in ${liststr} or p.skill7 in ${liststr} or p.skill8 in ${liststr} or p.skill9 in ${liststr} or p.skill10 in ${liststr} )
                GROUP BY a.uid limit 3
            `;

            //db.all("SELECT a.uid, a.first_name, a.last_name, p.profession1 FROM week1_profile p, week1_user a WHERE a.uid!=? AND p.user_id=a.id AND (p.skill1 in "+tuplestr+" or p.skill2 in "+tuplestr+" or p.skill3 in "+tuplestr+" or p.skill4 in "+tuplestr+" or p.skill5 in "+tuplestr+" or p.skill6 in "+tuplestr+" or p.skill7 in "+tuplestr+" or p.skill8 in "+tuplestr+" or p.skill9 in "+tuplestr+" or p.skill10 in "+tuplestr+") GROUP BY a.uid limit 3", (socket.uid, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls), function(err, rows){
            db.all(profession_query, function(err, rows){
              socket.emit('three collaborators you need', rows);
            });
          }
        }
      });

      var upcoming_collaborator_query = `
          SELECT 
              uw.collaborator1, uw.collaborator2, uw.collaborator3, uw.collaborator4, uw.collaborator5 
          FROM
              week1_upcomingwork uw, week1_user u 
          WHERE u.id=uw.user_id AND u.uid='${socket.uid}' limit 1
      `;

      //db.each("SELECT uw.collaborator_skill1, uw.collaborator_skill2, uw.collaborator_skill3, uw.collaborator_skill4, uw.collaborator_skill5, uw.collaborator_skill6, uw.collaborator_skill7, uw.collaborator_skill8, uw.collaborator_skill9, uw.collaborator_skill10 FROM week1_upcomingwork uw, week1_user u where u.id=uw.user_id AND u.uid=? limit 1", socket.uid, function(err, row) {
      db.each(upcoming_collaborator_query, function(err, row) {
        if(err){
          console.log(err);
        }
        else{
          if (row.collaborator1 != "" || row.collaborator2 != "" || row.collaborator3 !="" || row.collaborator4 != "" || row.collaborator5 != "" ){

            var professions_empty = [row.collaborator1, row.collaborator2, row.collaborator3, row.collaborator4, row.collaborator5];
            var professions = [];
            for (var i = 0; i < 5; i++){
              if (professions_empty[i] == ""){
                professions.push(professions_empty[0])
              }else{
                professions.push(professions_empty[i])
              }
            }
            var tuplestr = "(?,?,?,?,?,?,?,?,?,?)";
            var liststr = "('"+professions.join("','")+"')";
            var profession_query = `
                SELECT
                    a.uid, a.first_name, a.last_name, p.profession1 
                FROM week1_profile p, week1_user a 
                WHERE a.uid!='${socket.uid}' AND p.user_id=a.id AND 
                  (p.profession1 in ${liststr} or p.profession2 in ${liststr} or p.profession3 in ${liststr} or p.profession4 in ${liststr} or p.profession5 in ${liststr} )
                GROUP BY a.uid limit 3
            `;

            //db.all("SELECT a.uid, a.first_name, a.last_name, p.profession1 FROM week1_profile p, week1_user a WHERE a.uid!=? AND p.user_id=a.id AND (p.skill1 in "+tuplestr+" or p.skill2 in "+tuplestr+" or p.skill3 in "+tuplestr+" or p.skill4 in "+tuplestr+" or p.skill5 in "+tuplestr+" or p.skill6 in "+tuplestr+" or p.skill7 in "+tuplestr+" or p.skill8 in "+tuplestr+" or p.skill9 in "+tuplestr+" or p.skill10 in "+tuplestr+") GROUP BY a.uid limit 3", (socket.uid, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls), function(err, rows){
            db.all(profession_query, function(err, rows){
              socket.emit('three collaborators with profession you need', rows);
            });
          }
        }
      });


    });

    CommunityMember.findOne({uid:socket.uid}).exec(function(err, result){
      if(result){
        var friends = result.friends;
        var len = friends.length;
        socket.emit('community members number', len);
      }
    });

  });

  socket.on('leave community', function(uid){
    key = "community_"+uid;
    var query = CommunityPost.find({});
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

            CommunityMember.findOne({uid:socket.uid}).exec(function(err, result){
              if(!result){
                var friends = [];
                client.hmset(key, {
                  'sharedocs': JSON.stringify(sharedocs),
                  'likedocs': JSON.stringify(likedocs),
                  'hatsoffdocs': JSON.stringify(hatsoffdocs),
                  'docs': JSON.stringify(docs),
                  'friends': JSON.stringify(friends)
                });
              }else{
                var friends = result.friends;
                client.hmset(key, {
                  'sharedocs': JSON.stringify(sharedocs),
                  'likedocs': JSON.stringify(likedocs),
                  'hatsoffdocs': JSON.stringify(hatsoffdocs),
                  'docs': JSON.stringify(docs),
                  'friends': JSON.stringify(friends)
                });
              }
            });
          });
        });
      });
    }); 
  });

  socket.on('get community members number', function(){

    CommunityMember.findOne({uid:socket.uid}).exec(function(err, result){
      if(!result){
        console.log("no results");
      }else{
        var friends = result.friends;
        var len = friends.length;
        socket.emit('community members number', len);
      }
    });

  })

  socket.on('get suggested posts', function(){
    db.each("SELECT skill1, skill2, skill3, skill4, skill5, skill6, skill7, skill8, skill9, skill10 FROM week1_profile where user_id=? ", socket.uid, function(err, row) {
        if(err){
          console.log(err);
        }
        else {
          if (row.skill1 != "" || row.skill2 != "" || row.skill3 !="" || row.skill4 != "" || row.skill5 != "" || row.skill6 != "" || row.skill7 !="" || row.skill8 != "" || row.skill9 != "" || row.skill10 != "" ){
            var skillls_empty = [row.skill1, row.skill2, row.skill3, row.skill4, row.skill5, row.skill6, row.skill7, row.skill8, row.skill9, row.skill10];
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
                      newdocs.push(doc);
                    }
                  }
                }
                curIdx += 1;
                if (len == curIdx){
                  socket.emit('three community posts need you', newdocs);
                }
              });
            });

          } 
        }
      });
  });

  socket.on('join community post', function(data){
    /*
    CommunityPost.findById(data.c_id, function(err, post){
      if (err) throw err;
      socket.emit('get community post', post);
    });
    */

    CommunityPost.findById(data.c_id, function(err, post){
      if (err) throw err;
      var query1 = LikePost.find({'user.uid':socket.uid, 'content_type':1, 'content_id':data.c_id}).select('user');
      query1.exec(function(err1, likedocs){
        if (err1) throw err1;

        var query2 = SharePost.find({'user.uid':socket.uid, 'content_type':1, 'content_id':data.c_id}).select('user');
        query2.exec(function(err2, sharedocs){
          if (err2) throw err2;

          var query3 = HatsoffPost.find({'user.uid':socket.uid, 'content_type':1, 'content_id':data.c_id}).select('user');
          query3.exec(function(err3, hatsoffdocs){
            if (err3) throw err3;

            socket.emit('get community post', {sharedocs:sharedocs, likedocs:likedocs, hatsoffdocs:hatsoffdocs, post:post});
          });
        });
      });
    }); 

  });

  socket.on('at community needs you', function(data){

      /////new lines
    db.serialize(function() {
      db.each("SELECT skill1, skill2, skill3, skill4, skill5, skill6, skill7, skill8, skill9, skill10 FROM week1_profile where user_id=?", socket.uid, function(err, row) {
        if(err){
          console.log(err);
        }
        else {
          if (row.skill1 != "" || row.skill2 != "" || row.skill3 !="" || row.skill4 != "" || row.skill5 != "" || row.skill6 != "" || row.skill7 !="" || row.skill8 != "" || row.skill9 != "" || row.skill10 != "" ){
            var skillls = [row.skill1, row.skill2, row.skill3, row.skill4, row.skill5, row.skill6, row.skill7, row.skill8, row.skill9, row.skill10];
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
                    if (item != "" && skillls.indexOf(item) != -1 ){
                      newdocs.push(doc);
                    }
                  }
                }
                curIdx += 1;
                if (len == curIdx){
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

    var base_query = `
         SELECT 
             collaborator1, collaborator2, collaborator3, collaborator4, collaborator5, 
             collaborator_skill1, collaborator_skill2, collaborator_skill3, collaborator_skill4, collaborator_skill5, 
             collaborator_skill6, collaborator_skill7, collaborator_skill8, collaborator_skill9, collaborator_skill10 
         FROM week1_upcomingwork where user_id=${socket.uid} limit 1
         `;
    //db.each("SELECT collaborator1, collaborator2, collaborator3, collaborator4, collaborator5, collaborator_skill1, collaborator_skill2, collaborator_skill3, collaborator_skill4, collaborator_skill5, collaborator_skill6, collaborator_skill7, collaborator_skill8, collaborator_skill9, collaborator_skill10 FROM week1_upcomingwork where user_id=? limit 1", socket.uid, function(err, row) {
    db.each(base_query, function(err, row) {
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

              db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!="+socket.uid+" AND week1_profile.user_id=auth_user.id AND (week1_profile.profession1 in "+c_liststr+" OR week1_profile.profession2 in "+c_liststr+" OR week1_profile.profession3 in "+c_liststr+" OR week1_profile.profession4 in "+c_liststr+" OR week1_profile.profession5 in "+c_liststr+" OR week1_profile.skill1 in "+liststr+" OR week1_profile.skill2 in "+liststr+" OR week1_profile.skill3 in "+liststr+" OR week1_profile.skill4 in "+liststr+" OR week1_profile.skill5 in "+liststr+" OR week1_profile.skill6 in "+liststr+" OR week1_profile.skill7 in "+liststr+" OR week1_profile.skill8 in "+liststr+" OR week1_profile.skill9 in "+liststr+" OR week1_profile.skill10 in "+liststr+") GROUP BY week1_profile.user_id", function(err, rows){
              //db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!=? AND week1_profile.user_id=auth_user.id AND (week1_profile.skill1 in "+tuplestr+" or week1_profile.skill2 in "+tuplestr+" or week1_profile.skill3 in "+tuplestr+" or week1_profile.skill4 in "+tuplestr+" or week1_profile.skill5 in "+tuplestr+" or week1_profile.skill6 in "+tuplestr+" or week1_profile.skill7 in "+tuplestr+" or week1_profile.skill8 in "+tuplestr+" or week1_profile.skill9 in "+tuplestr+" or week1_profile.skill10 in "+tuplestr+" or week1_profile.profession1 in "+c_tuplestr+" or week1_profile.profession2 in "+c_tuplestr+" or week1_profile.profession3 in "+c_tuplestr+" or week1_profile.profession4 in "+c_tuplestr+" or week1_profile.profession5 in "+c_tuplestr+" ) GROUP BY week1_profile.user_id", (socket.uid, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, collaboratorls, collaboratorls, collaboratorls, collaboratorls, collaboratorls), function(err, rows){
                socket.emit('get collaborators you need', rows);
              });


            }else{
              db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!="+socket.uid+" AND week1_profile.user_id=auth_user.id AND (week1_profile.skill1 in "+liststr+" or week1_profile.skill2 in "+liststr+" or week1_profile.skill3 in "+liststr+" or week1_profile.skill4 in "+liststr+" or week1_profile.skill5 in "+liststr+" or week1_profile.skill6 in "+liststr+" or week1_profile.skill7 in "+liststr+" or week1_profile.skill8 in "+liststr+" or week1_profile.skill9 in "+liststr+" or week1_profile.skill10 in "+liststr+") GROUP BY week1_profile.user_id", function(err, rows){
              //db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.profession, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!=? AND (week1_profile.skill1 in "+tuplestr+" or week1_profile.skill2 in "+tuplestr+" or week1_profile.skill3 in "+tuplestr+" or week1_profile.skill4 in "+tuplestr+" or week1_profile.skill5 in "+tuplestr+" or week1_profile.skill6 in "+tuplestr+" or week1_profile.skill7 in "+tuplestr+" or week1_profile.skill8 in "+tuplestr+" or week1_profile.skill9 in "+tuplestr+" or week1_profile.skill10 in "+tuplestr+") GROUP BY week1_profile.user_id", (socket.uid, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls), function(err, rows){
                socket.emit('get collaborators you need', rows);
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
            db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM auth_user, week1_profile, week1_upcomingwork WHERE week1_profile.user_id!=? AND week1_profile.user_id=auth_user.id AND week1_profile.user_id=week1_upcomingwork.user_id AND (week1_upcomingwork.collaborator_skill1 in "+tuplestr+" or week1_upcomingwork.collaborator_skill2 in "+tuplestr+" or week1_upcomingwork.collaborator_skill3 in "+tuplestr+" or week1_upcomingwork.collaborator_skill4 in "+tuplestr+" or week1_upcomingwork.collaborator_skill5 in "+tuplestr+" or week1_upcomingwork.collaborator_skill6 in "+tuplestr+" or week1_upcomingwork.collaborator_skill7 in "+tuplestr+" or week1_upcomingwork.collaborator_skill8 in "+tuplestr+" or week1_upcomingwork.collaborator_skill9 in "+tuplestr+" or week1_upcomingwork.collaborator_skill10 in "+tuplestr+") GROUP BY week1_profile.user_id ", (socket.uid, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls, skillls), function(err, rows){
            //db.all("SELECT user_id FROM week1_profile WHERE user_id!=? AND ( skill1 in "+tuplestr+" or skill2 in "+tuplestr+" or skill3 in "+tuplestr+" or skill4 in "+tuplestr+" or skill5  )", (socket.uid, skillls, skillls), function(err, rows){
              socket.emit('get collaborators need you', rows);
            });
          } 
        }
      });

  });

  socket.on('at talent list', function(data){
    var query = data.query;
    db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM auth_user, week1_profile WHERE (week1_profile.skill1=? OR week1_profile.skill2=? OR week1_profile.skill3=? OR week1_profile.skill4=? OR week1_profile.skill5=? OR week1_profile.skill6=? OR week1_profile.skill7=? OR week1_profile.skill8=? OR week1_profile.skill9=? OR week1_profile.skill10=?) AND week1_profile.user_id=auth_user.id GROUP BY week1_profile.user_id ", [query, query, query, query, query, query, query, query, query, query], function(err, rows){
      socket.emit('get talent list', rows);
    });
  });

  socket.on('at folder', function(data){
    var query = CollaboratePost.find({'to_uid':socket.uid});
      query.sort('-created').limit(30).exec(function(err, collaboratedocs){
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
    var query = HatsoffPost.find({'to_uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update hatsoffreceived', docs);
    }); 

    var query1 = HatsoffPost.find({'user.uid':socket.uid});
    query1.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update hatsoffgave', docs);
    }); 
  });


  socket.on('at thanks', function(data){
    var query = ThanksPost.find({'to_uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update thanksreceived', docs);
    }); 

    var query1 = ThanksPost.find({'user.uid':socket.uid});
    query1.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update thanksgave', docs);
    }); 
  });

  socket.on('at follow', function(data){

    var query = FollowPost.find().or([{ uid1:socket.uid, action_user:2, status:1 }, { uid1:socket.uid, status:2 }, { uid2:socket.uid, action_user:1, status:1 }, { uid2:socket.uid, status:2 }]);
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update followreceived', docs);
    }); 

    var query1 = FollowPost.find().or([{ uid1:socket.uid, action_user:1 }, { uid1:socket.uid, status:2 }, { uid2:socket.uid, action_user:2 }, { uid2:socket.uid, status:2 }]);
    query1.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
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
          socket.emit('update chat message', result);
          for (var i = 0; i < result.length; i++){
             socket.join(result[i]._id);
          }
        }

      }
    });

  });

  socket.on('at history', function(data){

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
      socket.emit('update share history', sharedocs);
    }); 

    var query3 = ShareSkillPost.find({'user.uid':socket.uid});
    query3.sort('-created').limit(30).exec(function(err, skilldocs){
      if (err) throw err;
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

    var query = CommentPost.find({'to_uid':data.uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update comment', docs);
    }); 

    var query2 = UpcomingPost.find({'to_uid':data.uid});
    query2.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update upcoming comment', docs);
    }); 

    var query3 = PortfolioPost.find({'to_uid':data.uid});
    query3.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update portfolio comment', docs);
    }); 

    ThanksPost.find({'to_uid':data.uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number thanks', count);
    }); 

    HatsoffPost.find({'to_uid':data.uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number hatsoff', count);
      HatsoffPost.find({'user.uid':data.uid, 'to_uid':data.uid}).exec(function(error, docs){
        if(error) throw error;
        socket.emit('hatsoff status at home', {docs:docs, count:count});
      }); 
    }); 

    FollowPost.find().or([{uid1:socket.uid, action_user:2, status:1}, {uid1:data.uid, status:2}, {uid2:data.uid, action_user:1, status:1}, {uid2:data.uid, status:2}]).count(function(err, count){
      if (err) throw err;
      socket.emit('number follow', count);
    }); 

/*
    LikePost.find({'to_uid':socket.uid, 'user.uid':socket.uid}).exec(function(error, result){
      if(error) throw error;

      if(result){
        socket.emit('like status at home', result);
      }
    }); 
*/

    LikePost.find({'to_uid':data.uid}).exec(function(error, result){
      if(error) throw error;

      if(result){
        socket.emit('likes at home', result);
      }
    });

    SharePost.find({'to_uid':data.uid}).exec(function(error, result){
      if(error) throw error;

      if(result){
        socket.emit('shares at home', result);
      }
    });

    // content_type 1:community post 2:upcoming work 3:portfolio 4:shared post
    var query_cp = CommunityPost.find({'user.uid':data.uid});
    async.waterfall([
        function(callback){
           var query_cp = CommunityPost.find({'user.uid':data.uid});
           query_cp.sort('-created').limit(30).exec(function(err, communitydocs){
              callback(null, communitydocs);
           });
        },
        function(communitydocs, callback){
       	   var query_sh = SharePost.find({'user.uid':data.uid});
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
        				 docs.set('content', post.toJSON(), {strict: false});
        				 newdocs.push(docs);
        				 //console.log("****newdocs****:"+newdocs);
        				 curIdx += 1;
        				 if (curIdx == len){
        				  socket.emit('update timeline history', {share:newdocs, community:communitydocs});
        				 }
        			 }
        		], function(err, result){
    	});

			} else if(docs.content_type == 2){
			 curIdx += 1;
			 if (curIdx == len){
			  socket.emit('update timeline history', {share:newdocs, community:communitydocs});
			 }
			} else if(docs.content_type == 3){
			 curIdx += 1;
			 if (curIdx == len){
			  socket.emit('update timeline history', {share:newdocs, community:communitydocs});
			 }
			} else if(docs.content_type == 4){
			 curIdx += 1;
			 if (curIdx == len){
			  socket.emit('update timeline history', {share:newdocs, community:communitydocs});
			 }
			} else{
			 curIdx += 1;
			 if (curIdx == len){
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
    var query = CommentPost.find({'to_uid':data.to_uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update comment', docs);
    }); 

    var query2 = UpcomingPost.find({'to_uid':data.to_uid});
    query2.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update upcoming comment', docs);
    }); 

    var query3 = PortfolioPost.find({'to_uid':data.to_uid});
    query3.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update portfolio comment', docs);
    }); 

    /*
    ThanksPost.find({'to_uid':data.to_uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number user thanks', count);
    }); 
    */

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
    if (data.uid < data.to_uid){
      uid1 = data.uid;
      uid2 = data.to_uid; 
      action_user = 1;
    }else{
      uid2 = data.uid;
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
        }else{
          //Default status is 2
          var newMessageRelation = new MessageRelation({uid1:uid1, uid2:uid2, action_user:action_user, status:2 });
          newMessageRelation.save(function(error, newdata){

            if (error) {
              console.log(error);
            }else{
              /** emmit new message to data.to_uid message.html **/
              socket.join(newdata._id);
              socket.emit('set message', newdata) 
            }
          });
        }
      }
    });

    LikePost.find({'to_uid':data.to_uid, 'user.uid':data.uid}).exec(function(error, result){
      if(error) throw error;

      if(result){
        socket.emit('like status', result);
      }
    }); 

    // Follow status 0:not following, 1:following
    //1: sent request, 2:accepted, 3:blocked
     FollowPost.find().or([{uid1:data.to_uid, action_user:2, status:1}, {uid1:data.to_uid, status:2}, {uid2:data.to_uid, action_user:1, status:1}, {uid2:data.to_uid, status:2}]).count(function(error, count){
      if(error) throw error;
         
      FollowPost.findOne({uid1:uid1, uid2:uid2}).exec(function(err, result){
        if(err){

        }else{
          if(result){
            if( result.status == 2){
              socket.emit('follow status', {status:2, count:count});
            }else if ((result.uid1==socket.uid && result.action_user==1) || (result.uid2==data.uid && result.action_user==2)){
              socket.emit('follow status', {status:1, count:count});
            }else{
              //Got request
              socket.emit('follow status', {status:11, count:count});
            }
          }else{
            socket.emit('follow status', {status:0, count:count});
          }
        }
      });
    });

    HatsoffPost.find({'to_uid':data.to_uid}).count(function(err, count){
      if (err) throw err;
      HatsoffPost.find({'user.uid':data.uid, 'to_uid':data.to_uid}).exec(function(error, docs){
        if(error) throw error;
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
           var query_cp = CommunityPost.find({'user.uid':data.to_uid});
           query_cp.sort('-created').limit(30).exec(function(err, communitydocs){
              callback(null, communitydocs);
           });
        },
        function(communitydocs, callback){
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
                       docs.set('content', post.toJSON(), {strict: false});
                       newdocs.push(docs);
                       //console.log("****newdocs****:"+newdocs);
                       curIdx += 1;
                       if (curIdx == len){
                        socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                       }
                     }
                  ], function(err, result){
                });

                } else if(docs.content_type == 2){
                 curIdx += 1;
                 if (curIdx == len){
                  socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                 }
                } else if(docs.content_type == 3){
                 curIdx += 1;
                 if (curIdx == len){
                  socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                 }
                } else if(docs.content_type == 4){
                 curIdx += 1;
                 if (curIdx == len){
                  socket.emit('update user timeline history', {share:newdocs, community:communitydocs});
                 }
                } else{
                 curIdx += 1;
                 if (curIdx == len){
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
    if (data.to_uid){
	var query = PortfolioPost.find({'to_uid':data.to_uid, 'p_id':data.p_id});
	query.sort('-created').limit(30).exec(function(err, docs){
	  if (err) throw err;
	  socket.emit('update portfolio comment', docs);
	}); 
    }else{
	var query = PortfolioPost.find({'to_uid':socket.uid, 'p_id':data.p_id});
	query.sort('-created').limit(30).exec(function(err, docs){
	  if (err) throw err;
	  socket.emit('update portfolio comment', docs);
	}); 
    }
  });

  socket.on('see userpage', function(data){
    var query = CommentPost.find({'to_uid':data.to});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      socket.emit('update comment', docs);
    }); 
  });

  socket.on('at notification', function(){
    var newdocs = [];
    var query = NotificationPost.find({'to_uid':socket.uid});
    query.sort('-created').limit(30).exec(function(err, docs){
      if (err) throw err;
      //socket.emit('update notification', docs);
      var len = docs.length;
      var curIdx = 0;
      async.each(docs, function(doc){
         var uid = doc.action_user.uid;
         async.waterfall([
                 function(callback){
                    //CommunityMember.findOne({ uid : uid }).lean().exec(function(err, post){
                    CommunityMember.findOne({ uid : uid }, function(err, post){
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
                          fstatus = 2;
                        }else if (result.status == 1 && uid1 == socket.uid && result.action_user == 1){
                          fstatus = 1;
                        }else if (result.status == 1 && uid2 == socket.uid && result.action_user == 2){
                          fstatus = 1;
                        }else{
                          fstatus = 11;
                        }

                      }
                      callback(null, post, fstatus);
                    });
                 },
                 function(post, fstatus){
                   if (post != null){
                      var friend = JSON.stringify(post);
                      var obj = JSON.parse(friend);
                      var f = obj["friends"];
                      doc.set('friends', f, {strict: false});
                      doc.set('fstatus', fstatus, {strict: false});
                      newdocs.push(doc);
                   }else{
                      doc.set('fstatus', fstatus, {strict: false});
                      newdocs.push(doc);
                   }
                   //console.log("****newdocs****:"+newdocs);
                   curIdx += 1;
                   if (curIdx == len){
                      CommunityMember.findOne({ uid : socket.uid }, function(err, mycm){
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
	    }else{
                callback('Erorr! Enter valid user');
	    }
        }else{
            callback('Error! Please enter a meesage for your whisper.');
	}
    }else{
	     io.emit('new message', {msg:msg, nick:socket.uid});
    }
  });

  socket.on('private message', function(data, callback){
    if (data.uid in users){
        users[data.uid].emit('whisper', {msg:data.msg, uid:socket.uid, uname:socket.firstname});
    }else{
        callback('Erorr! The user is not online');
    }
  });

  socket.on('community post', function(data, callback){
    var d = new Date();
    var ls = [];
    if(data.skillls.length != 0){
      for (var i = 0; i < data.skillls.length; i++) {
        var item = data.skillls[i];  // Calling myNodeList.item(i) isn't necessary in JavaScript
        ls.push(item);
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
     });
    });

    var newPost;    
    if (data.data){
      newPost = new CommunityPost({content:data.msg, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, tag:data.tag, skillls:data.skillls, communityFlag:0, image:{data:data.data['file'], contentType: data.data['type']}, shares:0, likes:0});
    }else{
      newPost = new CommunityPost({content:data.msg, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, tag:data.tag, skillls:data.skillls, communityFlag:0, shares:0, likes:0});
    }
    newPost.save(function(err, post){
      if (err) {
        console.log(err);
      } else{
        io.emit('new community post', {msg:data.msg, image:data.data, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname, community_id:post.id, tag:data.tag, skillls:data.skillls});
      }
    });
  });

  socket.on('private post', function(data, callback){
    var ls = [];
    if(data.skillls.length != 0){
      for (var i = 0; i < data.skillls.length; i++) {
        var item = data.skillls[i];  // Calling myNodeList.item(i) isn't necessary in JavaScript
        ls.push(item);
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
     });
    });

    var newPost;    
    if (data.data){
      newPost = new CommunityPost({content:data.msg, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, tag:data.tag, skillls:data.skillls, communityFlag:1, image:{data: true, contentType: data.data['type']}, shares:0, likes:0});
    }else{
      newPost = new CommunityPost({content:data.msg, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, tag:data.tag, skillls:data.skillls, communityFlag:1, shares:0, likes:0});
    }
    newPost.save(function(err, post){
      if (err) {
        console.log(err);
      } else{

        var image = { data: false }

        if (data.data){
          s3.putObject({
            Bucket: 'matchhat-community-posts',
            Key: post.id + '.png',
            Body: data.data['file'],
            ACL: 'public-read'
          }, function (resp) {
            console.log('Successfully uploaded package.');
          });
          image = { data: true, contentType: data.data['type'] }
        }

        CommunityMember.findOne({uid:socket.uid}).exec(function(err, result){
          if(!result){
            socket.emit('new private post', {msg:data.msg, image:image, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname, community_id:post.id, tag:data.tag, skillls:data.skillls});
          }else{
            var friends = result.friends;
            socket.emit('new private post', {msg:data.msg, image:image, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname, community_id:post.id, tag:data.tag, skillls:data.skillls});
            for (var i = 0; i < friends.length; i++){
              if (friends[i] in users){
                users[friends[i]].emit('new private post', {msg:data.msg, image:image, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname, community_id:post.id, tag:data.tag, skillls:data.skillls});
              }
            }
          }
        });
      }
    });
  });

  socket.on('reply community', function(data, callback){
    var d = new Date();
    
    CommunityPost.findById(data.c_id, function(err, post){
      if (err) {
        console.log(err);
      } else{
        post.replys.push({user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content:data.msg});
        post.save(function (err) {
          if (!err) {
            io.emit('new reply community', {msg:data.msg, community_id:data.c_id, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname});
          }
        });
      }
    });
    
  });

  socket.on('community comment', function(data, callback){
    var d = new Date();
    
    CommunityPost.findById(data.c_id, function(err, post){
      if (err) {
        console.log(err);
      } else{
        post.replys.push({user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content:data.msg});
        post.save(function (err) {
          if (!err) {
            io.emit('new community comment', {msg:data.msg, community_id:data.c_id, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname});
          }
        });
      }
    });
    
  });

  socket.on('share skill', function(data, callback){
    var d = new Date();
    
    var newPost = new ShareSkillPost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, community_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
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
    
    var newPost = new CollaboratePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_id:data.c_id, content_type:data.c_type});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      }
    });

    var newNotification = new NotificationPost({action_id:7, to_uid:data.to, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_id:data.c_id, content_type:data.c_type});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      }
    }); 
    
  });

  socket.on('give thanks', function(data, callback){
    var d = new Date();
    
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
      }
    });
  });

  socket.on('give hatsoff', function(data, callback){
    var d = new Date();

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
      }
    });
  });

  socket.on('give unhatsoff', function(data, callback){
    HatsoffPost.find({'to_uid':data.to_uid, 'user.uid':socket.uid, 'content_type':data.content_type, 'content_id':data.content_id}).remove().exec();
  });

  socket.on('give follow', function(data, callback){
    var d = new Date();

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
              socket.emit('new history', {to_uid:data.to_uid, content_type:1, action_id:8});
              if (data.to_uid in users){
                  users[data.to_uid].emit('new notification', {action_id:8, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
              }
            }
          }); 
        }else{
          if (result.action_user != action_user && result.status != 2){
            result.status = 2;
            result.save();
            socket.emit('new community member');
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
          }
         }
      }
    });

    var newNotification = new NotificationPost({action_id:8, to_uid:data.to_uid, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      }
    });
  });

  socket.on('get community likeusers', function(data){
    LikePost.find({'content_type':1, content_id:data.c_id}).exec(function(err, docs){
      socket.emit('list community likeusers', {c_id:data.c_id, result:docs});
    });
  });

  socket.on('get community shareusers', function(data){
    SharePost.find({'content_type':1, content_id:data.c_id}).exec(function(err, docs){
      socket.emit('list community shareusers', {c_id:data.c_id, result:docs});
    });
  });

  socket.on('get upcoming likeusers', function(data){
    LikePost.find({'content_type':2, to_uid:data.uid}).exec(function(err, docs){
      socket.emit('list upcoming likeusers', {uid:data.uid, result:docs});
    });
  });

  socket.on('get portfolio likeusers', function(data){
    LikePost.find({'content_type':3, 'content_id':data.p_id, to_uid:data.uid}).exec(function(err, docs){
      socket.emit('list portfolio likeusers', {uid:data.uid, result:docs, p_id:data.p_id});
    });
  });

  socket.on('get upcoming shareusers', function(data){
    SharePost.find({'content_type':2, to_uid:data.uid}).exec(function(err, docs){
      socket.emit('list upcoming shareusers', {uid:data.uid, result:docs});
    });
  });

  socket.on('get portfolio shareusers', function(data){
    SharePost.find({'content_type':3, 'content_id':data.p_id, to_uid:data.uid}).exec(function(err, docs){
      socket.emit('list portfolio shareusers', {uid:data.uid, result:docs, p_id:data.p_id});
    });
  });

  socket.on('unshare community', function(data, callback){
    SharePost.find({'to_uid':data.to_uid, 'user.uid':socket.uid, 'content_type':1}).remove().exec();
    CommunityPost.findById(data.c_id, function(err, doc){
      if (err) console.log(err);

      if (doc.likes > 0){
        doc.shares -= 1;
        doc.save(callback);
      }
    });
  });

  socket.on('share community', function(data, callback){
    var d = new Date();
    
    var newPost = new SharePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:1, content_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        socket.emit('new history', {to_uid:data.to_uid, content_type:1, content_id:data.c_id, action_id:5});
        if (data.to_uid in users){
            users[data.to_uid].emit('new notification', {action_id:5, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
           //users[data.to].emit('new notification', {action_id:1, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        }
      }
    });

    CommunityPost.findById(data.c_id, function(err, doc){
      if (err) console.log(err);

      doc.shares += 1;
      doc.save(callback);
    });

    var newNotification = new NotificationPost({action_id:5, to_uid:data.to_uid, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newNotification.save(function(err){
      if (err) {
        console.log(err);
      }
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
  });

  socket.on('like community', function(data, callback){
    var d = new Date();
    
    var newPost = new LikePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:1, content_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
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
      }
    });
  });

  socket.on('like upcoming', function(data, callback){
    var d = new Date();
    
    var newPost = new LikePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:2, content_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
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
      }
    });
  });

  socket.on('unlike upcoming', function(data, callback){
    LikePost.find({'to_uid':data.to_uid, 'user.uid':socket.uid, 'content_type':2}).remove().exec();
  });

  socket.on('unlike portfolio', function(data, callback){
    LikePost.find({'to_uid':data.to_uid, 'user.uid':socket.uid, 'content_type':3, 'content_id':data.c_id}).remove().exec();
  });

  socket.on('like portfolio', function(data, callback){
    var d = new Date();
    
    var newPost = new LikePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:3, content_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
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

  socket.on('unshare upcoming', function(data, callback){
    SharePost.find({'to_uid':data.to_uid, 'user.uid':socket.uid, 'content_type':2}).remove().exec();
  });

  socket.on('unshare portfolio', function(data, callback){
    SharePost.find({'to_uid':data.to_uid, 'user.uid':socket.uid, 'content_type':3, 'content_id':data.c_id}).remove().exec();
  });

  socket.on('share post', function(data, callback){
    var d = new Date();
    
    var newPost = new SharePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:1, content_id:data.c_id});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
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
      }
    });

    CommunityPost.findById(data.c_id, function(err, post){
      if (err) {
        console.log(err);
      } else{
        post.shares += 1;
        post.save();

        var newPost = new CommunityPost({content:post.content, user:{uid:post.user.uid, first_name:post.user.first_name, last_name:post.user.last_name}, tag:post.tag, skillls:post.skillls, sharedBy:socket.uid, content_id:data.c_id});
        newPost.save(function(error, newpost){
          if (error) {
            console.log(error);
          }
        });
      }
    });
  });

  socket.on('share upcoming', function(data, callback){
    var d = new Date();
    
    var newPost = new SharePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:2, content_id:data.c_id});
    newPost.save();

    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        socket.emit('new history', {to_uid:data.to_uid, content_type:2, content_id:data.c_id, action_id:5});
        if (data.to_uid in users){
            users[data.to_uid].emit('new notification', {action_id:5, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
           //users[data.to].emit('new notification', {action_id:1, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        }
      }
    });

    db.serialize(function() {
      //db.each("SELECT user_id, title, image, describe FROM week1_showcase WHERE user_id=? AND number=?", (data.to_uid, data.c_id), function(err, row){
      db.each("SELECT a.first_name, a.last_name, s.title, s.image, s.describe FROM week1_upcomingwork s, auth_user a WHERE s.user_id='"+data.to_uid+"' AND s.user_id=a.id GROUP BY s.user_id", function(err, row){
        if (err) console.log("error", err);
        if(row){
          newPost = new CommunityPost({ upcoming:{image:row.image, title:row.title, description:row.describe}, sharedBy:socket.uid, user:{uid:data.to_uid, first_name:row.first_name, last_name:row.last_name} });
          newPost.save(function(err, post){
            if (err) console.log(err);

            CommunityMember.findOne({uid:socket.uid}).exec(function(err, result){
              if(result){
                var friends = result.friends;

                for (var i = 0; i < friends.length; i++){
                  if (friends[i] in users){
                    users[friends[i]].emit('new share', { type: 'upcoming', content :{community_id:post.id, image:row.image, title:row.title, description:row.describe}, sharedBy:socket.uid, user:{uid:data.to_uid, first_name:row.first_name, last_name:row.last_name} });
                    socket.emit('new share', { type: 'upcoming', content :{community_id:post.id, image:row.image, title:row.title, description:row.describe}, sharedBy:socket.uid, user:{uid:data.to_uid, first_name:row.first_name, last_name:row.last_name} });
                  }
                }
              }
            });
          });
        }
      });
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
    //var newPost = new SharePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:3, content_id:data.c_id});

    var newPost = new SharePost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, content_type:3, content_id:data.c_id});
    newPost.save();

    db.serialize(function() {
      //db.each("SELECT user_id, title, image, describe FROM week1_showcase WHERE user_id=? AND number=?", (data.to_uid, data.c_id), function(err, row){
      db.each("SELECT a.first_name, a.last_name, s.title, s.image, s.describe FROM week1_showcase s, auth_user a WHERE s.user_id='"+data.to_uid+"' AND s.number='"+data.content_id+"' AND s.user_id=a.id GROUP BY s.user_id", function(err, row){
        if (err) console.log("error", err);
        if(row){
          newPost = new CommunityPost({ portfolio:{image:row.image, title:row.title, description:row.describe}, sharedBy:socket.uid, user:{uid:data.to_uid, first_name:row.first_name, last_name:row.last_name} });
          newPost.save(function(err, post){
            if (err) console.log(err);

            CommunityMember.findOne({uid:socket.uid}).exec(function(err, result){
              if(result){
                var friends = result.friends;

                for (var i = 0; i < friends.length; i++){
                  if (friends[i] in users){
                    users[friends[i]].emit('new share', { type: 'portfolio', content: {community_id:post.id, image:row.image, title:row.title, description:row.describe}, sharedBy:socket.uid, user:{uid:data.to_uid, first_name:row.first_name, last_name:row.last_name} });
                    socket.emit('new share', { type: 'portfolio', content: {community_id:post.id, image:row.image, title:row.title, description:row.describe}, sharedBy:socket.uid, user:{uid:data.to_uid, first_name:row.first_name, last_name:row.last_name} });
                  }
                }
              }
            });
          });
        }
      });
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
    var newComment = new CommentPost({content:data.msg, to_uid:data.to, from_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

    newComment.save(function(err){
      if (err) {
        console.log(err);
      } else{
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
        if (data.to in users){
           users[data.to].emit('new notification', {action_id:1, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        } else {
        }
      }
    });
  });

  socket.on('delete community comment', function(data){

    CommunityPost.findById(data.c_id, function(err, post){
      if (err) {
        console.log(err);
      } else{
        post.replys.splice(data.r_id, 1);
        post.save(function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  });

  socket.on('update postComment', function(data){
    CommunityPost.findById(data.c_id, function(err, doc){
      if (err) console.log(err);

      comment = doc.replys[data.r_id];
      comment.content = data.msg;
      doc.replys[data.r_id] = comment;
      doc.save();
    });
  });

  socket.on('delete community post', function(c_id){
    CommunityPost.find({'_id':c_id}).remove().exec();
    CommunityPost.find({'content_id':c_id}).remove().exec();
    SharePost.find({'content_id':c_id}).remove().exec();
    LikePost.find({'content_id':c_id}).remove().exec();
  });

  socket.on('delete upcoming comment', function(c_id){
    UpcomingPost.find({'_id':c_id}).remove().exec();
  });

  socket.on('update upcomingComment', function(data){
    UpcomingPost.findById(data.c_id, function(err, doc){
      if (err) console.log(err);

      doc.content = data.msg;
      doc.save();
    });
  });

  socket.on('update portfolioComment', function(data){
    PortfolioPost.findById(data.c_id, function(err, doc){
      if (err) console.log(err);

      doc.content = data.msg;
      doc.save();
    });
  });

  socket.on('delete portfolio comment', function(c_id){
    PortfolioPost.find({'_id':c_id}).remove().exec();
  });

  //socket.emit('update postContent', {msg:post_val, c_id:c_id, uid:{{user.id}} });
  socket.on('update postContent', function(data){
    CommunityPost.findById(data.c_id, function(err, doc){
      if (err) console.log(err);

      doc.content = data.msg;
      doc.save();
    });
  });

  socket.on('upcoming comment', function(data, callback){
    var d = new Date();
    
    var newPost = new UpcomingPost({content:data.msg, to_uid:data.to, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});
    newPost.save(function(err){
      if (err) {
        console.log(err);
      } else{
        if (users[data.to]) {
            users[data.to].emit('new upcoming comment', {msg:data.msg, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        }
       
        if (data.uid) {
            users[data.uid].emit('new upcoming comment on userpage', {msg:data.msg, to:data.to, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname});
        }
      }

    });
  });

  socket.on('portfolio comment', function(data, callback){
    var d = new Date();
    
    var newPost = new PortfolioPost({content:data.msg, to_uid:data.to, p_id:data.p_id, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});
    newPost.save(function(err, post){
      if (err) {
        console.log(err);
      } else{
        /*
        if (users[data.to]) {
            users[data.to].emit('new portfolio comment', {msg:data.msg, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname, p_id:data.p_id});
        }
        */
       
        if (data.uid) {
            users[data.uid].emit('new portfolio comment', {msg:data.msg, to:data.to, from_uid:socket.uid, from_firstname:socket.firstname, from_lastname:socket.lastname, p_id:data.p_id});
        }
      }

    });
  });

  socket.on('add community members', function(data){

    var uid1, uid2, action_user;
    if (data.sid < data.rid){
      uid1 = data.sid;
      uid2 = data.rid; 
      action_user = 1;
    }else{
      uid2 = data.sid;
      uid1 = data.rid; 
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
              socket.emit('new history', {to_uid:data.to_uid, content_type:1, action_id:8});
              if (data.to_uid in users){
                  users[data.to_uid].emit('new notification', {action_id:8, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
              }
            }
          }); 
        }else{
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
          }
         }
      }
    });
  });

  socket.on('search query', function(query){

    //db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!=? AND week1_profile.user_id=auth_user.id AND (week1_profile.skill1=? OR week1_profile.skill2=? OR week1_profile.skill3=? OR week1_profile.skill4=? OR week1_profile.skill5=? OR week1_profile.skill6=? OR week1_profile.skill7=? OR week1_profile.skill8=? OR week1_profile.skill9=? OR week1_profile.skill10=?) GROUP BY week1_profile.user_id", [socket.uid, query, query, query, query, query, query, query, query, query, query], function(err, rows){
    db.all("SELECT week1_user.uid as user_id, week1_user.first_name, week1_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, week1_user WHERE week1_profile.user_id!=? AND week1_profile.user_id=week1_user.id AND (week1_profile.profession1=? OR week1_profile.profession2=? OR week1_profile.profession3=? OR week1_profile.profession4=? OR week1_profile.profession5=?) GROUP BY week1_profile.user_id", [socket.uid, query, query, query, query, query], function(err, rows){
      socket.emit('get search result by profession', rows);
    });

    db.all("SELECT week1_user.uid as user_id, week1_user.first_name, week1_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, week1_user WHERE week1_profile.user_id!=? AND week1_profile.user_id=week1_user.id AND (week1_profile.skill1=? OR week1_profile.skill2=? OR week1_profile.skill3=? OR week1_profile.skill4=? OR week1_profile.skill5=? OR week1_profile.skill6=? OR week1_profile.skill7=? OR week1_profile.skill8=? OR week1_profile.skill9=? OR week1_profile.skill10=?) GROUP BY week1_profile.user_id", [socket.uid, query, query, query, query, query, query, query, query, query, query], function(err, rows){
      socket.emit('get search result by skill', rows);
    });

    //db.all("SELECT week1_profile.user_id, auth_user.first_name, auth_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, auth_user WHERE week1_profile.user_id!=? AND week1_profile.user_id=auth_user.id AND (auth_user.first_name=? OR auth_user.last_name=? ) GROUP BY week1_profile.user_id", [socket.uid, query, query], function(err, rows){
    db.all("SELECT week1_user.uid as user_id, week1_user.first_name, week1_user.last_name, week1_profile.photo, week1_profile.profession1, week1_profile.profession2, week1_profile.profession3, week1_profile.describe FROM week1_profile, week1_user WHERE week1_profile.user_id!=? AND week1_profile.user_id=week1_user.id AND (week1_user.first_name=? OR week1_user.last_name=? ) GROUP BY week1_profile.user_id ", [socket.uid, query, query], function(err, rows){
      socket.emit('get search result by user name', rows);
    });

    db.all("SELECT week1_user.uid as user_id, week1_user.first_name, week1_user.last_name, week1_showcase.title, week1_showcase.image, week1_showcase.tag1, week1_showcase.tag2, week1_showcase.tag3, week1_showcase.describe FROM week1_showcase, week1_user WHERE week1_showcase.user_id!=? AND week1_showcase.user_id=auth_user.id AND (week1_showcase.tag1=? OR week1_showcase.tag2=? ) ", [socket.uid, query, query], function(err, rows){
      socket.emit('get search result by portfolio', rows);
    });

    db.all("SELECT week1_user.uid as user_id, week1_user.first_name, week1_user.last_name, week1_upcomingwork.title, week1_upcomingwork.image, week1_upcomingwork.tag1, week1_upcomingwork.tag2, week1_upcomingwork.tag3, week1_upcomingwork.describe FROM week1_upcomingwork, week1_user WHERE week1_upcomingwork.user_id!=? AND week1_upcomingwork.user_id=week1_user.id AND (week1_upcomingwork.tag1=? OR week1_upcomingwork.tag2=? ) ", [socket.uid, query, query], function(err, rows){
      socket.emit('get search result by upcoming', rows);
    });

  });


  socket.on('send message', function(data){

    if(data.to_uid){
      var uid1, uid2, action_user;
      if (data.uid < data.to_uid){
        uid1 = data.uid;
        uid2 = data.to_uid; 
        action_user = 1;
      }else{
        uid2 = data.uid;
        uid1 = data.to_uid; 
        action_user = 2;
      }

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
              socket.join(result._id);
              //socket.emit('new message', {uid:data.uid, content:data.msg});
              io.sockets.in(result._id).emit('new message', {uid:data.uid, to_uid:data.to_uid, content:data.msg, room_id:result._id, image:data.data});
            });

          }else{
            console.log("no message relationship");
            var newMessageRelation = new MessageRelation({uid1:uid1, uid2:uid2, action_user:action_user, status:1, messages:{uid:socket.uid, content:data.msg}});

            newMessageRelation.save(function(error, newdata){

              if (error) {
                console.log(error);
              }else{
                /** emmit new message to data.to_uid message.html **/
                if (users[data.to_uid]){
                  users[data.to_uid].emit('new message', {uid:socket.uid, msg:data.msg, room_id:newdata._id}) 
                }
              }
            });
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
              socket.join(result._id);
              io.sockets.in(result._id).emit('new message', {uid:data.uid, to_uid:data.to_uid, content:data.msg, room_id:result._id, image:data.data});
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
        }else{
          var newMessageRelation = new MessageRelation({uid1:uid1, uid2:uid2, action_user:action_user, status:1 });
          newMessageRelation.save(function(error, newdata){

            if (error) {
              console.log(error);
            }else{
              /** emmit new message to data.to_uid message.html **/
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

          var newMessageRelation = new MessageRelation({uid1:uid1, uid2:uid2, action_user:action_user, status:1, messages:{uid:socket.uid, content:data.msg}});
          newMessageRelation.save(function(error, newdata){

            if (error) {
              console.log(error);
            }else{
              /** emmit new message to data.to_uid message.html **/
              if (users[data.to_uid]){
                users[data.to_uid].emit('send first message', {uid:socket.uid, msg:data.msg, room_id:newdata._id}) 
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
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

