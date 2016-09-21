# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0020_auto_20160909_2310'),
    ]

    operations = [
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborators',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='comment_help',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='fund',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='get_help',
            field=models.IntegerField(null=True),
        ),
    ]
