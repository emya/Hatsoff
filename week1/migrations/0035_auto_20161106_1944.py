# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0034_auto_20161028_2151'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='describe',
            field=models.CharField(default=b'', max_length=80, blank=True),
        ),
    ]
