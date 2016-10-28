# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0033_profession'),
    ]

    operations = [
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator_skill1',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator_skill10',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator_skill2',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator_skill3',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator_skill4',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator_skill5',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator_skill6',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator_skill7',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator_skill8',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='upcomingwork',
            name='collaborator_skill9',
            field=models.CharField(default=b'', max_length=300, blank=True),
        ),
    ]
