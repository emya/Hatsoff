# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0022_auto_20160928_2313'),
    ]

    operations = [
        migrations.AlterField(
            model_name='upcomingwork',
            name='get_help',
            field=models.IntegerField(null=True, blank=True),
        ),
    ]
