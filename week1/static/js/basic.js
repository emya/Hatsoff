//var socket = io.connect("{{nodejs_url}}");
var socket = io.connect("http://localhost:8889");
console.log("socket :", socket);

var cmembers = localStorage.getItem("num-cmembers");
if (cmembers == null){
	socket.emit('get community members number');
}else{
	document.getElementById('num-cmembers').innerHTML = cmembers;
}

socket.on('community members number', function(len){
    console.log("length :", len);
    document.getElementById('num-cmembers').innerHTML = len;
    localStorage.setItem("num-cmembers", len); 
    var cmembers = localStorage.getItem("num-cmembers");
    console.log(cmembers);
});

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function addCommunityFunction(send_uid, recieve_uid){
	console.log("add community");
	socket.emit('add community members', {sid:send_uid, rid:recieve_uid});
}