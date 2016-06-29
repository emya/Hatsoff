# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('profile', models.CharField(max_length=200)),
                ('worksAt', models.CharField(max_length=100)),
                ('city', models.CharField(max_length=100)),
                ('education', models.CharField(max_length=200)),
                ('skills', models.CharField(max_length=200)),
                ('fQuote', models.CharField(max_length=200)),
                ('fFilmmaker', models.CharField(max_length=100)),
                ('fTvandYoutube', models.CharField(max_length=100)),
                ('fMillennial', models.CharField(max_length=100)),
                ('fBook', models.CharField(max_length=100)),
                ('showcase', models.CharField(max_length=200)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
