from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
    user = models.ForeignKey(User)
    profile = models.CharField(max_length=200)
    worksAt = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    education = models.CharField(max_length=200)
    skills = models.CharField(max_length=200)
    fQuote = models.CharField(max_length=200)
    fFilmmaker = models.CharField(max_length=100)
    fTvandYoutube = models.CharField(max_length=100)
    fMillennial = models.CharField(max_length=100)
    fBook = models.CharField(max_length=100)
    showcase = models.CharField(max_length=200)
