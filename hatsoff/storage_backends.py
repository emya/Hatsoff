from storages.backends.s3boto3 import S3Boto3Storage

class MediaStorage(S3Boto3Storage):
    location = 'media'
    file_overwrite = True

"""
class UserphotoStorage(S3Boto3Storage):
    location = settings.AWS_USERPHOTO_MEDIA_LOCATION
    default_acl = 'userphoto'
    file_overwrite = True
    custom_domain = False
"""

