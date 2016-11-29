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

from .models import Profile, Hatsoff, FavoriteFolder, Showcase, UpcomingWork, Profession
from .forms import RegistrationForm, LoginForm, ForgotPasswordForm, PersonalPhoto, Step1, Step2, Step3, Step4, Step5, Step6, Step7, PersonalInfo, ProfessionForm

# Create your views here.
@csrf_protect
def index(request):
    if request.method == 'POST':
        print "post"
        if 'login' in request.POST:
            print "login"
            form = LoginForm(request.POST)
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
                signupform = RegistrationForm()
                message.append("The username or password is incorrect.")
                print "message", message
                variables = RequestContext(request, {'message':message, 'loginform':form, 'signupform':signupform, 'p_type':0})

                #template = loader.get_template('week1/discover.html')
                return render_to_response('week1/index.html', variables, )
        

        elif 'signup' in request.POST:
            print "signup"
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
                        return render(request, 'week1/welcome.html')
                #return HttpResponseRedirect('/week1/home/')
            else:
                loginform = LoginForm()
                messages = []
                messages.append(form.errors)
                variables = RequestContext(request, {'messages':messages, 'signupform':form, 'loginform':loginform, 'p_type':1})

                return render_to_response('week1/index.html', variables, )
    """
    else:
        form = RegistrationForm()
    """
    loginform = LoginForm()
    signupform = RegistrationForm()

    variables = RequestContext(request, {'p_type':-1, 'loginform':loginform, 'signupform':signupform})

    #template = loader.get_template('week1/discover.html')
    return render_to_response('week1/index.html', variables, )

@csrf_protect
def about(request):
    if request.method == 'POST':
        print "post"
        if 'login' in request.POST:
            print "login"
            form = LoginForm(request.POST)
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
                signupform = RegistrationForm()
                message = []
                message.append("The username or password is incorrect.")
                print "message", message
                variables = RequestContext(request, {'message':message, 'loginform':form, 'signupform':signupform, 'p_type':0})

                #template = loader.get_template('week1/discover.html')
                return render_to_response('week1/about.html', variables, )
        

        elif 'signup' in request.POST:
            print "signup"
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
                        return render(request, 'week1/welcome.html')
                #return HttpResponseRedirect('/week1/home/')
            else:
                loginform = LoginForm()
                messages = []
                messages.append(form.errors)
                variables = RequestContext(request, {'messages':messages, 'signupform':form, 'loginform':loginform, 'p_type':1})

                return render_to_response('week1/about.html', variables, )

    loginform = LoginForm()
    signupform = RegistrationForm()
    variables = RequestContext(request, {'p_type':-1, 'loginform':loginform, 'signupform':signupform})

    #template = loader.get_template('week1/discover.html')
    return render_to_response('week1/about.html', variables, )

def signin(request):
    form = LoginForm(request.POST or None)
    if request.POST and form.is_valid():
        user = form.login(request)
        if user:
            login(request, user)
            return HttpResponseRedirect('/week1/home/')
    return render_to_response('week1/login.html', context_instance=RequestContext(request, {'form':form}))

    """
    logout(request)
    messages = []
    email = password = ""
    if request.method == 'POST':
        username = request.POST["email"]
        password = request.POST["password"]

        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return HttpResponseRedirect('/week1/home/')
        else:
            messages.append(form.errors)
    return render_to_response('week1/login.html', context_instance=RequestContext(request, {'messages':messages}))
    """

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
    media_url = settings.MEDIA_URL
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
    request.COOKIES['profile_photo'] = profile.photo
    
    print "folderusers", folderusers, folderusers.count()

    try:
        showcases = Showcase.objects.filter(user=currentuser)
    except Showcase.DoesNotExist:
        showcases = None

    try:
        upcomingwork = UpcomingWork.objects.get(user=currentuser, number=1)
    except UpcomingWork.DoesNotExist:
        upcomingwork = None


    return render_to_response('week1/home.html', {'user':currentuser, 'profile':profile, 'hatsusers':hatsusers, 'folderusers':folderusers, 'users':users, 'userphoto':userphoto, 'showcases':showcases, 'upcoming':upcomingwork, 'nodejs_url':nodejs_url, 'media_url':media_url})

def signup_success(request):
    return render_to_response('week1/success_signup.html')

@login_required
def welcome(request):
    return render_to_response('week1/welcome.html')

@csrf_protect
@login_required
def step1(request):
    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    num_result = Profile.objects.filter(user=currentuser).count()

    if num_result == 0:
        p = Profile.objects.create(user=currentuser)
        p.save()

    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == 'POST':
        form = Step1(request.POST, request.FILES, instance=instance, label_suffix="")
        if form.is_valid():
            step = form.save()
            #step = form.save(commit=False)

            nextform = Step2(label_suffix="", instance=instance)
            return HttpResponseRedirect('/week1/step2/', {'form': nextform})
            """
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
            """

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step1(label_suffix="", instance=instance)

    variables = RequestContext(request, {'form':form})

    return render_to_response('week1/step1.html', variables, )

@csrf_protect
@login_required
def step2(request):
    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == 'POST':
        form = Step2(request.POST, instance=instance, label_suffix="")
        if form.is_valid():
            step = form.save()

            nextform = Step3(label_suffix="", instance=instance)
            return HttpResponseRedirect('/week1/step3/', {'form': nextform})
            #return render_to_response('week1/step4.html', {'form':nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step2(label_suffix="", instance=instance)

    variables = RequestContext(request, {'form':form})

    return render_to_response('week1/step2.html', variables, )

@csrf_protect
@login_required
def step3(request):
    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == 'POST':
        print request.POST
        tags = request.POST.getlist('tags')
        print "tags", tags

        form = Step3(request.POST, label_suffix="", instance=instance)

        if form.is_valid():
            tagls = []
            for tag in tags:
                lowtag = tag.capitalize()
                tagls.append(lowtag)
                try:
                    obj = Profession.objects.get(skill=lowtag)
                    obj.count += 1
                    obj.save()
                except Profession.DoesNotExist:
                    obj = Profession(skill=lowtag, count=1)
                    obj.save()

            if len(tagls) != 10:
                for i in range(10-len(tagls)):
                    tagls.append("")

            """
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
            """

            Profile.objects.filter(user=currentuser).update(
                skill1=tagls[0], 
                skill2=tagls[1], 
                skill3=tagls[2],
                skill4=tagls[3],
                skill5=tagls[4],
                skill6=tagls[5], 
                skill7=tagls[6], 
                skill8=tagls[7],
                skill9=tagls[8],
                skill10=tagls[9]
            )

            print tagls

            return HttpResponseRedirect('/week1/home/')
            #nextform = Step4(label_suffix="", instance=instance)
            #return HttpResponseRedirect('/week1/step4/', {'form': nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step3(label_suffix="", instance=instance)
        print form

    variables = RequestContext(request, {'form':form})

    return render_to_response('week1/step3.html', variables, )

@csrf_protect
@login_required
def step4(request):
    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == 'POST':
        form = Step4(request.POST, label_suffix="", instance=instance)
        if form.is_valid():
            form.save()

            nextform = Step5(label_suffix="")
            return HttpResponseRedirect('/week1/step5/', {'form': nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step4(label_suffix="", instance=instance)

    variables = RequestContext(request, {'form':form})
    return render_to_response('week1/step4.html', variables, )


@csrf_protect
@login_required
def step5(request):
    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    num_show = Showcase.objects.filter(user=currentuser).count()

    if num_show == 0:
        s = Showcase.objects.create(user=currentuser, number=1)
        s.save()
        num_show = 1

    instance = get_object_or_404(Showcase, user=currentuser, number=num_show)

    if request.method == 'POST':
        form = Step5(request.POST, request.FILES, label_suffix="", instance=instance)
        if form.is_valid():
            show = form.save(commit=False)
            show.user = currentuser
            #show.number = num_show+1
            show.save()

            if 'next' in request.POST:
                nextform = Step6(label_suffix="")
                return HttpResponseRedirect('/week1/step6/', {'form': nextform})
                #return render_to_response('week1/step6.html', {'form':nextform})
            elif 'more_case' in request.POST:
                nextform = Step5(label_suffix="")
                return HttpResponseRedirect('/week1/step5/', {'form': nextform, 'num_show':num_show+1})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step5(label_suffix="", instance=instance)

    variables = RequestContext(request, {'form':form})
    return render_to_response('week1/step5.html', variables, )

@csrf_protect
@login_required
def step6(request):
    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    num_result = UpcomingWork.objects.filter(user=currentuser, number=1).count()
    print "num_result", num_result

    if num_result == 0:
        u = UpcomingWork.objects.create(user=currentuser, number=1)
        u.save()

    instance = get_object_or_404(UpcomingWork, user=currentuser, number=1)

    if request.method == 'POST':
        form = Step6(request.POST, request.FILES, label_suffix="", instance=instance)
        if form.is_valid():
            work = form.save(commit=False)
            work.user = currentuser
            get_help = form.cleaned_data["get_help"]
            print get_help
            if get_help == 1 or get_help == 2:
                tagls = []
                work.collaborators = form.cleaned_data["collaborators"]
                work.fund = form.cleaned_data["fund"]
                work.comment_help = form.cleaned_data["comment_help"]
                tags = request.POST.getlist('tags')
                print "tags", tags
                for tag in tags:
                    lowtag = tag.capitalize()
                    tagls.append(lowtag)
                    try:
                        obj = Profession.objects.get(skill=lowtag)
                        obj.count += 1
                        obj.save()
                    except Profession.DoesNotExist:
                        obj = Profession(skill=lowtag, count=1)
                        obj.save()

                if len(tagls) != 10:
                    for i in range(10-len(tagls)):
                        tagls.append("")
                work.collaborator_skill1 = tagls[0] 
                work.collaborator_skill2 = tagls[1] 
                work.collaborator_skill3 = tagls[2] 
                work.collaborator_skill4 = tagls[3] 
                work.collaborator_skill5 = tagls[4] 
                work.collaborator_skill6 = tagls[5] 
                work.collaborator_skill7 = tagls[6] 
                work.collaborator_skill8 = tagls[7] 
                work.collaborator_skill9 = tagls[8] 
                work.collaborator_skill10 = tagls[9] 
            else:
                work.collaborators = ""
                work.fund = ""
                work.comment_help = ""
            #num_show = UpcomingWork.objects.filter(user=currentuser).count()
            work.number = 1
            work.save()
            
            nextform = Step7(label_suffix="")
            return HttpResponseRedirect('/week1/step7/', {'form': nextform})
            #return render_to_response('week1/step6.html', {'form':nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step6(label_suffix="", instance=instance)

    variables = RequestContext(request, {'form':form})
    return render_to_response('week1/step6.html', variables, )

@csrf_protect
@login_required
def step7(request):
    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == 'POST':
        form = Step7(request.POST, instance=instance, label_suffix="")
        if form.is_valid():
            form.save()

            return HttpResponseRedirect('/week1/home/')

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step7(instance=instance, label_suffix="")

    variables = RequestContext(request, {'form':form})
    return render_to_response('week1/step7.html', variables, )


@csrf_protect
@login_required
def home_edit_personalinfo(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == "POST":
        form = PersonalInfo(request.POST, instance=instance, label_suffix="")

        if form.is_valid():
            form.save()

            profile = Profile.objects.get(user=currentuser)
            return HttpResponseRedirect('/week1/home/')

    else:
        form = PersonalInfo(instance=instance, label_suffix="")

    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit_personalinfo.html', {'profile':usersprofile, 'form':form})

@csrf_protect
@login_required
def home_edit_url(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == "POST":
        form = Step4(request.POST, instance=instance, label_suffix="")

        if form.is_valid():
            form.save()

            return HttpResponseRedirect('/week1/home/')

    else:
        form = Step4(instance=instance, label_suffix="")

    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit_url.html', {'profile':usersprofile, 'form':form})

@csrf_protect
@login_required
def home_edit_profession(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == "POST":
        form = ProfessionForm(request.POST, instance=instance, label_suffix="")

        if form.is_valid():
            form.save()

            profile = Profile.objects.get(user=currentuser)
            return HttpResponseRedirect('/week1/home/')

    else:
        form = ProfessionForm(instance=instance, label_suffix="")

    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit_profession.html', {'profile':usersprofile, 'form':form})

@csrf_protect
@login_required
def home_edit_professionskills(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == 'POST':
        print request.POST
        tags = request.POST.getlist('tags')
        print "tags", tags

        form = Step3(request.POST, label_suffix="", instance=instance)
        tagls = []

        if form.is_valid():
            for tag in tags:
                lowtag = tag.capitalize()
                tagls.append(lowtag)
                try:
                    obj = Profession.objects.get(skill=lowtag)
                    obj.count += 1
                    obj.save()
                except Profession.DoesNotExist:
                    obj = Profession(skill=lowtag, count=1)
                    obj.save()

            if len(tagls) != 10:
                for i in range(10-len(tagls)):
                    tagls.append("")

            Profile.objects.filter(user=currentuser).update(
                skill1=tagls[0], 
                skill2=tagls[1], 
                skill3=tagls[2],
                skill4=tagls[3],
                skill5=tagls[4],
                skill6=tagls[5], 
                skill7=tagls[6], 
                skill8=tagls[7],
                skill9=tagls[8],
                skill10=tagls[9]
            )

            print tagls

            return HttpResponseRedirect('/week1/home/')
            #return render_to_response('week1/step5.html', {'form':nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step3(label_suffix="", instance=instance)
        print form


    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit_professionskills.html', {'profile':usersprofile, 'form':form})

@csrf_protect
@login_required
def home_edit_funfact(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == 'POST':
        form = Step7(request.POST, instance=instance, label_suffix="")

        if form.is_valid():
            form.save()
            profile = Profile.objects.get(user=currentuser)
            return HttpResponseRedirect('/week1/home/')

    else:
        form = Step7(instance=instance, label_suffix="")

    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit_funfact.html', {'profile':usersprofile, 'form':form})

@csrf_protect
@login_required
def home_edit_photo(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    instance = get_object_or_404(Profile, user=currentuser)

    if request.method == 'POST':
        form = PersonalPhoto(request.POST, request.FILES, instance=instance, label_suffix="")
        if form.is_valid():
            form.save()

            profile = Profile.objects.get(user=currentuser)
            return HttpResponseRedirect('/week1/home/')
        else:
            print "error", form.errors

    else:
        form = PersonalPhoto(instance=instance, label_suffix="")

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
    instance = get_object_or_404(Showcase, user=currentuser, number=num)
    num_show = Showcase.objects.filter(user=currentuser).count()
    if request.method == 'POST':
        form = Step5(request.POST, request.FILES, instance=instance, label_suffix="")
        if form.is_valid():
            work = form.save(commit=False)
            work.number = num
            work.save()

            if 'next' in request.POST:
                return HttpResponseRedirect('/week1/home/')
            elif 'more_case' in request.POST:
                form = Step5(label_suffix="")
                variables = RequestContext(request, {'form':form, 'num_show':num_show+1})
                return HttpResponseRedirect('/week1/edit/previouswork/', variables)
                #return render_to_response('/week1/edit/previouswork/', variables, )

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step5(instance=instance, label_suffix="")

    showcase = Showcase.objects.get(user=currentuser, number=num)

    variables = RequestContext(request, {'form':form, 'showcase':showcase, 'num_show':num_show})
    return render_to_response('week1/homeedit_previouswork.html', variables, )

@csrf_protect
@login_required
def home_edit_newpreviouswork(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    num_show = Showcase.objects.filter(user=currentuser).count()
    if request.method == 'POST':
        form = Step5(request.POST, request.FILES, label_suffix="")
        if form.is_valid():
            print 'valid'
            work = form.save(commit=False)
            work.user = currentuser
            work.number = num_show+1
            work.save()

            if 'next' in request.POST:
                return HttpResponseRedirect('/week1/home/')
            elif 'more_case' in request.POST:
                form = Step5(label_suffix="")
                variables = RequestContext(request, {'form':form, 'num_show':num_show+1})
                return HttpResponseRedirect('/week1/edit/previouswork/', variables)

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form, 'num_show':num_show})

    else:
        form = Step5(label_suffix="")

    variables = RequestContext(request, {'form':form, 'num_show':num_show})
    return render_to_response('week1/homeedit_newpreviouswork.html', variables, )

def home_edit_upcoming(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    num_result = UpcomingWork.objects.filter(user=currentuser, number=1).count()
    print "num_result", num_result

    if num_result == 0:
        u = UpcomingWork.objects.create(user=currentuser, number=1)
        u.save()

    instance = get_object_or_404(UpcomingWork, user=currentuser, number=1)

    if request.method == 'POST':
        form = Step6(request.POST, request.FILES, instance=instance, label_suffix="")
        if form.is_valid():
            work = form.save(commit=False)
            work.number = 1
            get_help = form.cleaned_data["get_help"]
            print "get_help", get_help, type(get_help)
            if get_help == 1 or get_help == 2:
                work.collaborators = form.cleaned_data["collaborators"]
                work.fund = form.cleaned_data["fund"]
                work.comment_help = form.cleaned_data["comment_help"]
                tags = request.POST.getlist('tags')
                tagls = []
                for tag in tags:
                    lowtag = tag.capitalize()
                    tagls.append(lowtag)
                    try:
                        obj = Profession.objects.get(skill=lowtag)
                        obj.count += 1
                        obj.save()
                    except Profession.DoesNotExist:
                        obj = Profession(skill=lowtag, count=1)
                        obj.save()

                if len(tagls) != 10:
                    for i in range(10-len(tagls)):
                        tagls.append("")
                work.collaborator_skill1 = tagls[0] 
                work.collaborator_skill2 = tagls[1] 
                work.collaborator_skill3 = tagls[2] 
                work.collaborator_skill4 = tagls[3] 
                work.collaborator_skill5 = tagls[4] 
                work.collaborator_skill6 = tagls[5] 
                work.collaborator_skill7 = tagls[6] 
                work.collaborator_skill8 = tagls[7] 
                work.collaborator_skill9 = tagls[8] 
                work.collaborator_skill10 = tagls[9] 
            else:
                work.collaborators = ""
                work.fund = ""
                work.comment_help = ""
            work.save()

            return HttpResponseRedirect('/week1/home/')

        else:
            messages = []
            messages.append(form.errors)
            print "mwssages", messages
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step6(instance=instance, label_suffix="")
        """
        try:
            upcoming = UpcomingWork.objects.get(user=currentuser, number=1)
        except UpcomingWork.DoesNotExist:
            upcoming = None
        """

    variables = RequestContext(request, { 'form':form })
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

    q = query.capitalize()
    try:
        foundskills = Profile.objects.filter( Q(skill1=q) | Q(skill2=q) | Q(skill3=q) | Q(skill4=q) | Q(skill5=q) | Q(skill6=q) | Q(skill7=q) | Q(skill8=q) | Q(skill9=q) | Q(skill10=q)).exclude(id=request.user.id)
    except ObjectDoesNotExist:
        foundskills = None


    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'query':query, 'users':foundusers, 'skills':foundskills, 'nodejs_url':nodejs_url, 'profile':profile})
    return render_to_response('week1/results_friends.html', variables, )
    #return HttpResponse(t.render(c))


@login_required
def talent_list(request, query):
    newquery = request.GET.get('search_query', None)
    
    if newquery != None:
        return HttpResponseRedirect('/week1/results/friends/'+newquery, {'query': newquery})

    nodejs_url = settings.NODEJS_SOCKET_URL
    #temporary results

    q = query.capitalize()
    try:
        foundskills = Profile.objects.filter( Q(skill1=q) | Q(skill2=q) | Q(skill3=q) | Q(skill4=q) | Q(skill5=q) | Q(skill6=q) | Q(skill7=q) | Q(skill8=q) | Q(skill9=q) | Q(skill10=q)).exclude(id=request.user.id)
    except ObjectDoesNotExist:
        foundskills = None


    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'query':query, 'skills':foundskills, 'nodejs_url':nodejs_url, 'profile':profile})
    return render_to_response('week1/talent_list.html', variables, )
    #return HttpResponse(t.render(c))

@login_required
def hatsoff_list(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    """
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
    """

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

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

    media_url = settings.MEDIA_URL
    nodejs_url = settings.NODEJS_SOCKET_URL

    variables = RequestContext(request, {'profile':profile, 'user':currentuser, 'users':users, 'userphoto':userphoto, 'media_url':media_url, 'nodejs_url':nodejs_url})

    return render_to_response('week1/hatsoff_list.html', variables, )

@login_required
def thanks_list(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

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

    media_url = settings.MEDIA_URL
    nodejs_url = settings.NODEJS_SOCKET_URL

    variables = RequestContext(request, {'profile':profile, 'user':currentuser, 'users':users, 'userphoto':userphoto, 'media_url':media_url, 'nodejs_url':nodejs_url})
    return render_to_response('week1/thanks_list.html', variables, )

@login_required
def follow_list(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

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

    media_url = settings.MEDIA_URL
    nodejs_url = settings.NODEJS_SOCKET_URL

    variables = RequestContext(request, {'profile':profile, 'user':currentuser, 'users':users, 'userphoto':userphoto, 'media_url':media_url, 'nodejs_url':nodejs_url})
    return render_to_response('week1/follow_list.html', variables, )


"""
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
"""

@login_required
def messages(request):
    nodejs_url = settings.NODEJS_SOCKET_URL
    myid = request.user.id

    allusers = list(User.objects.all())

    users = []
    usernames = []
    userphoto = []
    for u in allusers:
        usernames.append(u.first_name)
        users.append(u.id)
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
            print "prof", prof, type(prof)
        except Profile.DoesNotExist:
            prof = "None"

        userphoto.append(str(prof))

    media_url = settings.MEDIA_URL
    variables = RequestContext(request, {'users':users, 'userphoto':userphoto, 'usernames':usernames, 'media_url':media_url, 'nodejs_url':nodejs_url})
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
    media_url = settings.MEDIA_URL
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

    variables = RequestContext(request, {'target_profile':target_profile, 'profile':profile, 'uid':uid, 'hatsusers':hatsusers, 't_user':user, 'showcases':showcases, 'upcoming':upcomingwork, 'userphoto':userphoto, 'users':users, 'nodejs_url':nodejs_url, 'media_url':media_url})
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
def community_needyou(request):
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

    currentuser = User.objects.get(id=uid, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile, 'userphoto':userphoto, 'users':users})
    return render_to_response('week1/community_needyou.html', variables, )

@login_required
def collaborators_you_need(request):
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

    currentuser = User.objects.get(id=uid, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile, 'userphoto':userphoto, 'users':users})
    return render_to_response('week1/collaborators_you_need.html', variables, )

@login_required
def collaborators_need_you(request):
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

    currentuser = User.objects.get(id=uid, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile, 'userphoto':userphoto, 'users':users})
    return render_to_response('week1/collaborators_need_you.html', variables, )

@login_required
def community_post(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    c_id = request.GET.get('c_id')
    print "c_id:", c_id

    tag = int(request.GET.get('tag'))

    print "tag:",tag, type(tag)

    auid = request.GET.get('u')
    print "uid:",auid 

    uid = request.user.id
    nodejs_url = settings.NODEJS_SOCKET_URL
    media_url = settings.MEDIA_URL
    currentuser = User.objects.get(id=uid, username=request.user.username)
    author = User.objects.get(id=auid)
    profile = Profile.objects.get(user=currentuser)
    if tag != -1:
        try:
            upcoming = UpcomingWork.objects.get(user=author, number=tag)
            variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile, 'c_id':c_id, 'upcoming':upcoming})
        except UpcomingWork.DoesNotExist:
            variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile, 'c_id':c_id})
    else:
        variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile, 'c_id':c_id})

    return render_to_response('week1/community_post.html', variables, )

@login_required
def notification(request):
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL

    currentuser = User.objects.get(id=request.user.id, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)


    allusers = list(User.objects.all())

    users = []
    usernames = []
    userphoto = []
    for u in allusers:
        usernames.append(u.first_name)
        users.append(u.id)
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
            print "prof", prof, type(prof)
        except Profile.DoesNotExist:
            prof = "None"

        userphoto.append(str(prof))

    variables = RequestContext(request, {'nodejs_url':nodejs_url, 'profile':profile, 'users':users, 'usernames':usernames, 'userphoto':userphoto})
    return render_to_response('week1/notification.html', variables, )

@login_required
def folder(request):
    uid = request.user.id
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL
    media_url = settings.MEDIA_URL

    currentuser = User.objects.get(id=uid, username=request.user.username)
    profile = Profile.objects.get(user=currentuser)

    folder1 = FavoriteFolder.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=uid, actionuser=2, status=0) | Q(user_one_id=uid, status=1))
    folder2 = FavoriteFolder.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=uid, actionuser=1, status=0) | Q(user_two_id=uid, status=1))
    folderlist = list(chain(folder1, folder2))
    fusers = User.objects.filter(id__in=folderlist)
    userlist = list(fusers)
    folderusers = Profile.objects.filter(user__in=userlist)

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


    variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile, 'folderusers':folderusers, 'users':users, 'userphoto':userphoto})
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

@csrf_protect
@login_required
def historyboard(request):
    media_url = settings.MEDIA_URL
    nodejs_url = settings.NODEJS_SOCKET_URL
    uid = request.user.id
    query = request.GET.get('search_query', None)
    
    if query != None:
        return HttpResponseRedirect('/week1/results/friends/'+query, {'query': query})

    currentuser = User.objects.get(id=uid, username=request.user.username)
    num_result = Profile.objects.filter(user=currentuser).count()
    if num_result == 0:
        p = Profile.objects.create(user=currentuser)
        p.save()

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

    return render_to_response('week1/historyboard.html', {'user':currentuser, 'users':users, 'userphoto':userphoto, 'nodejs_url':nodejs_url, 'media_url':media_url})

