# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0016_hatsoff'),
    ]

    operations = [
        migrations.CreateModel(
            name='FavoriteFolder',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('user_one_id', models.IntegerField()),
                ('user_two_id', models.IntegerField()),
                ('actionuser', models.IntegerField()),
                ('status', models.IntegerField(verbose_name=[0, 1, 2, 3])),
            ],
        ),
    ]
