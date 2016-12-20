# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0043_auto_20161220_0300'),
    ]

    operations = [
        migrations.RenameField(
            model_name='upcomingwork',
            old_name='role',
            new_name='role1',
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='role2',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='role3',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='role4',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='role5',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
    ]
