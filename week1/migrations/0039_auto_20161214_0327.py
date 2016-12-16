# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0038_auto_20161129_0220'),
    ]

    operations = [
        migrations.AlterField(
            model_name='showcase',
            name='image',
            field=models.FileField(null=True, upload_to=b'showcaseimg/', blank=True),
        ),
    ]
