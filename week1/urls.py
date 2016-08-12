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
    url(r'^results/friends/(?P<query>\w+)/$', views.results_friends, name='resultsfriends'),
    url(r'^hatsoff/(?P<user2>\d+)/$', views.hatsoff, name='hatsoff'),
    url(r'^hatsoff/list/$', views.hatsoff_list, name='hatsoff_list'),
    url(r'^messages/$', views.messages, name='messages'),
    url(r'^messages/(?P<uid>\d+)/$', views.private_message, name='private_message'),
    url(r'^profile/(?P<uid>\d+)/$', views.get_profile, name='get_profile'),
    url(r'^community/$', views.community, name='community'),
    url(r'^notification/$', views.notification, name='notification'),
    url(r'^edit/personalinfomation/$', views.home_edit_personalinfo, name='edit_personalinfo'),
    url(r'^edit/funfact/$', views.home_edit_funfact, name='edit_funfact'),
    url(r'^edit/photo/$', views.home_edit_photo, name='edit_photo'),
    url(r'^folder/$', views.folder, name='folder'),
    url(r'^folder/list/(?P<user2>\d+)/$', views.add_folder, name='add_folder'),
]
