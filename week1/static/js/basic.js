//var socket = io.connect("{{nodejs_url}}");
var socket = io.connect('http://localhost:8889');
//var socket = io.connect('http://ec2-35-164-130-35.us-west-2.compute.amazonaws.com:8889');
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

socket.on('new community member', function(){
	var cmembers = localStorage.getItem("num-cmembers");
	if (cmembers == null){
		cmembers = 0;
	}
	document.getElementById('num-cmembers').innerHTML = cmembers+1;
});

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function sharePortfolioFunction(uid, c_id){
    console.log('share portfolio function');
    socket.emit('share portfolio', {to_uid:uid, uid:socket.uid, content_id:c_id});
}

function shareUpcomingFunction(uid, c_id){
    console.log('share upcoming function');
    socket.emit('share upcoming', {to_uid:uid, uid:socket.uid, content_id:c_id});
}

function likeCommunityFunction(uid, c_id){
    console.log('uid on like:'+uid+':'+c_id);
	socket.emit('like community', {to_uid:uid, uid:socket.uid, c_id:c_id});
    var count = document.getElementById("like_count_"+c_id).innerHTML;
    var count_likes = parseInt(count)+1; 
    console.log("count_likes is", count_likes);
    var like = document.getElementById("like_"+c_id);
    like.innerHTML = '<img src="/static/images/thumbsUp-01.png" class="icons-img" onclick="unlikeCommunityFunction(\''+uid+'\',\''+c_id+'\')"><div class="popupCount" id="like_count_'+c_id+'">'+count_likes+'</div>';
}

function unlikeCommunityFunction(uid, c_id){
    console.log('uid on like:'+uid+':'+c_id);
    socket.emit('unlike community', {to_uid:uid, uid:socket.uid, c_id:c_id});
    var count = document.getElementById("like_count_"+c_id).innerHTML;
    var count_likes = parseInt(count)-1; 
    var like = document.getElementById("like_"+c_id);
    like.innerHTML = '<img src="/static/images/thumbsUp-02.png" class="icons-img" onclick="likeCommunityFunction(\''+uid+'\',\''+c_id+'\')"><div class="popupCount" id="like_count_'+c_id+'">'+count_likes+'</div>';
}

function hatsoffCommunityFunction(uid, c_id){
    console.log('uid on hatsoff:'+uid);
    //popHatsoff();
    socket.emit('give hatsoff', {to_uid:uid, uid:socket.uid, content_type:1, content_id:c_id});
    var hatsoff = document.getElementById("hatsoff_"+c_id);
    hatsoff.innerHTML = '<img src="/static/images/2hats-02.png" class="icons-img" onclick="unhatsoffCommunityFunction(\''+uid+'\',\''+c_id+'\')">';
}

function unhatsoffCommunityFunction(uid, c_id){
    console.log('uid on unhatsoff:'+uid);
    //popHatsoff();
    socket.emit('give unhatsoff', {to_uid:uid, uid:socket.uid, content_type:1, content_id:c_id});
    var hatsoff = document.getElementById("hatsoff_"+c_id);
    hatsoff.innerHTML = '<img src="/static/images/2hats-01.png" class="icons-img" onclick="hatsoffCommunityFunction(\''+uid+'\',\''+c_id+'\')">';
}

function addCommunityFunction(uid){
    console.log('follow!');
    socket.emit('give follow', {to_uid:uid, uid:socket.uid});

    var elem = document.getElementsByClassName('follow_status_'+uid);

    for(var i = 0; i < elem.length; i++){
        elem[i].innerHTML = '';
    }
    $('.follow_status_'+uid).append($('<div class="following"><span>Request Sent &nbsp<span></div>'));

    var addstatus = document.getElementById('add-request');
    if (addstatus){
        if (addstatus.innerHTML == 'Confirm request'){
            addstatus.innerHTML = 'Community member';   
        }else{
            addstatus.innerHTML = 'Request Sent';   
        }
    }
}

function encode (input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
           enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
           enc4 = 64;
        }
        output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
           keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
}