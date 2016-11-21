# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0036_profile_interestproject'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='upcomingwork',
            name='targetdate',
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='often',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='targetfinishdate',
            field=models.DateTimeField(null=True, verbose_name=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='targetstartdate',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
