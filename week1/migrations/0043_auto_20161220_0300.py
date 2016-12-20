# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0042_auto_20161220_0136'),
    ]

    operations = [
        migrations.RenameField(
            model_name='showcase',
            old_name='role',
            new_name='role1',
        ),
        migrations.AddField(
            model_name='showcase',
            name='role2',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='showcase',
            name='role3',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='showcase',
            name='role4',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='showcase',
            name='role5',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
    ]
