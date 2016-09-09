# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('week1', '0018_profile_weburl'),
    ]

    operations = [
        migrations.CreateModel(
            name='Showcase',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(default=b'', max_length=200, blank=True)),
                ('number', models.IntegerField()),
                ('image', models.FileField(null=True, upload_to=b'showcaseimg/', blank=True)),
                ('describe', models.CharField(default=b'', max_length=500, blank=True)),
                ('role', models.CharField(default=b'', max_length=300, blank=True)),
                ('completion', models.DateTimeField(max_length=300, null=True, blank=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='UpcomingWork',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(default=b'', max_length=200, blank=True)),
                ('number', models.IntegerField()),
                ('image', models.FileField(null=True, upload_to=b'showcaseimg/', blank=True)),
                ('describe', models.CharField(default=b'', max_length=500, blank=True)),
                ('role', models.CharField(default=b'', max_length=300, blank=True)),
                ('status', models.CharField(default=b'', max_length=300, blank=True)),
                ('targetdate', models.DateTimeField(max_length=300, null=True, blank=True)),
                ('comment', models.CharField(default=b'', max_length=300, blank=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.RemoveField(
            model_name='profile',
            name='describe1',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='showcase1',
        ),
    ]
