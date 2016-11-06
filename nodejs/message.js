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
  replys: [replySchema],
  skillls: [String],
  tag: Number,//1: Yes, -1: No
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

var messageSchema = mongoose.Schema({
  uid: Number,
  content: String,//1: sent request, 2:accepted, 3:blocked
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
     NotificationPost.find({}).remove().exec();
     MessageRelation.find({}).remove().exec();
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
      console.log('join community');
      socket.emit('update community post', docs);
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



  socket.on('at folder', function(data){

    var query = CollaboratePost.find({'to_uid':socket.uid});
      query.sort('-created').limit(30).exec(function(err, collaboratedocs){
           console.log('share skill:'+collaboratedocs);
           var newdocs = [];
           var curIdx = 0;
           var len = collaboratedocs.length;
           async.each(collaboratedocs, function(docs){
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
                     socket.emit('update collaborate', newdocs);
                   }
                 }
              ], function(err, result){
              });
            });
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
      socket.emit('number hatsoff', count);
    }); 

    FollowPost.find({'to_uid':socket.uid}).count(function(err, count){
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

    HatsoffPost.find({'to_uid':data.to_uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number user hatsoff', count);
    }); 

    FollowPost.find({'to_uid':data.to_uid}).count(function(err, count){
      if (err) throw err;
      socket.emit('number user follow', count);
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
    
    var newPost = new CommunityPost({content:data.msg, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}, tag:data.tag, skillls:data.skillls});
    newPost.save(function(err, post){
      if (err) {
        console.log(err);
      } else{
        console.log('saved:'+post);
        io.emit('new community post', {msg:data.msg, uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname, community_id:post.id, tag:data.tag, skillls:data.skillls});
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

    HatsoffPost.findOne({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}}).exec(function(err, result){
      if(err){
        console.log(err);
      }else{
        if (!result){
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

  socket.on('give follow', function(data, callback){
    var d = new Date();
    console.log('give follow'+socket.uid); 
    
    FollowPost.findOne({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}}).exec(function(err, result){
      if(err){
      }else{
        if(!result){
          var newPost = new FollowPost({to_uid:data.to_uid, user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});
          newPost.save(function(err){
            if (err) {
              console.log(err);
            } else{
              console.log('new history');
              socket.emit('new history', {to_uid:data.to_uid, content_type:1, content_id:data.c_id, action_id:8});
              if (data.to_uid in users){
                  users[data.to_uid].emit('new notification', {action_id:8, from_uid:socket.uid, from_first_name:socket.firstname, from_lastname:socket.lastname});
              }
            }
          }); 
        }
      }
    });

    var newNotification = new NotificationPost({action_id:8, to_uid:data.to, action_user:{uid:socket.uid, first_name:socket.firstname, last_name:socket.lastname}});

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
