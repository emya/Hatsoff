//var socket = io.connect("{{nodejs_url}}");
//var socket = io.connect('http://localhost:8889');
var socket = io.connect('http://ec2-54-191-73-239.us-west-2.compute.amazonaws.com:8889');
var startTime;

setInterval(function() {
  startTime = Date.now();
  socket.emit('ping');
}, 2000);

socket.on('pong', function() {
  latency = Date.now() - startTime;
  //console.log(latency);
});

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var cmembers = localStorage.getItem("num-cmembers");
if (cmembers == null){
	socket.emit('get community members number');
}else{
	//document.getElementById('num-cmembers').innerHTML = cmembers;
}

socket.on('community members number', function(len){
    //document.getElementById('num-cmembers').innerHTML = len;
    localStorage.setItem("num-cmembers", len); 
    var cmembers = localStorage.getItem("num-cmembers");
    console.log(cmembers);
});

// Set suggested projects
sprojects = document.getElementById('suggested_posts');

if (sprojects){
    var str = sprojects.innerHTML.trim();
    if ( str.length == 0 ) {
        socket.emit('get suggested posts');
    }
}

socket.on('three community posts need you', function(docs){
    for(var i=0; i < docs.length; i++){
        var c_id = docs[i]._id;
        var tag = docs[i].tag;
        var uid = docs[i].user.uid;
        var post_link = "{% url 'week1:community_post'%}?c_id="+c_id+"&tag="+tag+"&u="+uid;
        var suggested_post = createSuggestedPost(post_link, docs[i].content)
        $('#suggested_projects').append($(suggested_post));
    }
});

function createSuggestedPost(link, content){
  var suggested_post = `
                        <a style="display:block" href="${link}">
                            <div class="projectProgressEntity clearfix">
                                <p class="big pull-left">
                                    ${content}
                                </p>
                            </div>
                        </a>
                          `;
  return suggested_post;
}

function createSuggestedProject(){
  var suggested_project = `
                            <h4>Sculpture project</h4>
                            <div class="progress-outer progress-striped-outer">
                                <div class="progPercentageNumb"></div>
                                <div class="progress progress-striped">
                                    <div class="progress-bar progress-bar-custom" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" >
                                        <span class="sr-only">25</span>
                                    </div>
                                </div>
                            </div> 
                          `;
}

socket.on('new community member', function(){
	var members = localStorage.getItem("num-cmembers");
    var cmembers = 0
	if (members != null){
		cmembers = parseInt(members);
	}
	document.getElementById('num-cmembers').innerHTML = cmembers+1;
});

function logoutFunction() {
    console.log("logout");
    localStorage.removeItem("num-cmembers");
}


function sharePortfolioFunction(uid, c_id){
    console.log('share portfolio function');
    socket.emit('share portfolio', {to_uid:uid, uid:socket.uid, content_id:c_id});
}

function shareUpcomingFunction(uid, c_id){
    console.log('share upcoming function');
    socket.emit('share upcoming', {to_uid:uid, uid:socket.uid, content_id:c_id});
}

function shareCommunityFunction(uid, c_id){
    socket.emit('share community', {to_uid:uid, uid:socket.uid, c_id:c_id});
    var count = document.getElementById("share_count_"+c_id).innerHTML;
    var count_shares = parseInt(count)+1; 
    console.log("count_shares is", count_shares);
    document.getElementById("share_count_"+c_id).innerHTML = count_shares;
    document.getElementById("share_icon_"+c_id).className = "faMatchHatbtn fa-sharez active";
    //document.getElementById("share_click_"+c_id).innerHTML = "UnShare";
    document.getElementById("share_click_"+c_id).onclick = function () { unshareCommunityFunction(uid, c_id); return false; };
}

function unshareCommunityFunction(uid, c_id){
    socket.emit('unshare community', {to_uid:uid, uid:socket.uid, c_id:c_id});
    var count = document.getElementById("share_count_"+c_id).innerHTML;
    var count_shares = parseInt(count)-1; 
    document.getElementById("share_count_"+c_id).innerHTML = count_shares;
    document.getElementById("share_icon_"+c_id).className = "faMatchHatbtn fa-sharez inactive";
    //document.getElementById("share_click_"+c_id).innerHTML = "Share";
    document.getElementById("share_click_"+c_id).onclick = function () { shareCommunityFunction(uid, c_id); return false; };
}

function likeCommunityFunction(uid, c_id){
    socket.emit('like community', {to_uid:uid, uid:socket.uid, c_id:c_id});
    var count = document.getElementById("like_count_"+c_id).innerHTML;
    var count_likes = parseInt(count)+1; 
    document.getElementById("like_count_"+c_id).innerHTML = count_likes;
    document.getElementById("like_icon_"+c_id).className = "faMatchHatbtn fa-hat active";
    //document.getElementById("like_click_"+c_id).innerHTML = "UnLike";
    document.getElementById("like_click_"+c_id).onclick = function () { unlikeCommunityFunction(uid, c_id); return false; };
    return false;
}

function unlikeCommunityFunction(uid, c_id){
    socket.emit('unlike community', {to_uid:uid, uid:socket.uid, c_id:c_id});
    var count = document.getElementById("like_count_"+c_id).innerHTML;
    var count_likes = parseInt(count)-1; 
    document.getElementById("like_count_"+c_id).innerHTML = count_likes;
    document.getElementById("like_icon_"+c_id).className = "faMatchHatbtn fa-hat inactive";
    //document.getElementById("like_icon_"+c_id).innerHTML = "Like";
    document.getElementById("like_click_"+c_id).onclick = function () { likeCommunityFunction(uid, c_id); return false; }; 
    return false;
}

function hatsoffCommunityFunction(uid, c_id){
    socket.emit('give hatsoff', {to_uid:uid, uid:socket.uid, content_type:1, content_id:c_id});
    document.getElementById("hatsoff_icon_"+c_id).className = "faMatchHatbtn fa-hat active";
    //document.getElementById("hatsoff_click_"+c_id).innerHTML = "UnHatsoff";
    document.getElementById("hatsoff_click_"+c_id).onclick = function () { unhatsoffCommunityFunction(uid, c_id); return false; }; 
}

function unhatsoffCommunityFunction(uid, c_id){
    socket.emit('give unhatsoff', {to_uid:uid, uid:socket.uid, content_type:1, content_id:c_id});
    document.getElementById("hatsoff_icon_"+c_id).className = "faMatchHatbtn fa-hat inactive";
    //document.getElementById("hatsoff_click_"+c_id).innerHTML = "Hatsoff";
    document.getElementById("hatsoff_click_"+c_id).onclick = function () { hatsoffCommunityFunction(uid, c_id); return false; };
}

/*
function change(){
    var elem = document.getElementById("myButton1");
    if (elem.value=="Close Curtain") elem.value = "Open Curtain";
    else elem.value = "Close Curtain";
}
*/

// Status
// 0: new request
// 1: accept request
function addCommunityFunction(uid, status = 0){
    console.log("add community");
    socket.emit('give follow', {to_uid:uid, uid:socket.uid});

    var elem = document.getElementsByClassName('follow_status_'+uid);

    for(var i = 0; i < elem.length; i++){
      if (status == 0) {
        elem[i].innerHTML = 'Request Sent';
      }else{
        elem[i].innerHTML = 'Community Member';
      }
    }
    //$('.follow_status_'+uid).append($('<div class="following"><span>Request Sent &nbsp<span></div>'));

    var addstatus = document.getElementById('add-request');
    if (status == 0){
      addstatus.innerHTML = 'Request Sent';   
    }else{
      addstatus.innerHTML = 'Community Member';   
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
    clname = 'pf_portfolio_'+c_id;
    eid = 'portfolioComment_'+uid+'_'+r_id;
    socket.emit('delete portfolio comment', c_id);
  } else if ( type == 1 ) {
    clname = 'pf_upcoming_'+r_id;
    eid = 'upcomingComment_'+uid;
    console.log("deletePFComment ", c_id);
    socket.emit('delete upcoming comment', c_id);
  }
  document.getElementById(eid).getElementsByClassName(clname)[0].innerHTML = '';
}

function editPFComment(type, c_id){
  var modalid = (type == 0) ? 'editModal_pf_pf_'+c_id : 'editModal_pf_up_'+c_id;
  console.log("modalid:", modalid);
  var modal = document.getElementById(modalid);  
  modal.style.display = "block";
}

function closePFEdit(id){
  console.log("close like list");
  var span = document.getElementById('editClose_'+id);
  var modal = document.getElementById('editModal_'+id);  
  modal.style.display = "none";
}

function submitcommentPFEdit(c_id, p_id, type){
  var pid, post_val;
  console.log(c_id, p_id, type);

  if ( type == 0 ){
    pid =  '#post_text_pf_pf_'+c_id;
    post_val = $(pid).val();
    if (post_val.length != 0){
      socket.emit('update portfolioComment', {msg:post_val, c_id:c_id });
      document.getElementById("media-content_pf_pf_"+c_id).innerHTML = post_val;
      closePFEdit('pf_pf_'+c_id);
    }
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

function getPFLikeusers(uid, type, p_id){
  console.log("get pf likeusers");
  if (type == 0){
    socket.emit('get portfolio likeusers', {uid:uid, p_id:p_id});
  }else if(type == 1){
    socket.emit('get upcoming likeusers', {uid:uid});
  }
}

function getPFShareusers(uid, type, p_id){
  console.log("get pf share users");
  if (type == 0){
    socket.emit('get portfolio shareusers', {uid:uid, p_id:p_id});
  }else if(type == 1){
    socket.emit('get upcoming shareusers', {uid:uid});
  }
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