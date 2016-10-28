# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0032_merge'),
    ]

    operations = [
        migrations.CreateModel(
            name='Profession',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('skill', models.CharField(unique=True, max_length=30)),
                ('count', models.IntegerField(default=0, null=True)),
            ],
        ),
    ]
