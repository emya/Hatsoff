# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0039_auto_20161214_0327'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='profession1',
            field=models.CharField(default=b'', max_length=200),
        ),
        migrations.AddField(
            model_name='profile',
            name='profession2',
            field=models.CharField(default=b'', max_length=200),
        ),
        migrations.AddField(
            model_name='profile',
            name='profession3',
            field=models.CharField(default=b'', max_length=200),
        ),
        migrations.AddField(
            model_name='profile',
            name='profession4',
            field=models.CharField(default=b'', max_length=200),
        ),
        migrations.AddField(
            model_name='profile',
            name='profession5',
            field=models.CharField(default=b'', max_length=200),
        ),
    ]
