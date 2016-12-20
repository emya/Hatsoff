# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0040_auto_20161219_2213'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='profession',
        ),
        migrations.AlterField(
            model_name='profile',
            name='profession2',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='profession3',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='profession4',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='profession5',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
    ]
