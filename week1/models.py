from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
    user = models.ForeignKey(User)
    photo = models.ImageField(upload_to='photoimg/', null=True, blank=True)
    displayname = models.CharField(max_length=100, default='', blank=True)
    profession = models.CharField(max_length=200, default='', blank=False)
    worksAt = models.CharField(max_length=100, default='', blank=True)
    city = models.CharField(max_length=100, default='', blank=True)
    education = models.CharField(max_length=200, default='', blank=True)
    birthyear = models.DateTimeField(null=True, blank=True)
    birthdate = models.DateTimeField(null=True, blank=True)
    language = models.CharField(max_length=100, default='', blank=True)
    describe = models.CharField(max_length=500, default='', blank=True)
    skill1 = models.CharField(max_length=200, default='', blank=True)
    skill2 = models.CharField(max_length=200, default='', blank=True)
    skill3 = models.CharField(max_length=200, default='', blank=True)
    skill4 = models.CharField(max_length=200, default='', blank=True)
    skill5 = models.CharField(max_length=200, default='', blank=True)
    skill6 = models.CharField(max_length=200, default='', blank=True)
    skill7 = models.CharField(max_length=200, default='', blank=True)
    skill8 = models.CharField(max_length=200, default='', blank=True)
    skill9 = models.CharField(max_length=200, default='', blank=True)
    skill10 = models.CharField(max_length=200, default='', blank=True)
    weburl = models.URLField(null=True, blank=True)
    collaborators = models.CharField(max_length=300, default='', blank=True)
    explore = models.CharField(max_length=200, default='', blank=True)
    availableHours = models.IntegerField(blank=True)
    rate = models.CharField(max_length=200, default='', blank=True)
    hobby = models.CharField(max_length=200, default='', blank=True)
    fQuote = models.CharField(max_length=200, default='', blank=True)
    fFilm = models.CharField(max_length=200, default='', blank=True)
    fBook = models.CharField(max_length=200, default='', blank=True)
    filmNow = models.CharField(max_length=200, default='', blank=True)
    cities = models.CharField(max_length=200, default='', blank=True)

class Showcase(models.Model):
    user = models.ForeignKey(User)
    title = models.CharField(max_length=200, default='', blank=True)
    number = models.IntegerField(null=True)#1 to 10
    image = models.ImageField(upload_to='showcaseimg/', null=True, blank=True)
    video = models.FileField(upload_to='showcaseimg/', null=True, blank=True)
    youtube = models.URLField(null=True, blank=True)
    describe = models.CharField(max_length=500, default='', blank=True)
    role = models.CharField(max_length=300, default='', blank=True)
    completion = models.IntegerField(null=True, blank=True)#year of completion
    
class UpcomingWork(models.Model):
    user = models.ForeignKey(User)
    title = models.CharField(max_length=200, default='', blank=True)
    number = models.IntegerField()#1 to 10
    image = models.FileField(upload_to='showcaseimg/', null=True, blank=True)
    describe = models.CharField(max_length=500, default='', blank=True)
    role = models.CharField(max_length=300, default='', blank=True)
    status = models.CharField(max_length=300, default='', blank=True)
    targetdate = models.DateTimeField(max_length=300, null=True, blank=True)#year of completion
    comment = models.CharField(max_length=300, default='', blank=True)
    get_help = models.IntegerField(null=True, blank=True)#1: yes 2:Open to collaboration 3:no thanks
    collaborators = models.CharField(max_length=300, default='', blank=True)
    fund = models.CharField(max_length=200, default='', blank=True)
    comment_help = models.CharField(max_length=300, default='', blank=True)

class Hatsoff(models.Model):
    user_one_id = models.IntegerField()
    user_two_id = models.IntegerField()
    actionuser = models.IntegerField()#1 or 2
    status = models.IntegerField(range(0, 4))
    #0:follow, 1:follow each other

class FavoriteFolder(models.Model):
    user_one_id = models.IntegerField()
    user_two_id = models.IntegerField()
    actionuser = models.IntegerField()#1 or 2
    status = models.IntegerField(range(0, 4))
    #0:add favorite, 1:add favorite each other
