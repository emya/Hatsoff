# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0008_auto_20160718_2248'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='showcase',
        ),
    ]
