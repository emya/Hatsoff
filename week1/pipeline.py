from .models import Profile

def get_profile_picture(
    strategy,
    user,
    response,
    details,
    is_new=False,
    *args,
    **kwargs
    ):
    img_url = None
    #if strategy.backend.name == 'facebook':
    if "facebook" in kwargs['backend'].redirect_uri:
        img_url = 'http://graph.facebook.com/%s/picture?type=large' % response['id']
                                        
    profile = Profile.objects.get_or_create(user = user)[0]
    profile.photo = img_url
    profile.save()
