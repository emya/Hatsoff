# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('week1', '0007_remove_profile_profilepicture'),
    ]

    operations = [
        migrations.RenameField(
            model_name='profile',
            old_name='profile',
            new_name='TVNow',
        ),
        migrations.RenameField(
            model_name='profile',
            old_name='skills',
            new_name='bookNow',
        ),
        migrations.RenameField(
            model_name='profile',
            old_name='fFilmmaker',
            new_name='displayname',
        ),
        migrations.RenameField(
            model_name='profile',
            old_name='fMillennial',
            new_name='language',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='fTvandYoutube',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='fullname',
        ),
        migrations.AddField(
            model_name='profile',
            name='birthdate',
            field=models.DateTimeField(max_length=100, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='cities',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='describe',
            field=models.CharField(default=b'', max_length=500, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='describe1',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='fFilm',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='fTV',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='fYoutube',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='filmNow',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='funaboutyou',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='hobby',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='profession',
            field=models.CharField(default=b'', max_length=200),
        ),
        migrations.AddField(
            model_name='profile',
            name='showcase1',
            field=models.ImageField(null=True, upload_to=b'photoimg/', blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='skill1',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='skill10',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='skill2',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='skill3',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='skill4',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='skill5',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='skill6',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='skill7',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='skill8',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='skill9',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='fBook',
            field=models.CharField(default=b'', max_length=200, blank=True),
        ),
    ]
