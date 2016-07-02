# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0006_profile'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='profilepicture',
        ),
    ]
