from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^about/$', views.about, name='about'),
    url(r'^discover/$', views.discover, name='discover'),
    url(r'^discover/success/$', views.signup_success, name='signup_success'),
    url(r'^login/$', views.signin, name='login'),
    url(r'^home/$', views.home, name='home'),
    url(r'^edit/$', views.home_edit, name='homeedit'),
]
