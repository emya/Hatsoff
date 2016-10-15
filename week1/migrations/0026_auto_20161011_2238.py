# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0025_auto_20161011_2144'),
    ]

    operations = [
        migrations.AddField(
            model_name='showcase',
            name='video',
            field=models.FileField(null=True, upload_to=b'showcaseimg/', blank=True),
        ),
        migrations.AlterField(
            model_name='showcase',
            name='image',
            field=models.ImageField(null=True, upload_to=b'showcaseimg/', blank=True),
        ),
    ]
