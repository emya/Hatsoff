# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0037_auto_20161121_2158'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='photo',
            field=models.ImageField(default=b'photoimg/profileimage.png', upload_to=b'photoimg/', blank=True),
        ),
    ]
