from django.shortcuts import render, get_object_or_404, redirect

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout, login, authenticate

from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader, RequestContext, Context
from django.shortcuts import render_to_response

from django.views.decorators.csrf import csrf_protect
from django.core.mail import EmailMessage 

from django.core.urlresolvers import reverse
from django.contrib.auth.views import password_reset, password_reset_confirm

from django.core.exceptions import ObjectDoesNotExist

from django.db.models import Q
from itertools import chain

from django.contrib.auth.forms import SetPasswordForm
from .models import Profile, Hatsoff
from .forms import RegistrationForm, ProfileForm, ForgotPasswordForm, Step1, Step2, Step3, Step4, Step5, Step6, Step7

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
    email = password = ""
    if request.method == 'POST':
        username = request.POST["email"]
        password = request.POST["password"]

        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return HttpResponseRedirect('/week1/home/')
    return render_to_response('week1/login.html', context_instance=RequestContext(request))

@csrf_protect
def signup(request):
    messages = []
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = User.objects.create_user(
                 username = form.cleaned_data['username'],
                 first_name = form.cleaned_data['first_name'],
                 last_name = form.cleaned_data['last_name'],
                 password = form.cleaned_data['password1'],
            )

            email = request.POST.get('username')
            firstname = request.POST.get('first_name')
            lastname = request.POST.get('last_name')
            passwd = request.POST.get('password1')

            tomail = EmailMessage('Dear '+firstname, "Thank you for registering!", to=[email])
            tomail.send()

            newuser = authenticate(username=email, password=passwd)
            if newuser is not None:
                if newuser.is_active:
                    login(request, newuser)
            #return HttpResponseRedirect('/week1/home/')
                    return render(request, 'week1/welcome.html')
        else:
            messages.append(form.errors)

    else:
        form = RegistrationForm()

    variables = RequestContext(request, {'messages':messages, 'form':form})
    return render_to_response('week1/signup.html', variables, )

@csrf_protect
@login_required
def home(request):
    print "userid", request.user.id
    query = request.GET.get('search_query', None)
    
    if query != None:
        print "query", query
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

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
def welcome(request):
    return render_to_response('week1/welcome.html')

@csrf_protect
@login_required
def step1(request):
    if request.method == 'POST':
        currentuser = User.objects.get(id=request.user.id, username=request.user.username)
        form = Step1(request.POST)
        if form.is_valid():
            displayname = form.cleaned_data["displayname"]
            profession = form.cleaned_data["profession"]
            city = form.cleaned_data["city"]
            worksAt = form.cleaned_data["worksAt"]
            education = form.cleaned_data["education"]
            birthdate = form.cleaned_data["birthdate"]
            language = form.cleaned_data["language"]

            num_result = Profile.objects.filter(user=currentuser).count()
            if num_result > 0:
                Profile.objects.filter(user=currentuser).delete()
                
            p = Profile.objects.create(user=currentuser, displayname=displayname, profession=profession, city=city, worksAt=worksAt, education=education, birthdate=birthdate, language=language)
            p.save()

            nextform = Step2()
            return HttpResponseRedirect('/week1/step2/', {'form': nextform})
            #return render_to_response('week1/step2.html', {'form':nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step1()

    variables = RequestContext(request, {'form':form})

    return render_to_response('week1/step1.html', variables, )

@csrf_protect
@login_required
def step2(request):
    if request.method == 'POST':
        currentuser = User.objects.get(id=request.user.id, username=request.user.username)
        form = Step2(request.FILES)
        if form.is_valid():
            photo = request.FILES["photo"]
            p = Profile.objects.get(user=currentuser)
            p.photo = photo
            p.save()

            nextform = Step3()
            #return render_to_response('week1/step3.html', {'form':nextform})
            return HttpResponseRedirect('/week1/step3/', {'form': nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step2()

    variables = RequestContext(request, {'form':form})

    return render_to_response('week1/step2.html', variables, )

@csrf_protect
@login_required
def step3(request):
    if request.method == 'POST':
        currentuser = User.objects.get(id=request.user.id, username=request.user.username)
        form = Step3(request.POST)
        if form.is_valid():
            describe = form.cleaned_data["describe"]

            Profile.objects.filter(user=currentuser).update(describe=describe)

            nextform = Step4()
            return HttpResponseRedirect('/week1/step4/', {'form': nextform})
            #return render_to_response('week1/step4.html', {'form':nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step3()

    variables = RequestContext(request, {'form':form})

    return render_to_response('week1/step3.html', variables, )

@csrf_protect
@login_required
def step4(request):
    if request.method == 'POST':
        currentuser = User.objects.get(id=request.user.id, username=request.user.username)
        form = Step4(request.POST)
        if form.is_valid():
            skill1 = form.cleaned_data["skill1"]
            skill2 = form.cleaned_data["skill2"]
            skill3 = form.cleaned_data["skill3"]
            skill4 = form.cleaned_data["skill4"]
            skill5 = form.cleaned_data["skill5"]
            skill6 = form.cleaned_data["skill6"]
            skill7 = form.cleaned_data["skill7"]
            skill8 = form.cleaned_data["skill8"]
            skill9 = form.cleaned_data["skill9"]
            skill10 = form.cleaned_data["skill10"]

            Profile.objects.filter(user=currentuser).update(
                skill1=skill1, 
                skill2=skill2, 
                skill3=skill3, 
                skill4=skill4, 
                skill5=skill5, 
                skill6=skill6, 
                skill7=skill7, 
                skill8=skill8, 
                skill9=skill9, 
                skill10=skill10 
            )

            nextform = Step5()
            return HttpResponseRedirect('/week1/step5/', {'form': nextform})
            #return render_to_response('week1/step5.html', {'form':nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step4()

    variables = RequestContext(request, {'form':form})

    return render_to_response('week1/step4.html', variables, )

@csrf_protect
@login_required
def step5(request):
    if request.method == 'POST':
        currentuser = User.objects.get(id=request.user.id, username=request.user.username)
        form = Step5(request.POST, request.FILES)
        if form.is_valid():
            showcase1 = request.FILES["showcase1"]
            describe1 = form.cleaned_data["describe1"]
            p = Profile.objects.get(user=currentuser)
            p.showcase1 = showcase1
            p.describe1 = describe1
            p.save()

            nextform = Step6()
            return HttpResponseRedirect('/week1/step6/', {'form': nextform})
            #return render_to_response('week1/step6.html', {'form':nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step5()

    variables = RequestContext(request, {'form':form})
    return render_to_response('week1/step5.html', variables, )

@csrf_protect
@login_required
def step6(request):
    if request.method == 'POST':
        currentuser = User.objects.get(id=request.user.id, username=request.user.username)
        form = Step6(request.POST)
        if form.is_valid():
            funaboutyou = form.cleaned_data["funaboutyou"]
            fQuote = form.cleaned_data["fQuote"]
            fFilm = form.cleaned_data["fFilm"]
            fTV = form.cleaned_data["fTV"]
            fYoutube= form.cleaned_data["fYoutube"]
            fBook = form.cleaned_data["fBook"]

            Profile.objects.filter(user=currentuser).update(
                funaboutyou=funaboutyou,
                fQuote = fQuote,
                fFilm = fFilm,
                fTV = fTV,
                fYoutube = fYoutube,
                fBook = fBook
            )

            nextform = Step7()
            return HttpResponseRedirect('/week1/step7/', {'form': nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step6()

    variables = RequestContext(request, {'form':form})
    return render_to_response('week1/step6.html', variables, )

@csrf_protect
@login_required
def step7(request):
    if request.method == 'POST':
        currentuser = User.objects.get(id=request.user.id, username=request.user.username)
        form = Step7(request.POST)
        if form.is_valid():
            print "if"
            bookNow = form.cleaned_data["bookNow"]
            filmNow = form.cleaned_data["filmNow"]
            TVNow = form.cleaned_data["TVNow"]
            hobby= form.cleaned_data["hobby"]
            cities = form.cleaned_data["cities"]

            Profile.objects.filter(user=currentuser).update(
                bookNow=bookNow,
                filmNow=filmNow,
                TVNow = TVNow,
                hobby = hobby,
                cities = cities 
            )

            profile = Profile.objects.get(user=currentuser)
            return HttpResponseRedirect('/week1/home/', {'user': currentuser, 'profile':profile})
            #return render_to_response('week1/home.html', {'user':currentuser, 'profile': profile})

        else:
            print "else"
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step7()

    variables = RequestContext(request, {'form':form})
    return render_to_response('week1/step7.html', variables, )

@csrf_protect
@login_required
def home_edit(request):
    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    num_result = Profile.objects.filter(user=currentuser).count()
    if request.method == "POST":
        form = ProfileForm(request.POST, request.FILES)

        if form.is_valid():
            print "invalid"
            displayname = form.cleaned_data["displayname"]
            #photo = form.cleaned_data["photo"]
            photo = request.FILES["photo"]
            profession = form.cleaned_data["profession"]
            worksAt = form.cleaned_data["worksAt"]
            city = form.cleaned_data["city"]
            education = form.cleaned_data["education"]
            birthdate = form.cleaned_data["birthdate"]

            if num_result == 0:
                p = Profile.objects.create(user=currentuser, photo=photo, displayname=displayname, profession=profession, worksAt=worksAt, city=city, education=education, birthdate=birthdate)
                p.save()

            else:
                print "update"
                p = Profile.objects.get(user=currentuser)
                p.photo = photo
                p.displayname = displayname
                p.profession = profession
                p.worksAt = worksAt
                p.city = city
                p.education = education
                p.birthdate = birthdate
                p.save()

            profile = Profile.objects.get(user=currentuser)
            return HttpResponseRedirect('/week1/home/')
            #return render_to_response('week1/home.html', {'user':currentuser, 'profile': profile})

    else:
        print "form invalid"
        form = ProfileForm()
        if num_result == 0:
            p = Profile.objects.create(user=currentuser)
            p.save()

    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit.html', {'profile':usersprofile, 'user':currentuser, 'form':form})

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
        if form.is_valid():
            validemail = form.cleaned_data["email"]
            num_result = User.objects.filter(email=validemail).count()

            if num_result == 0:
                message.append("The email is not registered.")

            else:
                form.save(from_email='e.ayada810004@gmail.com', email_template_name='week1/password_reset_email.html', request=request)
                return render_to_response('week1/password_reset_email_sent.html')

    else:
        form = ForgotPasswordForm()

    variables = RequestContext(request, {'form':form, 'message':message})

    #template = loader.get_template('week1/discover.html')
    return render_to_response('week1/password_reset.html', variables, )

@login_required
def results_friends(request, query):
    t = loader.get_template('week1/results_friends.html')
    #temporary results
    try:
        foundusers = User.objects.filter(first_name=query).exclude(id=request.user.id)
    except ObjectDoesNotExist:
        foundusers = None
    c = Context({'query':query, 'users':foundusers})
    return HttpResponse(t.render(c))

@login_required
def hatsoff(request, user2):
    user1 = request.user.id
    if user1 < user2:
        try:
            hat = Hatsoff.objects.get(user_one_id=user1, user_two_id=user2)
            if hat.actionuser == 2 and hat.status == 0:
                hat.status = 1
                hat.save()

        except ObjectDoesNotExist:
            hat = Hatsoff.objects.create(user_one_id=user1, user_two_id=user2, actionuser=1, status=0)
            hat.save()

    else:
        try:
            hat = Hatsoff.objects.get(user_one_id=user2, user_two_id=user1)
            if hat.actionuser == 1 and hat.status == 0:
                hat.status = 1
                hat.save()


        except ObjectDoesNotExist:
            hat = Hatsoff.objects.create(user_one_id=user2, user_two_id=user1, actionuser=2, status=0)
            hat.save()

    users = None
    hatlist1 = Hatsoff.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=user1, actionuser=1, status=0) | Q(user_one_id=user1, status=1))
    hatlist2 = Hatsoff.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=user1, actionuser=2, status=0) | Q(user_two_id=user1, status=1))
    hatlist = list(chain(hatlist1, hatlist2))
    
    users = User.objects.filter(id__in=hatlist)

    variables = RequestContext(request, {'users':users})
    return render_to_response('week1/hatsoff_list.html', variables, )

def messages(request):
    users = User.objects.exclude(id=request.user.id)
    myid = request.user.id
    variables = RequestContext(request, {'users':users, 'myid':myid})
    return render_to_response('week1/message.html', variables, )

def private_message(request, uid):
    user = User.objects.get(id=uid)
    print "user.id", user.id
    print "user.name", user.first_name
    myid = request.user.id
    print "my.id", myid
    variables = RequestContext(request, {'chatuser':user, 'myid':myid})
    return render_to_response('week1/private_message.html', variables, )
