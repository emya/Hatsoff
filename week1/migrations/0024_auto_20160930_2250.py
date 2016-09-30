# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0023_auto_20160930_1958'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='birthyear',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='birthdate',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
