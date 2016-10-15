# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0024_auto_20160930_2250'),
    ]

    operations = [
        migrations.AlterField(
            model_name='showcase',
            name='image',
            field=models.FileField(null=True, upload_to=b'showcaseimg/', blank=True),
        ),
        migrations.AlterField(
            model_name='upcomingwork',
            name='image',
            field=models.FileField(null=True, upload_to=b'showcaseimg/', blank=True),
        ),
    ]
