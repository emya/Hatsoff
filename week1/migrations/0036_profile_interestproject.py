# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0035_auto_20161106_1944'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='interestproject',
            field=models.IntegerField(null=True, blank=True),
        ),
    ]
