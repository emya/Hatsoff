# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0021_auto_20160919_2257'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='weburl',
            field=models.URLField(default=b'', blank=True),
        ),
        migrations.AlterField(
            model_name='showcase',
            name='number',
            field=models.IntegerField(null=True),
        ),
    ]
