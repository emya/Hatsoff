from django.shortcuts import render, get_object_or_404 

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout, login, authenticate

from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader, RequestContext
from django.shortcuts import render_to_response

from django.views.decorators.csrf import csrf_protect
from django.core.mail import EmailMessage 

from django.core.urlresolvers import reverse
from django.contrib.auth.views import password_reset, password_reset_confirm

from django.contrib.auth.forms import SetPasswordForm
from .models import Profile
from .forms import RegistrationForm, ProfileForm, ForgotPasswordForm

# Create your views here.
@csrf_protect
def index(request):
    if request.method == 'POST':
        if 'login' in request.POST:
            form = RegistrationForm()
            username = request.POST["username"]
            password = request.POST["password"]

            user = authenticate(username=username, password=password)
            print "user", user
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return HttpResponseRedirect('/week1/home/')
            # When user is None
            else:
                print "Else None"
                message = []
                message.append("The username or password is incorrect.")
                print "message", message
                variables = RequestContext(request, {'message':message, 'form':form})

                #template = loader.get_template('week1/discover.html')
                return render_to_response('week1/index.html', variables, )
        

        elif 'signup' in request.POST:
            form = RegistrationForm(request.POST)
            if form.is_valid():
                user = User.objects.create_user(
                     username = form.cleaned_data['username'],
                     password = form.cleaned_data['password1'],
                     email = form.cleaned_data['email'],
                )

                name = request.POST.get('username')
                email = request.POST.get('email')
                passwd = request.POST.get('password1')

                #tomail = EmailMessage('Dear '+name, "Thank you for registering!", to=[email], fail_silently=False)
                tomail = EmailMessage('Dear '+name, "Thank you for registering!", to=[email])
                tomail.send()

                newuser = authenticate(username=name, password=passwd)
                if newuser is not None:
                    if newuser.is_active:
                        login(request, newuser)
                #return HttpResponseRedirect('/week1/home/')
                        return render(request, 'week1/index.html')
            else:
                messages = []
                messages.append(form.errors)
                variables = RequestContext(request, {'messages':messages, 'form':form})

                return render_to_response('week1/index.html', variables, )
    else:
        form = RegistrationForm()

    variables = RequestContext(request, {'form':form})

    #template = loader.get_template('week1/discover.html')
    return render_to_response('week1/index.html', variables, )

@csrf_protect
def about(request):
    if request.method == 'POST':
        if 'login' in request.POST:
            form = RegistrationForm()
            username = request.POST["username"]
            password = request.POST["password"]

            user = authenticate(username=username, password=password)
            print "user", user
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return HttpResponseRedirect('/week1/home/')
            # When user is None
            else:
                print "Else None"
                message = []
                message.append("The username or password is incorrect.")
                print "message", message
                variables = RequestContext(request, {'message':message, 'form':form})

                #template = loader.get_template('week1/discover.html')
                return render_to_response('week1/index.html', variables, )
        

        elif 'signup' in request.POST:
            form = RegistrationForm(request.POST)
            if form.is_valid():
                user = User.objects.create_user(
                     username = form.cleaned_data['username'],
                     password = form.cleaned_data['password1'],
                     email = form.cleaned_data['email'],
                )

                name = request.POST.get('username')
                email = request.POST.get('email')
                passwd = request.POST.get('password1')

                #tomail = EmailMessage('Dear '+name, "Thank you for registering!", to=[email], fail_silently=False)
                tomail = EmailMessage('Dear '+name, "Thank you for registering!", to=[email])
                tomail.send()

                newuser = authenticate(username=name, password=passwd)
                if newuser is not None:
                    if newuser.is_active:
                        login(request, newuser)
                #return HttpResponseRedirect('/week1/home/')
                        return render(request, 'week1/index.html')
            else:
                messages = []
                messages.append(form.errors)
                variables = RequestContext(request, {'messages':messages, 'form':form})

                return render_to_response('week1/index.html', variables, )
    else:
        form = RegistrationForm()

    variables = RequestContext(request, {'form':form})

    #template = loader.get_template('week1/discover.html')
    return render_to_response('week1/about.html', variables, )

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

@csrf_protect
@login_required
def home(request):
    print "userid", request.user.id
    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    num_result = Profile.objects.filter(user=currentuser).count()
    if num_result == 0:
        p = Profile.objects.create(user=currentuser)
        p.save()

    profile = Profile.objects.get(user=currentuser)
    return render_to_response('week1/home.html', {'user':currentuser, 'profile': profile})

def signup_success(request):
    return render_to_response('week1/success_signup.html')

@login_required
def home_edit(request):
    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    num_result = Profile.objects.filter(user=currentuser).count()
    if request.method == "POST":
        MyProfile = ProfileForm(request.POST, request.FILES)

        if MyProfile.is_valid():
            photo = MyProfile.cleaned_data["photo"]
            fullname = MyProfile.cleaned_data["fullname"]
            profile = MyProfile.cleaned_data["profile"]
            worksAt = MyProfile.cleaned_data["worksAt"]
            city = MyProfile.cleaned_data["city"]
            education = MyProfile.cleaned_data["education"]
            skills = MyProfile.cleaned_data["skills"]

            if num_result == 0:
                p = Profile.objects.create(user=currentuser, photo=photo, fullname=fullname, profile=profile, worksAt=worksAt, city=city, education=education, skills=skills)
                p.save()
            else:
                Profile.objects.filter(user=currentuser).update(photo=photo, fullname=fullname, profile=profile, worksAt=worksAt, city=city, education=education, skills=skills)

    else:
        if num_result == 0:
            p = Profile.objects.create(user=currentuser)
            p.save()

    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit.html', {'profile':usersprofile})

def reset_confirm(request, uidb64=None, token=None):
    if uidb64 != None and token != None:
        print "uidb", uidb64
        print "token", token
    return password_reset_confirm(request, template_name='week1/password_reset_confirm.html', uidb64=uidb64, token=token, set_password_form=SetPasswordForm, post_reset_redirect='/week1/login/')

@csrf_protect
def reset(request):
    message = []

    if request.method == 'POST':
        form = ForgotPasswordForm(request.POST)
        print "form", form
        print "is valid", form.is_valid()
        print "is bound", form.is_bound
        print "form errors", form.errors
        print "email", request.POST.get("email")
        print "post"
        if form.is_valid():
            validemail = form.cleaned_data["email"]
            num_result = User.objects.filter(email=validemail).count()

            if num_result == 0:
                message.append("The email is not registered.")

            else:
                print "form is valid", validemail
                form.save(from_email='e.ayada810004@gmail.com', email_template_name='week1/password_reset_email.html', request=request)
                return render_to_response('week1/password_reset_email_sent.html')

    else:
        form = ForgotPasswordForm()

    variables = RequestContext(request, {'form':form, 'message':message})

    #template = loader.get_template('week1/discover.html')
    return render_to_response('week1/password_reset.html', variables, )

    """
    return password_reset(request, template_name='week1/password_reset.html',
        email_template_name='week1/password_reset_email.html',
        subject_template_name='week1/reset_subject.txt',
        post_reset_redirect=reverse('week1:login'))
    """


"""
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

"""
