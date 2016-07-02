# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('week1', '0005_auto_20160701_2037'),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('profilepicture', models.CharField(default=b'', max_length=200, blank=True)),
                ('photo', models.ImageField(null=True, upload_to=b'photoimg/', blank=True)),
                ('fullname', models.CharField(default=b'', max_length=100, blank=True)),
                ('profile', models.CharField(default=b'', max_length=200, blank=True)),
                ('worksAt', models.CharField(default=b'', max_length=100, blank=True)),
                ('city', models.CharField(default=b'', max_length=100, blank=True)),
                ('education', models.CharField(default=b'', max_length=200, blank=True)),
                ('skills', models.CharField(default=b'', max_length=200, blank=True)),
                ('fQuote', models.CharField(default=b'', max_length=200, blank=True)),
                ('fFilmmaker', models.CharField(default=b'', max_length=100, blank=True)),
                ('fTvandYoutube', models.CharField(default=b'', max_length=100, blank=True)),
                ('fMillennial', models.CharField(default=b'', max_length=100, blank=True)),
                ('fBook', models.CharField(default=b'', max_length=100, blank=True)),
                ('showcase', models.CharField(default=b'', max_length=200, blank=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
