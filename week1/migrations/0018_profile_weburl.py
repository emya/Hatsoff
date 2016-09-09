# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0017_favoritefolder'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='weburl',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
    ]
