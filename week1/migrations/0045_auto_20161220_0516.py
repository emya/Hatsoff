# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0044_auto_20161220_0441'),
    ]

    operations = [
        migrations.RenameField(
            model_name='upcomingwork',
            old_name='collaborators',
            new_name='collaborator1',
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator2',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator3',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator4',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator5',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
    ]
