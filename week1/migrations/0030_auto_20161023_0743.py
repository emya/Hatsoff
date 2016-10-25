# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0029_auto_20161022_2306'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='availableHours',
            field=models.IntegerField(null=True, blank=True),
        ),
    ]
