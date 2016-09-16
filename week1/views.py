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

from django.conf import settings
from django.contrib.auth.forms import SetPasswordForm, PasswordResetForm

from .models import Profile, Hatsoff, FavoriteFolder, Showcase, UpcomingWork
from .forms import RegistrationForm, ProfileForm, ForgotPasswordForm, Step1, Step2, Step3, Step4, Step5, Step6, Step7, PersonalInfo, PersonalPhoto, Funfact

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
    nodejs_url = settings.NODEJS_SOCKET_URL
    print "userid", request.user.id
    uid = request.user.id
    query = request.GET.get('search_query', None)
    
    if query != None:
        print "query", query
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=uid, username=request.user.username)
    num_result = Profile.objects.filter(user=currentuser).count()
    if num_result == 0:
        p = Profile.objects.create(user=currentuser)
        p.save()

    hatlist1 = Hatsoff.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=uid, actionuser=2, status=0) | Q(user_one_id=uid, status=1))
    hatlist2 = Hatsoff.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=uid, actionuser=1, status=0) | Q(user_two_id=uid, status=1))
    hatlist = list(chain(hatlist1, hatlist2))

    users = User.objects.filter(id__in=hatlist)
    print "users:", type(users), users
    userlist = list(users)

    hatsusers = Profile.objects.filter(user__in=userlist)

    folderlist1 = FavoriteFolder.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=uid, actionuser=1, status=0) | Q(user_one_id=uid, status=1))
    folderlist2 = FavoriteFolder.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=uid, actionuser=2, status=0) | Q(user_two_id=uid, status=1))
    folderlist = list(chain(folderlist1, folderlist2))

    allusers = list(User.objects.all())
    users = []
    userphoto = []
    for u in allusers:
        print "uid", u.id
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
            print "prof", prof, type(prof)
        except Profile.DoesNotExist:
            prof = None

        if prof != None:
            users.append(u.id)
            userphoto.append(str(prof))


    folderusers = Profile.objects.filter(user__in=userlist)
    profile = Profile.objects.get(user=currentuser)
    
    print "folderusers", folderusers, folderusers.count()

    try:
        showcases = Showcase.objects.filter(user=currentuser)
    except Showcase.DoesNotExist:
        showcases = None

    try:
        upcomingwork = UpcomingWork.objects.get(user=currentuser, number=1)
    except UpcomingWork.DoesNotExist:
        upcomingwork = None


    return render_to_response('week1/home.html', {'user':currentuser, 'profile':profile, 'hatsusers':hatsusers, 'folderusers':folderusers, 'users':users, 'userphoto':userphoto, 'showcases':showcases, 'upcoming':upcomingwork, 'nodejs_url':nodejs_url})

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
        form = Step1(request.POST, request.FILES)
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
                
            if len(request.FILES) != 0:
                photo = request.FILES['photo']
                p = Profile.objects.create(user=currentuser, displayname=displayname, profession=profession, city=city, worksAt=worksAt, education=education, birthdate=birthdate, language=language, photo=photo)
                p.save()
            else:
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
        form = Step2(request.POST)
        if form.is_valid():
            describe = form.cleaned_data["describe"]

            Profile.objects.filter(user=currentuser).update(describe=describe)

            nextform = Step3()
            return HttpResponseRedirect('/week1/step3/', {'form': nextform})
            #return render_to_response('week1/step4.html', {'form':nextform})

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
            skill1 = form.cleaned_data["skill1"]
            skill2 = form.cleaned_data["skill2"]
            skill3 = form.cleaned_data["skill3"]
            """
            skill4 = form.cleaned_data["skill4"]
            skill5 = form.cleaned_data["skill5"]
            skill6 = form.cleaned_data["skill6"]
            skill7 = form.cleaned_data["skill7"]
            skill8 = form.cleaned_data["skill8"]
            skill9 = form.cleaned_data["skill9"]
            skill10 = form.cleaned_data["skill10"]
            """

            Profile.objects.filter(user=currentuser).update(
                skill1=skill1, 
                skill2=skill2, 
                skill3=skill3 
            )

            nextform = Step4()
            return HttpResponseRedirect('/week1/step4/', {'form': nextform})
            #return render_to_response('week1/step5.html', {'form':nextform})

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
            weburl = form.cleaned_data["weburl"]

            Profile.objects.filter(user=currentuser).update(weburl=weburl)

            nextform = Step5()
            return HttpResponseRedirect('/week1/step5/', {'form': nextform})

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
            title = form.cleaned_data["title"]
            describe = form.cleaned_data["describe"]
            role = form.cleaned_data["role"]
            completion = form.cleaned_data["completion"]
            num_show = Showcase.objects.filter(user=currentuser).count()
            if len(request.FILES) != 0:
                image = request.FILES["img"]
                s = Showcase.objects.create(user=currentuser, number=num_show+1, title=title, image=image, describe=describe, role=role, completion=completion)
                s.save()
            else:
                s = Showcase.objects.create(user=currentuser, number=num_show+1, title=title, describe=describe, role=role, completion=completion)
                s.save()

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
        form = Step6(request.POST, request.FILES)
        if form.is_valid():
            title = form.cleaned_data["title"]
            describe = form.cleaned_data["describe"]
            role = form.cleaned_data["role"]
            status = form.cleaned_data["status"]
            targetdate = form.cleaned_data["targetdate"]
            comment = form.cleaned_data["comment"]
            num_show = UpcomingWork.objects.filter(user=currentuser).count()
            if len(request.FILES) != 0:
                image = request.FILES["img"]
                u = UpcomingWork.objects.create(user=currentuser, number=num_show+1, title=title, image=image, describe=describe, role=role, status=status, targetdate=targetdate, comment=comment)
                u.save()
            else:
                u = UpcomingWork.objects.create(user=currentuser, number=num_show+1, title=title, describe=describe, role=role, status=status, targetdate=targetdate, comment=comment)
                u.save()


            nextform = Step7()
            return HttpResponseRedirect('/week1/step7/', {'form': nextform})
            #return render_to_response('week1/step6.html', {'form':nextform})

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
            funaboutyou = form.cleaned_data["funaboutyou"]
            hobby = form.cleaned_data["funaboutyou"]
            fQuote = form.cleaned_data["fQuote"]
            fFilm = form.cleaned_data["fFilm"]
            fTV = form.cleaned_data["fTV"]
            fYoutube= form.cleaned_data["fYoutube"]
            fBook = form.cleaned_data["fBook"]
            bookNow = form.cleaned_data["bookNow"]
            filmNow = form.cleaned_data["filmNow"]
            TVNow = form.cleaned_data["TVNow"]
            cities = form.cleaned_data["cities"]

            p = Profile.objects.get(user=currentuser)
            p.funaboutyou=funaboutyou
            p.fQuote = fQuote
            p.fFilm = fFilm
            p.fTV = fTV
            p.fYoutube = fYoutube
            p.fBook = fBook
            p.bookNow=bookNow
            p.filmNow=filmNow
            p.TVNow = TVNow
            p.hobby = hobby
            p.cities = cities 
            p.save() 

            return HttpResponseRedirect('/week1/home/', {'user': currentuser, 'profile':p})

        else:
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

@csrf_protect
@login_required
def home_edit_personalinfo(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    num_result = Profile.objects.filter(user=currentuser).count()
    if request.method == "POST":
        form = PersonalInfo(request.POST)

        if form.is_valid():
            city = form.cleaned_data["city"]
            worksAt = form.cleaned_data["worksAt"]
            education = form.cleaned_data["education"]
            language = form.cleaned_data["language"]
            skill1 = form.cleaned_data["skill1"]
            skill2 = form.cleaned_data["skill2"]

            if num_result == 0:
                p = Profile.objects.create(user=currentuser, worksAt=worksAt, city=city, education=education, language=language, skill1=skill1, skill2=skill2)
                p.save()

            else:
                p = Profile.objects.get(user=currentuser)
                p.worksAt = worksAt
                p.city = city
                p.education = education
                p.language = language 
                p.skill1 = skill1 
                p.skill2 = skill2 
                p.save()

            profile = Profile.objects.get(user=currentuser)
            return HttpResponseRedirect('/week1/home/')

    else:
        form = PersonalInfo()
        if num_result == 0:
            p = Profile.objects.create(user=currentuser)
            p.save()

    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit_personalinfo.html', {'profile':usersprofile, 'form':form})


@csrf_protect
@login_required
def home_edit_funfact(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    num_result = Profile.objects.filter(user=currentuser).count()
    if request.method == "POST":
        form = Funfact(request.POST)

        if form.is_valid():
            funaboutyou = form.cleaned_data["funaboutyou"]
            hobby = form.cleaned_data["hobby"]
            fQuote = form.cleaned_data["fQuote"]
            fFilm = form.cleaned_data["fFilm"]
            fTV = form.cleaned_data["fTV"]
            fYoutube = form.cleaned_data["fYoutube"]
            fBook = form.cleaned_data["fBook"]

            if num_result == 0:
                p = Profile.objects.create(user=currentuser, funaboutyou=funaboutyou, hobby=hobby, fQuote=fQuote, fFilmn=fFilm, fTV=fTV, fYoutube=fYoutube, fBook=fBook)
                p.save()

            else:
                p = Profile.objects.get(user=currentuser)
                p.funaboutyou = funaboutyou
                p.hobby = hobby
                p.fQuote = fQuote
                p.fFilm = fFilm
                p.fTV = fTV
                p.fYoutube = fYoutube
                p.fBook = fBook
                p.save()

            profile = Profile.objects.get(user=currentuser)
            return HttpResponseRedirect('/week1/home/')

    else:
        form = Funfact()
        if num_result == 0:
            p = Profile.objects.create(user=currentuser)
            p.save()

    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit_funfact.html', {'profile':usersprofile, 'form':form})

@csrf_protect
@login_required
def home_edit_photo(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    num_result = Profile.objects.filter(user=currentuser).count()

    if request.method == 'POST':
        form = PersonalPhoto(request.FILES)
        if form.is_valid():
            photo = request.FILES["photo"]

            if num_result == 0:
                p = Profile.objects.create(user=currentuser, photo=photo)
                p.save()
            else:
                p = Profile.objects.get(user=currentuser)
                p.photo = photo
                p.save()

            profile = Profile.objects.get(user=currentuser)
            return HttpResponseRedirect('/week1/home/')

    else:
        form = PersonalPhoto()
        if num_result == 0:
            p = Profile.objects.create(user=currentuser)
            p.save()

    profile = Profile.objects.get(user=currentuser)
    variables = RequestContext(request, {'form':form})
    return render(request, 'week1/homeedit_photo.html', {'profile':profile, 'form':form})

@csrf_protect
@login_required
def home_edit_previouswork(request, num):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    if request.method == 'POST':
        currentuser = User.objects.get(id=request.user.id, username=request.user.username)
        form = Step5(request.POST, request.FILES)
        if form.is_valid():
            print 'valid'
            title = form.cleaned_data["title"]
            describe = form.cleaned_data["describe"]
            role = form.cleaned_data["role"]
            completion = form.cleaned_data["completion"]
            s = Showcase.objects.filter(user=currentuser, number=num)
            if len(request.FILES) != 0:
                print 'length is not zero'
                image = request.FILES["img"]
                s.title=title
                s.image=image
                s.describe=describe
                s.role=role
                s.completion=completion
                s.save()
            else:
                print 'length is zero'
                s.title=title
                s.describe=describe
                s.role=role
                s.completion=completion
                s.save()

            return HttpResponseRedirect('/week1/home/')

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step5()

    showcase = Showcase.objects.get(user=currentuser, number=num)

    variables = RequestContext(request, {'form':form, 'showcase':showcase})
    return render_to_response('week1/homeedit_previouswork.html', variables, )

@csrf_protect
@login_required
def home_edit_newpreviouswork(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    if request.method == 'POST':
        currentuser = User.objects.get(id=request.user.id, username=request.user.username)
        form = Step5(request.POST, request.FILES)
        if form.is_valid():
            print 'valid'
            title = form.cleaned_data["title"]
            describe = form.cleaned_data["describe"]
            role = form.cleaned_data["role"]
            completion = form.cleaned_data["completion"]
            num_show = Showcase.objects.filter(user=currentuser).count()
            if len(request.FILES) != 0:
                print 'length is zero'
                image = request.FILES["img"]
                s = Showcase.objects.create(user=currentuser, number=num_show+1, title=title, image=image, describe=describe, role=role, completion=completion)
                s.save()
            else:
                print 'length is not zero'
                s = Showcase.objects.create(user=currentuser, number=num_show+1, title=title, describe=describe, role=role, completion=completion)
                s.save()

            return HttpResponseRedirect('/week1/home/')

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step5()

    variables = RequestContext(request, {'form':form})
    return render_to_response('week1/homeedit_newpreviouswork.html', variables, )

def home_edit_upcoming(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)

    if request.method == 'POST':
        currentuser = User.objects.get(id=request.user.id, username=request.user.username)
        form = Step6(request.POST, request.FILES)
        if form.is_valid():
            print 'valid'
            title = form.cleaned_data["title"]
            describe = form.cleaned_data["describe"]
            role = form.cleaned_data["role"]
            status = form.cleaned_data["status"]
            targetdate = form.cleaned_data["targetdate"]
            comment = form.cleaned_data["comment"]

            num_show = UpcomingWork.objects.filter(user=currentuser).count()
            if len(request.FILES) != 0:
                print 'length is zero'
                image = request.FILES["img"]
                u = UpcomingWork.objects.create(user=currentuser, number=num_show+1, title=title, image=image, describe=describe, role=role, status=status, targetdate=targetdate, comment=comment)
                u.save()
            else:
                print 'length is not zero'
                u = UpcomingWork.objects.create(user=currentuser, number=num_show+1, title=title, describe=describe, role=role, status=status, targetdate=targetdate, comment=comment)
                u.save()

            return HttpResponseRedirect('/week1/home/')

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step6()
        try:
            upcoming = UpcomingWork.objects.get(user=currentuser, number=1)
        except UpcomingWork.DoesNotExist:
            upcoming = None

    variables = RequestContext(request, { 'form':form, 'upcoming':upcoming })
    return render_to_response('week1/homeedit_upcoming.html', variables, )

def reset_confirm(request, uidb64=None, token=None):
    if uidb64 != None and token != None:
        print "uidb", uidb64
        print "token", token
    return password_reset_confirm(request, template_name='week1/password_reset_confirm.html', uidb64=uidb64, token=token, set_password_form=SetPasswordForm, post_reset_redirect='/week1/login/')

@csrf_protect
def reset(request):
    message = []

    if request.method == 'POST':
        #form = ForgotPasswordForm(request.POST)
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            validemail = form.cleaned_data["email"]
            print "validemail", validemail
            num_result = User.objects.filter(username=validemail).count()

            if num_result == 0:
                message.append("The email is not registered.")

            else:
                password_reset(request, from_email='MatchHat.tmp@gmail.com', email_template_name='week1/password_reset_email.html', subject_template_name=None, template_name=None, post_reset_redirect='week1/password_reset_email_sent.html')
                #form.save(from_email='MatchHat.tmp@gmail.com', email_template_name='week1/password_reset_email.html', request=request)
                print "num result", num_result
                return render_to_response('week1/password_reset_email_sent.html')

    else:
        #form = ForgotPasswordForm()
        form = PasswordResetForm()

    variables = RequestContext(request, {'form':form, 'message':message})

    #template = loader.get_template('week1/discover.html')
    return render_to_response('week1/password_reset.html', variables, )

@login_required
def results_friends(request, query):
    newquery = request.GET.get('search_query', None)
    
    if newquery != None:
        return HttpResponseRedirect('/week1/results/friends/'+newquery, {'query': newquery})

    nodejs_url = settings.NODEJS_SOCKET_URL
    t = loader.get_template('week1/results_friends.html')
    #temporary results
    try:
        foundusers = User.objects.filter(first_name=query).exclude(id=request.user.id)
    except ObjectDoesNotExist:
        foundusers = None

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'query':query, 'users':foundusers, 'nodejs_url':nodejs_url, 'profile':profile})
    return render_to_response('week1/results_friends.html', variables, )
    #return HttpResponse(t.render(c))

@login_required
def hatsoff(request, user2):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

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

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'users':users, 'profile':profile})
    return render_to_response('week1/hatsoff_list.html', variables, )

@login_required
def hatsoff_list(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    user1 = request.user.id

    giveusers = None
    givehat1 = Hatsoff.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=user1, actionuser=1, status=0) | Q(user_one_id=user1, status=1))
    givehat2 = Hatsoff.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=user1, actionuser=2, status=0) | Q(user_two_id=user1, status=1))
    givehat = list(chain(givehat1, givehat2))
    
    users = User.objects.filter(id__in=givehat)
    giveusers = Profile.objects.filter(user__in=users)

    receiveusers = None
    receivehat1 = Hatsoff.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=user1, actionuser=2, status=0) | Q(user_one_id=user1, status=1))
    receivehat2 = Hatsoff.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=user1, actionuser=1, status=0) | Q(user_two_id=user1, status=1))
    receivehat = list(chain(receivehat1, receivehat2))

    users = User.objects.filter(id__in=receivehat)
    receiveusers = Profile.objects.filter(user__in=users)

    folderlist1 = FavoriteFolder.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=user1, actionuser=1, status=0) | Q(user_one_id=user1, status=1))
    folderlist2 = FavoriteFolder.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=user1, actionuser=2, status=0) | Q(user_two_id=user1, status=1))
    folderlist = list(chain(folderlist1, folderlist2))

    fusers = User.objects.filter(id__in=folderlist)
    userlist = list(fusers)
    folderusers = Profile.objects.filter(user__in=userlist)

    currentuser = User.objects.get(id=user1, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'giveusers':giveusers, 'receiveusers':receiveusers, 'folderusers':folderusers, 'profile':profile})
    return render_to_response('week1/hatsoff_list.html', variables, )

@login_required
def messages(request):
    nodejs_url = settings.NODEJS_SOCKET_URL
    myid = request.user.id

    allusers = list(User.objects.all().exclude(id=myid))

    users = []
    usernames = []
    userphoto = []
    for u in allusers:
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
        except Profile.DoesNotExist:
            prof = None

        if prof != None:
            users.append(u.id)
            #usernames.append([u.first_name, u.last_name])
            usernames.append(u.first_name)
            userphoto.append(str(prof))

    media_url = settings.MEDIA_URL
    variables = RequestContext(request, {'users':users, 'usernames':usernames, 'userphoto':userphoto, 'media_url':media_url, 'nodejs_url':nodejs_url})
    return render_to_response('week1/message.html', variables, )

@login_required
def private_message(request, uid):
    nodejs_url = settings.NODEJS_SOCKET_URL
    user = User.objects.get(id=uid)
    print "user.id", user.id
    print "user.name", user.first_name
    myid = request.user.id
    print "my.id", myid
    variables = RequestContext(request, {'chatuser':user, 'myid':myid, 'nodejs_url':nodejs_url})
    return render_to_response('week1/private_message.html', variables, )

@login_required
def get_profile(request, uid):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL
    user = User.objects.get(id=uid)
    target_profile = Profile.objects.get(user=user)

    hatlist1 = Hatsoff.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=uid, actionuser=2, status=0) | Q(user_one_id=uid, status=1))
    hatlist2 = Hatsoff.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=uid, actionuser=1, status=0) | Q(user_two_id=uid, status=1))
    hatlist = list(chain(hatlist1, hatlist2))

    users = User.objects.filter(id__in=hatlist)
    print "users:", type(users), users
    userlist = list(users)

    hatsusers = Profile.objects.filter(user__in=userlist)

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    try:
        showcases = Showcase.objects.filter(user=user)
    except Showcase.DoesNotExist:
        showcases = None

    try:
        upcomingwork = UpcomingWork.objects.get(user=user, number=1)
    except UpcomingWork.DoesNotExist:
        upcomingwork = None

    variables = RequestContext(request, {'target_profile':target_profile, 'profile':profile, 'uid':uid, 'hatsusers':hatsusers, 't_user':user, 'showcases':showcases, 'upcoming':upcomingwork, 'nodejs_url':nodejs_url})
    return render_to_response('week1/userpage.html', variables, )

@login_required
def community(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL
    media_url = settings.MEDIA_URL

    allusers = list(User.objects.all())

    users = []
    userphoto = []
    for u in allusers:
        print "uid", u.id
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
            print "prof", prof, type(prof)
        except Profile.DoesNotExist:
            prof = None

        if prof != None:
            users.append(u.id)
            userphoto.append(str(prof))

    uid = request.user.id
    folderlist1 = FavoriteFolder.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=uid, actionuser=1, status=0) | Q(user_one_id=uid, status=1))
    folderlist2 = FavoriteFolder.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=uid, actionuser=2, status=0) | Q(user_two_id=uid, status=1))
    folderlist = list(chain(folderlist1, folderlist2))

    fusers = User.objects.filter(id__in=folderlist)
    userlist = list(fusers)
    folderusers = Profile.objects.filter(user__in=userlist)

    currentuser = User.objects.get(id=uid, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile, 'userphoto':userphoto, 'users':users, 'folderusers':folderusers})
    return render_to_response('week1/community.html', variables, )

@login_required
def notification(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'nodejs_url':nodejs_url, 'profile':profile})
    return render_to_response('week1/notification.html', variables, )

@login_required
def folder(request):
    uid = request.user.id
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL

    currentuser = User.objects.get(id=uid, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    folder1 = FavoriteFolder.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=uid, actionuser=2, status=0) | Q(user_one_id=uid, status=1))
    folder2 = FavoriteFolder.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=uid, actionuser=1, status=0) | Q(user_two_id=uid, status=1))
    folderlist = list(chain(folder1, folder2))
    folder = User.objects.filter(id__in=folderlist)

    variables = RequestContext(request, {'nodejs_url':nodejs_url, 'profile':profile, 'folder':folder})
    return render_to_response('week1/folder.html', variables, )

@login_required
def add_folder(request, user2):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    user1 = request.user.id
    if user1 < user2:
        try:
            folder = FavoriteFolder.objects.get(user_one_id=user1, user_two_id=user2)
            if folder.actionuser == 2 and folder.status == 0:
                folder.status = 1
                folder.save()

        except ObjectDoesNotExist:
            folder = FavoriteFolder.objects.create(user_one_id=user1, user_two_id=user2, actionuser=1, status=0)
            folder.save()

    else:
        try:
            folder = FavoriteFolder.objects.get(user_one_id=user2, user_two_id=user1)
            if folder.actionuser == 1 and folder.status == 0:
                folder.status = 1
                folder.save()


        except ObjectDoesNotExist:
            folder = FavoriteFolder.objects.create(user_one_id=user2, user_two_id=user1, actionuser=2, status=0)
            folder.save()

    users = None
    folderlist1 = FavoriteFolder.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=user1, actionuser=1, status=0) | Q(user_one_id=user1, status=1))
    folderlist2 = FavoriteFolder.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=user1, actionuser=2, status=0) | Q(user_two_id=user1, status=1))
    folderlist = list(chain(folderlist1, folderlist2))

    print "folderlist", folderlist
    
    users = User.objects.filter(id__in=folderlist)

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'users':users, 'profile':profile})
    return render_to_response('week1/add_folder.html', variables, )

