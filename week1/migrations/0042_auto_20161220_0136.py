# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0041_auto_20161219_2252'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='profession1',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
    ]
