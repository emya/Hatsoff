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

/*
sprojects = document.getElementById('suggested_project').innerHTML;
if (sprojects && sprojects == ""){
    socket.emit('get suggested projects');
}
*/

socket.on('three community posts need you', function(docs){
    for(var i=0; i < docs.length; i++){
        var c_id = docs[i]._id;
        var tag = docs[i].tag;
        var uid = docs[i].user.uid;
        var post_link = "{% url 'week1:community_post'%}?c_id="+c_id+"&tag="+tag+"&u="+uid;
        $('#suggested_project').append($('<li class="media"><a href="'+post_link+'"><p>'+docs[i].content+'</p></a></li>'));
    }
});

socket.on('new community member', function(){
	var members = localStorage.getItem("num-cmembers");
    var cmembers = 0
	if (members != null){
		cmembers = parseInt(members);
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

function myDropDownPFFunction(id) {
    //myPostDropdown
    document.getElementById(id).classList.toggle("show");
    return false;
}

    
function myDropDownDelEditPFFunction(id) {
    //myDelEditDropdown_
    document.getElementById(id).classList.toggle("show");
    return false;
}

// type: 0 (portfolio), 1 (upcoming)
function deletePFComment(uid, r_id, type, c_id){
  var clname, eid;
  if ( type == 0 ){
    clname = 'pf_portfolio_'+r_id;
    eid = 'pf_portfolio_'+uid;
    socket.emit('delete portfolio comment', {c_id:c_id, r_id:r_id});
  } else if ( type == 1 ) {
    clname = 'pf_upcoming_'+r_id;
    eid = 'upcomingComment_'+uid;
    console.log("deletePFComment ", c_id);
    socket.emit('delete upcoming comment', c_id);
  }
  document.getElementById(eid).getElementsByClassName(clname)[0].innerHTML = '';
}

function editPFComment(type, c_id){
  var modalid = (type == 0) ? 'editModal_pf_portfolio_'+c_id+'_'+r_id : 'editModal_pf_up_'+c_id;
  var modal = document.getElementById(modalid);  
  modal.style.display = "block";
}

function closePFEdit(id){
  console.log("close like list");
  var span = document.getElementById('editClose_'+id);
  var modal = document.getElementById('editModal_'+id);  
  modal.style.display = "none";
}

function submitcommentPFEdit(c_id, r_id, type){
  var pid, post_val;

  if ( type == 0 ){

  } else if ( type == 1 ){
    pid =  '#post_text_pf_up_'+c_id;
    post_val = $(pid).val();
    if (post_val.length != 0){
      socket.emit('update upcomingComment', {msg:post_val, c_id:c_id });
      document.getElementById("media-content_pf_up_"+c_id).innerHTML = post_val;
      closePFEdit('pf_up_'+c_id);
    }
  }

  $('#status_message').val('');
  return false;
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
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