# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0026_auto_20161011_2238'),
    ]

    operations = [
        migrations.AddField(
            model_name='showcase',
            name='youtube',
            field=models.URLField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='weburl',
            field=models.URLField(null=True, blank=True),
        ),
    ]
