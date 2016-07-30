var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io').listen(app.listen(8889));
var users = {};
/*
app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});
*/

app.get('/', function(req, res){
  /*res.sendFile(__dirname + '../recipe/templates/index.html');*/
  res.sendFile('../week1/templates/week1/private_message.html');
});

io.on('connection', function(socket){
  socket.on('new user', function(data, uid, callback){
     if (uid in users){
         console.log('false');
         callback(false);
     }else{
         callback(true);
         console.log('true');
         socket.uname = data;
         users[socket.uname] = socket;
         updateUnames();
     }
  });
 
  function updateUnames(){
    io.emit('usernames', Object.keys(users));
  }
  
  socket.on('chat message', function(msg, uid, callback){
    if (uid in users){
        users[uid].emit('whisper', {msg:msg, uname:socket.uname});
        console.log('whisper!');
    }else{
        callback('Erorr! Enter valid user');
    }
  });

  socket.on('disconnect', function(){
    if (!socket.uname) return ;
    delete users[socket.uname];
    updateUnames();

    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
