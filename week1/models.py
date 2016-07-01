from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
    user = models.ForeignKey(User)
    profilepicture = models.CharField(max_length=200, default='', blank=True)
    fullname = models.CharField(max_length=100, default='', blank=True)
    profile = models.CharField(max_length=200, default='', blank=True)
    worksAt = models.CharField(max_length=100, default='', blank=True)
    city = models.CharField(max_length=100, default='', blank=True)
    education = models.CharField(max_length=200, default='', blank=True)
    skills = models.CharField(max_length=200, default='', blank=True)
    fQuote = models.CharField(max_length=200, default='', blank=True)
    fFilmmaker = models.CharField(max_length=100, default='', blank=True)
    fTvandYoutube = models.CharField(max_length=100, default='', blank=True)
    fMillennial = models.CharField(max_length=100, default='', blank=True)
    fBook = models.CharField(max_length=100, default='', blank=True)
    showcase = models.CharField(max_length=200, default='', blank=True)
