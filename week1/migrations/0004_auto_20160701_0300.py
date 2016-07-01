# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0003_profile'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='city',
            field=models.CharField(default=b'', max_length=100, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='education',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='fBook',
            field=models.CharField(default=b'', max_length=100, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='fFilmmaker',
            field=models.CharField(default=b'', max_length=100, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='fMillennial',
            field=models.CharField(default=b'', max_length=100, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='fQuote',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='fTvandYoutube',
            field=models.CharField(default=b'', max_length=100, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='fullname',
            field=models.CharField(default=b'', max_length=100, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='profile',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='profilepicture',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='showcase',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='skills',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='worksAt',
            field=models.CharField(default=b'', max_length=100, blank=True),
        ),
    ]
