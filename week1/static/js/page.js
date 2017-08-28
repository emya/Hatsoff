function iconToggle(event)
{
    if(event.target.classList.contains('inactive-icon'))
    {
        event.target.classList.remove('inactive-icon');
        event.target.classList.add('active-icon');
    }
    else
    {
        event.target.classList.remove('active-icon');
        event.target.classList.add('inactive-icon');        
    }

}
function likeClicked(event,postid){
    iconToggle(event)
}
    
function shareClicked(event,postid){
    iconToggle(event)
}
function hatClicked(event,postid){
    iconToggle(event)
}