from django.shortcuts import render, get_object_or_404 

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout, login, authenticate

from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader, RequestContext
from django.shortcuts import render_to_response

from django.views.decorators.csrf import csrf_protect

from .models import Profile
from .forms import RegistrationForm

# Create your views here.
def index(request):
    template = loader.get_template('week1/index.html')
    return HttpResponse(template.render())

def about(request):
    template = loader.get_template('week1/about.html')
    return HttpResponse(template.render())

def signin(request):
    logout(request)
    username = password = ""
    if request.method == 'POST':
        username = request.POST["username"]
        password = request.POST["password"]

        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return HttpResponseRedirect('/week1/home/')
    return render_to_response('week1/login.html', context_instance=RequestContext(request))

@csrf_protect
def discover(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = User.objects.create_user(
                 username = form.cleaned_data['username'],
                 password = form.cleaned_data['password1'],
                 email = form.cleaned_data['email'],
            )

            name = request.POST.get('username')
            email = request.POST.get('email')

            return HttpResponseRedirect('success/')
    else:
        form = RegistrationForm()

    variables = RequestContext(request, {'form':form})
    #template = loader.get_template('week1/discover.html')
    return render_to_response('week1/discover.html', variables, )

@login_required
def home(request):
    print "userid", request.user.id
    profile = Profile.objects.filter(user=request.user)
    return render_to_response('week1/home.html', {'user':request.user, 'profile': profile})

def signup_success(request):
    return render_to_response('week1/success_signup.html')

@login_required
def home_edit(request):
    print "username", request.user.username
    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    num_result = Profile.objects.filter(user=currentuser).count()
    if request.method == 'POST':
        profilepicture = request.POST.get('profilepicture')
        fullname = request.POST.get('fullname')
        profile = request.POST.get('profile')
        worksAt = request.POST.get('worksAt')
        city = request.POST.get('city')
        education = request.POST.get('education')
        skills = request.POST.get('skills')
        if num_result == 0:
            p = Profile.objects.create(user=currentuser, profilepicture=profilepicture, fullname=fullname, profile=profile, worksAt=worksAt, city=city, education=education, skills=skills)
            p.save()
        else:
            Profile.objects.filter(user=currentuser).update(profilepicture=profilepicture, fullname=fullname, profile=profile, worksAt=worksAt, city=city)
    else:
        if num_result == 0:
            p = Profile.objects.create(user=currentuser)


    print "currentuser", currentuser.username
    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit.html', {'profile':usersprofile})

