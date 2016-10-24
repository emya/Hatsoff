# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0030_auto_20161024_2047'),
    ]

    operations = [
        migrations.AddField(
            model_name='upcomingwork',
            name='give_back',
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='preferred_city',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='time_commitment',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
