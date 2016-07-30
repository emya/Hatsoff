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
  res.sendFile('../week1/templates/week1/message.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

io.on('connection', function(socket){
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
 
  function updateNicknames(){
    io.emit('usernames', Object.keys(users));
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
                users[name].emit('whisper', {msg:msg, nick:socket.nickname});
	        console.log('whisper!');
	    }else{
                callback('Erorr! Enter valid user');
	    }
        }else{
            callback('Error! Please enter a meesage for your whisper.');
	}
    }else{
	io.emit('new message', {msg:msg, nick:socket.nickname});
	console.log('message: ' + data);
    }
  });

  socket.on('disconnect', function(){
    if (!socket.nickname) return ;
    delete users[socket.nickname];
    updateNicknames();

    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
