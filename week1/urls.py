from django.conf.urls import url
from django.contrib.auth.views import password_reset

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^about/$', views.about, name='about'),
    url(r'^discover/$', views.discover, name='discover'),
    url(r'^discover/success/$', views.signup_success, name='signup_success'),
    url(r'^login/$', views.signin, name='login'),
    url(r'^signup/$', views.signup, name='signup'),
    url(r'^home/$', views.home, name='home'),
    url(r'^edit/$', views.home_edit, name='homeedit'),
    url(r'^reset/$', views.reset, name='reset'),
    url(r'^reset/confirm/(?P<uidb64>[0-9A-Za-z]+)-(?P<token>.+)/$', views.reset_confirm, name='reset_confirm'),
]
