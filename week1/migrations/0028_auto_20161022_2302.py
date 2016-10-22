# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0027_auto_20161011_2336'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='TVNow',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='bookNow',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='fTV',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='fYoutube',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='funaboutyou',
        ),
        migrations.AddField(
            model_name='profile',
            name='availableHours',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='collaborators',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='explore',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='rate',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
    ]
