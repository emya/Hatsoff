from django.conf.urls import url
from django.contrib.auth.views import password_reset

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^about/$', views.about, name='about'),
    #url(r'^discover/$', views.discover, name='discover'),
    #url(r'^discover/success/$', views.signup_success, name='signup_success'),
    url(r'^login/$', views.signin, name='login'),
    url(r'^signup/$', views.signup, name='signup'),
    url(r'^home/$', views.home, name='home'),
    url(r'^edit/$', views.home_edit, name='homeedit'),
    url(r'^reset/$', views.reset, name='reset'),
    url(r'^reset/confirm/(?P<uidb64>[0-9A-Za-z]+)-(?P<token>.+)/$', views.reset_confirm, name='reset_confirm'),
    url(r'^welcome/$', views.welcome, name='welcome'),#temporary
    url(r'^step1/$', views.step1, name='step1'),
    url(r'^step2/$', views.step2, name='step2'),
    url(r'^step3/$', views.step3, name='step3'),
    url(r'^step4/$', views.step4, name='step4'),
    url(r'^step5/$', views.step5, name='step5'),
    url(r'^step6/$', views.step6, name='step6'),
    url(r'^step7/$', views.step7, name='step7'),
]
