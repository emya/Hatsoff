from django.shortcuts import render, get_object_or_404, redirect

from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout, login, authenticate

from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader, RequestContext, Context
from django.template.context_processors import csrf
from django.shortcuts import render_to_response

from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.views.decorators.csrf import requires_csrf_token, ensure_csrf_cookie

from django.core.mail import EmailMessage, send_mail

from django.core.urlresolvers import reverse
from django.contrib.auth.views import password_reset, password_reset_confirm

from django.core.exceptions import ObjectDoesNotExist

from django.db.models import Q
from itertools import chain

from django.conf import settings
from django.contrib.auth.forms import SetPasswordForm, PasswordResetForm

from .models import User, Profile, Hatsoff, FavoriteFolder, Showcase, UpcomingWork, Profession, Feedback
from .forms import RegistrationForm, LoginForm, ForgotPasswordForm, PersonalPhoto, Step1, Step2, Step3, Step4, Step5, Step6, Step7, PersonalInfo, ProfessionForm, FeedbackForm, ValidatingPasswordChangeForm

import uuid

# Create your views here.
#@csrf_exempt
#@ensure_csrf_cookie
@csrf_protect
def index(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    if request.method == 'POST':
        if 'login' in request.POST:
            form = LoginForm(request.POST)
            username = request.POST["username"]
            password = request.POST["password"]

            try:
                login_user = User.objects.get(email=username)
                user = authenticate(username=login_user.uid, password=password)

                if user:
                    if user.is_active:
                        login(request, user)
                        variables = RequestContext(request, {})
                        return HttpResponseRedirect('/week1/community/')

                # When user is None
                else:
                    message = []
                    signupform = RegistrationForm()
                    message.append("The username or password is incorrect.")
                    #variables = RequestContext(request, {'message':message, 'loginform':form, 'signupform':signupform, 'p_type':0})
                    variables = {'message':message, 'loginform':form, 'signupform':signupform, 'p_type':0}

                    return render(request, 'week1/index.html', variables)

            except User.DoesNotExist:
                message = []
                signupform = RegistrationForm()
                message.append("Sorry, Your email is not registered. Please sign up.")
                variables = {'message':message, 'loginform':form, 'signupform':signupform, 'p_type':0}

                return render(request, 'week1/index.html', variables)

        elif 'signup' in request.POST:
            form = RegistrationForm(request.POST)
            if form.is_valid():
                username = form.cleaned_data['username']
                first_name = form.cleaned_data['first_name'].capitalize()
                last_name = form.cleaned_data['last_name'].capitalize()
                password = form.cleaned_data['password1']

                uid = uuid.uuid4()
                user = User.objects.create_user(
                     username = uid,
                     email = username,
                     first_name = first_name,
                     last_name = last_name,
                     password = password,
                     uid = uid,
                )

                newuser = authenticate(username=uid, password=password)

                if newuser:
                    tomail = EmailMessage('Dear '+first_name, "Thank you for registering!", to=[username])
                    tomail.send()
                    
                    if newuser.is_active:
                        login(request, newuser)
                        return render(request, 'week1/welcome.html')
                #return HttpResponseRedirect('/week1/home/')
            else:
                loginform = LoginForm()
                messages = []
                messages.append(form.errors)
                variables = {'messages':messages, 'signupform':form, 'loginform':loginform, 'p_type':1}

                return render(request, 'week1/index.html', variables)
                #return render_to_response('week1/index.html', variables, )
    loginform = LoginForm()
    signupform = RegistrationForm()

    #variables = RequestContext(request, {'p_type':-1, 'loginform':loginform, 'signupform':signupform})
    variables = {'p_type':-1, 'loginform':loginform, 'signupform':signupform}

    #template = loader.get_template('week1/discover.html')
    return render(request, 'week1/index.html', variables)

@csrf_protect
@login_required
def home(request):
    media_url = settings.MEDIA_URL
    nodejs_url = settings.NODEJS_SOCKET_URL
    uid = request.user.id
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)

    num_result = Profile.objects.filter(user=currentuser).count()
    if num_result == 0:
        p = Profile.objects.create(user=currentuser)
        p.save()

    hatlist1 = Hatsoff.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=uid, actionuser=2, status=0) | Q(user_one_id=uid, status=1))
    hatlist2 = Hatsoff.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=uid, actionuser=1, status=0) | Q(user_two_id=uid, status=1))
    hatlist = list(chain(hatlist1, hatlist2))

    users = User.objects.filter(id__in=hatlist)
    userlist = list(users)

    hatsusers = Profile.objects.filter(user__in=userlist)

    allusers = list(User.objects.all())
    users = []
    for u in allusers:
        users.append(u.id)


    folderusers = Profile.objects.filter(user__in=userlist)
    profile = Profile.objects.get(user=currentuser)
    request.COOKIES['profile_photo'] = profile.photo
    
    try:
        showcases = Showcase.objects.filter(user=currentuser)
    except Showcase.DoesNotExist:
        showcases = None

    try:
        upcomingwork = UpcomingWork.objects.get(user=currentuser, number=1)
    except UpcomingWork.DoesNotExist:
        upcomingwork = None

    if profile:
        print(profile.skill1, profile.skill2)

    return render_to_response('week1/home.html', {'user':currentuser, 'profile':profile, 'hatsusers':hatsusers, 'users':users, 'showcases':showcases, 'upcoming':upcomingwork, 'nodejs_url':nodejs_url, 'media_url':media_url})

@login_required
def project_management(request):
    media_url = settings.MEDIA_URL
    nodejs_url = settings.NODEJS_SOCKET_URL
    uid = request.user.id
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=uid)

    try:
        upcomingwork = UpcomingWork.objects.get(user=currentuser, number=1)
    except UpcomingWork.DoesNotExist:
        upcomingwork = None

    return render_to_response('week1/project_management.html', {'user':currentuser, 'upcoming':upcomingwork, 'nodejs_url':nodejs_url, 'media_url':media_url})


def signup_success(request):
    return render_to_response('week1/success_signup.html')

@login_required
def welcome(request):
    return render_to_response('week1/welcome.html')

@csrf_protect
@login_required
def step1(request):
    currentuser = User.objects.get(uid=request.user)
    num_result = Profile.objects.filter(user=currentuser).count()

    if num_result == 0:
        p = Profile.objects.create(user=currentuser)
        p.save()

    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == 'POST':
        form = Step1(request.POST, request.FILES, instance=instance, label_suffix="")
        if form.is_valid():
            step = form.save(commit=False)
            #step = form.save(commit=False)
            tags = request.POST.getlist('professiontags')

            tagls = []
            for tag in tags:
                lowtag = tag.capitalize()
                tagls.append(lowtag)
                try:
                    obj = Profession.objects.get(skill=lowtag)
                    obj.count += 1
                    obj.save()
                except Profession.DoesNotExist:
                    obj = Profession.objects.create(skill=lowtag, count=1)
                    obj.save()

            if len(tagls) != 5:
                for i in range(5-len(tagls)):
                    tagls.append("")

            step.profession1=tagls[0] 
            step.profession2=tagls[1] 
            step.profession3=tagls[2]
            step.profession4=tagls[3]
            step.profession5=tagls[4]

            step.save()

            nextform = Step2(label_suffix="", instance=instance)
            return HttpResponseRedirect('/week1/step2/', {'form': nextform})

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
    currentuser = User.objects.get(uid=request.user)
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
    currentuser = User.objects.get(uid=request.user)
    instance = get_object_or_404(Profile, user=currentuser)

    if request.method == 'POST':
        tags = request.POST.getlist('skilltags')

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
                    obj = Profession.objects.create(skill=lowtag, count=1)
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

            return HttpResponseRedirect('/week1/home/')
            #nextform = Step4(label_suffix="", instance=instance)
            #return HttpResponseRedirect('/week1/step4/', {'form': nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step3(label_suffix="", instance=instance)

    variables = RequestContext(request, {'form':form})

    return render_to_response('week1/step3.html', variables, )


@csrf_protect
@login_required
def show_feedback(request):
    query = request.GET.get('srch-term', None)
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    all_feedback = Feedback.objects.all()
    return render(request, 'week1/show_feedback.html', {'feedback':all_feedback})


@csrf_protect
@login_required
def feedback(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
    if request.method == "POST":
        form = FeedbackForm(request.POST, label_suffix="")

        if form.is_valid():
            form.save()

            profile = Profile.objects.get(user=currentuser)
            return HttpResponseRedirect('/week1/home/')

    else:
        form = FeedbackForm(label_suffix="")

    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/feedback.html', {'profile':usersprofile, 'form':form})

@csrf_protect
@login_required
def home_edit_personalinfo(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
    instance = get_object_or_404(Profile, user=currentuser)

    profile = Profile.objects.get(user=currentuser)
    if request.method == "POST":
        form = PersonalInfo(request.POST, request.FILES, instance=instance, label_suffix="")

        if form.is_valid():
            personal = form.save(commit=False)

            p_tags_ls = request.POST.getlist('professiontags')
            p_tags = p_tags_ls[0].split(",")

            p_tagls = []
            for tag in p_tags:
                lowtag = tag.capitalize()
                p_tagls.append(lowtag)

            if len(p_tagls) != 5:
                for i in range(5-len(p_tagls)):
                    p_tagls.append("")

            s_tags_ls = request.POST.getlist('skilltags')
            s_tags = s_tags_ls[0].split(",")
            s_tagls = []
            for tag in s_tags:
                lowtag = tag.capitalize()
                s_tagls.append(lowtag)

            if len(s_tagls) != 10:
                for i in range(10-len(s_tagls)):
                    s_tagls.append("")

            personal.profession1 = p_tagls[0]
            personal.profession2 = p_tagls[1] 
            personal.profession3 = p_tagls[2]
            personal.profession4 = p_tagls[3]
            personal.profession5 = p_tagls[4] 
            personal.skill1 = s_tagls[0]
            personal.skill2 = s_tagls[1]
            personal.skill3 = s_tagls[2]
            personal.skill4 = s_tagls[3]
            personal.skill5 = s_tagls[4]
            personal.skill6 = s_tagls[5] 
            personal.skill7 = s_tagls[6]
            personal.skill8 = s_tagls[7]
            personal.skill9 = s_tagls[8]
            personal.skill10 = s_tagls[9]

            personal.save()

            return HttpResponseRedirect('/week1/home/')

    else:
        form = PersonalInfo(instance=instance, label_suffix="")

    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit_personalinfo.html', {'profile':usersprofile, 'form':form})

@csrf_protect
@login_required
def home_edit_url(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
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
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == "POST":
        form = ProfessionForm(request.POST, instance=instance, label_suffix="")
        if form.is_valid():
            profession = form.save(commit=False)

            tags = request.POST.getlist('professiontags')

            tagls = []
            for tag in tags:
                lowtag = tag.capitalize()
                tagls.append(lowtag)
                try:
                    obj = Profession.objects.get(skill=lowtag)
                    obj.count += 1
                    obj.save()
                except Profession.DoesNotExist:
                    obj = Profession.objects.create(skill=lowtag, count=1)
                    obj.save()

            if len(tagls) != 5:
                for i in range(5-len(tagls)):
                    tagls.append("")

            profession.profession1 = tagls[0]
            profession.profession2 = tagls[1]
            profession.profession3 = tagls[2]
            profession.profession4 = tagls[3]
            profession.profession5 = tagls[4]

            profession.save()

            profile = Profile.objects.get(user=currentuser)
            return HttpResponseRedirect('/week1/home/')
        else:
            messages = []
            messages.append(form.errors)
            return render(request, 'week1/homeedit_profession.html', {'messages':messages, 'form':form})

    else:
        form = ProfessionForm(instance=instance, label_suffix="")

    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit_profession.html', {'profile':usersprofile, 'form':form})

@csrf_protect
@login_required
def home_edit_professionskills(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
    instance = get_object_or_404(Profile, user=currentuser)
    if request.method == 'POST':
        tags = request.POST.getlist('tags')

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
                    obj = Profession.objects.create(skill=lowtag, count=1)
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

            return HttpResponseRedirect('/week1/home/')
            #return render_to_response('week1/step5.html', {'form':nextform})

        else:
            messages = []
            messages.append(form.errors)
            variables = RequestContext(request, {'messages':messages, 'form':form})

    else:
        form = Step3(label_suffix="", instance=instance)

    usersprofile = Profile.objects.get(user=currentuser)
    return render(request, 'week1/homeedit_professionskills.html', {'profile':usersprofile, 'form':form})

@csrf_protect
@login_required
def home_edit_funfact(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
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
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
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
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
    instance = get_object_or_404(Showcase, user=currentuser, number=num)
    num_show = Showcase.objects.filter(user=currentuser).count()
    if request.method == 'POST':
        form = Step5(request.POST, request.FILES, instance=instance, label_suffix="")
        if form.is_valid():
            work = form.save(commit=False)
            tags_ls = request.POST.getlist('professiontags')
            tags = tags_ls[0].split(",")            

            tagls = []
            for tag in tags:
                lowtag = tag.capitalize()
                tagls.append(lowtag)
                try:
                    obj = Profession.objects.get(skill=lowtag)
                    obj.count += 1
                    obj.save()
                except Profession.DoesNotExist:
                    obj = Profession.objects.create(skill=lowtag, count=1)
                    obj.save()

            if len(tagls) != 5:
                for i in range(5-len(tagls)):
                    tagls.append("")

            work.role1 = tagls[0]
            work.role2 = tagls[1]
            work.role3 = tagls[2]
            work.role4 = tagls[3]
            work.role5 = tagls[4]

            ptags_ls = request.POST.getlist('projecttags')
            projecttags = ptags_ls[0].split(",")            

            tagls = []
            for tag in projecttags:
                lowtag = tag.capitalize()
                tagls.append(lowtag)
                try:
                    obj = Profession.objects.get(skill=lowtag)
                    obj.count += 1
                    obj.save()
                except Profession.DoesNotExist:
                    obj = Profession.objects.create(skill=lowtag, count=1)
                    obj.save()

            if len(tagls) != 10:
                for i in range(10-len(tagls)):
                    tagls.append("")

            work.tag1 = tagls[0]
            work.tag2 = tagls[1]
            work.tag3 = tagls[2]
            work.tag4 = tagls[3]
            work.tag5 = tagls[4]
            work.tag6 = tagls[5]
            work.tag7 = tagls[6]
            work.tag8 = tagls[7]
            work.tag9 = tagls[8]
            work.tag10 = tagls[9]

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
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
    num_show = Showcase.objects.filter(user=currentuser).count()
    if request.method == 'POST':
        form = Step5(request.POST, request.FILES, label_suffix="")
        if form.is_valid():
            work = form.save(commit=False)

            tags_ls = request.POST.getlist('professiontags')
            tags = tags_ls[0].split(",")            

            tagls = []
            for tag in tags:
                lowtag = tag.capitalize()
                tagls.append(lowtag)
                try:
                    obj = Profession.objects.get(skill=lowtag)
                    obj.count += 1
                    obj.save()
                except Profession.DoesNotExist:
                    obj = Profession.objects.create(skill=lowtag, count=1)
                    obj.save()

            if len(tagls) != 5:
                for i in range(5-len(tagls)):
                    tagls.append("")

            work.role1 = tagls[0]
            work.role2 = tagls[1]
            work.role3 = tagls[2]
            work.role4 = tagls[3]
            work.role5 = tagls[4]

            ptags_ls = request.POST.getlist('projecttags')
            projecttags = ptags_ls[0].split(",")            

            tagls = []
            for tag in projecttags:
                lowtag = tag.capitalize()
                tagls.append(lowtag)
                try:
                    obj = Profession.objects.get(skill=lowtag)
                    obj.count += 1
                    obj.save()
                except Profession.DoesNotExist:
                    obj = Profession.objects.create(skill=lowtag, count=1)
                    obj.save()

            if len(tagls) != 10:
                for i in range(10-len(tagls)):
                    tagls.append("")

            work.tag1 = tagls[0]
            work.tag2 = tagls[1]
            work.tag3 = tagls[2]
            work.tag4 = tagls[3]
            work.tag5 = tagls[4]
            work.tag6 = tagls[5]
            work.tag7 = tagls[6]
            work.tag8 = tagls[7]
            work.tag9 = tagls[8]
            work.tag10 = tagls[9]

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

@csrf_protect
def home_edit_upcoming(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
    num_result = UpcomingWork.objects.filter(user=currentuser, number=1).count()

    if num_result == 0:
        u = UpcomingWork.objects.create(user=currentuser, number=1)
        u.save()

    instance = get_object_or_404(UpcomingWork, user=currentuser, number=1)

    if request.method == 'POST':
        form = Step6(request.POST, request.FILES, instance=instance, label_suffix="")
        if form.is_valid():
            work = form.save(commit=False)

            ptags_ls = request.POST.getlist('professiontags')
            ptags = ptags_ls[0].split(",")            

            ptagls = []
            for tag in ptags:
                lowtag = tag.capitalize()
                ptagls.append(lowtag)
                try:
                    obj = Profession.objects.get(skill=lowtag)
                    obj.count += 1
                    obj.save()
                except Profession.DoesNotExist:
                    obj = Profession.objects.create(skill=lowtag, count=1)
                    obj.save()

            if len(ptagls) != 5:
                for i in range(5-len(ptagls)):
                    ptagls.append("")

            work.role1 = ptagls[0]
            work.role2 = ptagls[1]
            work.role3 = ptagls[2]
            work.role4 = ptagls[3]
            work.role5 = ptagls[4]

            ptags_ls = request.POST.getlist('skilltags')
            ptags = ptags_ls[0].split(",")            

            ptagls = []
            for tag in ptags:
                lowtag = tag.capitalize()
                ptagls.append(lowtag)

            if len(ptagls) != 10:
                for i in range(10-len(ptagls)):
                    ptagls.append("")

            work.tag1 = ptagls[0]
            work.tag2 = ptagls[1]
            work.tag3 = ptagls[2]
            work.tag4 = ptagls[3]
            work.tag5 = ptagls[4]
            work.tag6 = ptagls[5]
            work.tag7 = ptagls[6]
            work.tag8 = ptagls[7]
            work.tag9 = ptagls[8]
            work.tag10 = ptagls[9]

            work.number = 1
            #get_help = form.cleaned_data["get_help"]
            #if get_help == 1 or get_help == 2:
            #work.fund = form.cleaned_data["fund"]
            work.comment_help = form.cleaned_data["comment_help"]

            tags_ls = request.POST.getlist('collaboratorskilltags')
            tags = tags_ls[0].split(",") 

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

            ctags_ls = request.POST.getlist('collaboratortags')
            ctags = ctags_ls[0].split(",") 

            ctagls = []
            for tag in ctags:
                lowtag = tag.capitalize()
                ctagls.append(lowtag)
                try:
                    obj = Profession.objects.get(skill=lowtag)
                    obj.count += 1
                    obj.save()
                except Profession.DoesNotExist:
                    obj = Profession.objects.create(skill=lowtag, count=1)
                    obj.save()

            if len(ctagls) != 5:
                for i in range(5-len(ctagls)):
                    ctagls.append("")

            work.collaborator1 = ctagls[0]
            work.collaborator2 = ctagls[1]
            work.collaborator3 = ctagls[2]
            work.collaborator4 = ctagls[3]
            work.collaborator5 = ctagls[4]

            work.save()

            return HttpResponseRedirect('/week1/home/')

        else:
            messages = []
            messages.append(form.errors)
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
    return password_reset_confirm(request, template_name='week1/password_reset_confirm.html', uidb64=uidb64, token=token, set_password_form=ValidatingPasswordChangeForm, post_reset_redirect='/week1/')

@csrf_protect
def reset(request):
    message = []

    if request.method == 'POST':
        #form = ForgotPasswordForm(request.POST)
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            validemail = form.cleaned_data["email"]
            num_result = User.objects.filter(email=validemail).count()

            if num_result == 0:
                message.append("The email is not registered.")

            else:
                request.user = User.objects.get(email=validemail)
                password_reset(request, from_email='MatchHat.tmp@gmail.com', email_template_name='week1/password_reset_email.html', subject_template_name='week1/password_reset_subject.txt', template_name='week1/password_reset_form.html', post_reset_redirect='week1/reset_sent/')
                return render_to_response('week1/password_reset_email_sent.html')

    else:
        form = PasswordResetForm()

    variables = RequestContext(request, {'form':form, 'message':message})

    return render_to_response('week1/password_reset.html', variables, )

def reset_sent(request):
    return render_to_response('week1/password_reset_email_sent.html', request)

@login_required
def results_search(request, query):
    newquery = request.GET.get('srch-term', None)
    
    if newquery:
        return HttpResponseRedirect('/week1/search/results/'+newquery, {'query': newquery})

    nodejs_url = settings.NODEJS_SOCKET_URL
    t = loader.get_template('week1/results_friends.html')
    #temporary results
    try:
        foundusers = User.objects.filter( Q(first_name=query) | Q(last_name=query) ).exclude(id=request.user.id)
    except ObjectDoesNotExist:
        foundusers = None

    q = query.capitalize()
    try:
        foundskills = Profile.objects.filter( Q(skill1=q) | Q(skill2=q) | Q(skill3=q) | Q(skill4=q) | Q(skill5=q) | Q(skill6=q) | Q(skill7=q) | Q(skill8=q) | Q(skill9=q) | Q(skill10=q)).exclude(id=request.user.id)
    except ObjectDoesNotExist:
        foundskills = None

    currentuser = User.objects.get(uid=request.user)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'query':q, 'users':foundusers, 'skills':foundskills, 'nodejs_url':nodejs_url, 'profile':profile})
    return render_to_response('week1/results_friends.html', variables, )
    #return HttpResponse(t.render(c))


@login_required
def talent_list(request, query):
    newquery = request.GET.get('srch-term', None)
    
    if newquery:
        return HttpResponseRedirect('/week1/search/results/'+newquery, {'query': newquery})

    media_url = settings.MEDIA_URL
    nodejs_url = settings.NODEJS_SOCKET_URL
    #temporary results

    currentuser = User.objects.get(uid=request.user)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'query':query, 'nodejs_url':nodejs_url, 'media_url':media_url, 'profile':profile})
    return render_to_response('week1/talent_list.html', variables, )
    #return HttpResponse(t.render(c))

@login_required
def hatsoff_list(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
    profile = Profile.objects.get(user=currentuser)

    allusers = list(User.objects.all())
    users = []
    userphoto = []
    for u in allusers:
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
        except Profile.DoesNotExist:
            prof = None

        if prof != None:
            users.append(u.id)
            userphoto.append(unicode(prof))

    media_url = settings.MEDIA_URL
    nodejs_url = settings.NODEJS_SOCKET_URL

    variables = RequestContext(request, {'profile':profile, 'user':currentuser, 'users':users, 'userphoto':userphoto, 'media_url':media_url, 'nodejs_url':nodejs_url})

    return render_to_response('week1/hatsoff_list.html', variables, )

@login_required
def thanks_list(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
    profile = Profile.objects.get(user=currentuser)

    allusers = list(User.objects.all())
    users = []
    userphoto = []
    for u in allusers:
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
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
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
    profile = Profile.objects.get(user=currentuser)

    allusers = list(User.objects.all())
    users = []
    userphoto = []
    for u in allusers:
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
        except Profile.DoesNotExist:
            prof = None

        if prof != None:
            users.append(u.id)
            userphoto.append(unicode(prof))

    media_url = settings.MEDIA_URL
    nodejs_url = settings.NODEJS_SOCKET_URL

    variables = RequestContext(request, {'profile':profile, 'user':currentuser, 'users':users, 'userphoto':userphoto, 'media_url':media_url, 'nodejs_url':nodejs_url})
    return render_to_response('week1/follow_list.html', variables, )

"""
@login_required
def hatsoff_list(request):
    query = request.GET.get('srch-term', None)
    
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
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL
    myid = request.user.id

    allusers = list(User.objects.all())

    users = []
    usernames = []
    userphoto = []
    for u in allusers:
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
        except Profile.DoesNotExist:
            prof = "None"

        usernames.append([u.first_name, u.last_name])
        users.append(u.uid)

    currentuser = User.objects.get(uid=request.user)
    profile = Profile.objects.get(user=currentuser)
    media_url = settings.MEDIA_URL
    variables = RequestContext(request, {'users':users, 'username':usernames, 'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile})
    return render_to_response('week1/message.html', variables, )

@login_required
def private_message(request, uid):
    nodejs_url = settings.NODEJS_SOCKET_URL
    user = User.objects.get(uid=request.user)
    myid = request.user
    variables = RequestContext(request, {'chatuser':user, 'myid':myid, 'nodejs_url':nodejs_url})
    return render_to_response('week1/private_message.html', variables, )

@login_required
def get_profile(request, uid):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL
    media_url = settings.MEDIA_URL
    user = User.objects.get(uid=uid)
    target_profile = Profile.objects.get(user=user)

    hatlist1 = Hatsoff.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=uid, actionuser=2, status=0) | Q(user_one_id=uid, status=1))
    hatlist2 = Hatsoff.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=uid, actionuser=1, status=0) | Q(user_two_id=uid, status=1))
    hatlist = list(chain(hatlist1, hatlist2))

    users = User.objects.filter(id__in=hatlist)
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
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
        except Profile.DoesNotExist:
            prof = None

        if prof != None:
            users.append(u.id)
            userphoto.append(unicode(prof))

    variables = RequestContext(request, {'t_profile':target_profile, 'profile':profile, 'uid':uid, 'hatsusers':hatsusers, 't_user':user, 'showcases':showcases, 'upcoming':upcomingwork, 'userphoto':userphoto, 'users':users, 'nodejs_url':nodejs_url, 'media_url':media_url})
    return render_to_response('week1/userpage.html', variables, )

@login_required
def community(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL
    media_url = settings.MEDIA_URL

    allusers = list(User.objects.all())

    users = []
    usernames = []
    for u in allusers:
        usernames.append([u.first_name, u.last_name])
        users.append(u.uid)

    """
    uid = request.user.id
    folderlist1 = FavoriteFolder.objects.values_list('user_two_id', flat=True).filter(Q(user_one_id=uid, actionuser=1, status=0) | Q(user_one_id=uid, status=1))
    folderlist2 = FavoriteFolder.objects.values_list('user_one_id', flat=True).filter(Q(user_two_id=uid, actionuser=2, status=0) | Q(user_two_id=uid, status=1))
    folderlist = list(chain(folderlist1, folderlist2))

    fusers = User.objects.filter(id__in=folderlist)
    userlist = list(fusers)
    folderusers = Profile.objects.filter(user__in=userlist)
    """

    currentuser = User.objects.get(uid=request.user)

    variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'username':usernames, 'users':users})
    return render_to_response('week1/community.html', variables, )

@login_required
def community_members(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL
    media_url = settings.MEDIA_URL

    currentuser = User.objects.get(uid=request.user)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile })
    return render_to_response('week1/community_members.html', variables, )

@login_required
def community_needyou(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL
    media_url = settings.MEDIA_URL

    allusers = list(User.objects.all())

    users = []
    userphoto = []
    for u in allusers:
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
        except Profile.DoesNotExist:
            prof = None

        if prof != None:
            users.append(u.id)
            userphoto.append(unicode(prof))

    uid = request.user.id

    currentuser = User.objects.get(uid=request.user)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile, 'userphoto':userphoto, 'users':users})
    return render_to_response('week1/community_needyou.html', variables, )

@login_required
def collaborators_you_need(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL
    media_url = settings.MEDIA_URL

    allusers = list(User.objects.all())

    users = []
    userphoto = []
    for u in allusers:
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
        except Profile.DoesNotExist:
            prof = None

        if prof != None:
            users.append(u.id)
            userphoto.append(unicode(prof))

    currentuser = User.objects.get(uid=request.user)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile, 'userphoto':userphoto, 'users':users})
    return render_to_response('week1/collaborators_you_need.html', variables, )

@login_required
def collaborators_need_you(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL
    media_url = settings.MEDIA_URL

    allusers = list(User.objects.all())

    users = []
    userphoto = []
    for u in allusers:
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
        except Profile.DoesNotExist:
            prof = None

        if prof != None:
            users.append(u.id)
            userphoto.append(unicode(prof))

    currentuser = User.objects.get(uid=request.user)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile, 'userphoto':userphoto, 'users':users})
    return render_to_response('week1/collaborators_need_you.html', variables, )

@login_required
def community_post(request):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    c_id = request.GET.get('c_id')

    tag = int(request.GET.get('tag'))

    auid = request.GET.get('u')

    nodejs_url = settings.NODEJS_SOCKET_URL
    media_url = settings.MEDIA_URL
    currentuser = User.objects.get(uid=request.user)
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
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL

    currentuser = User.objects.get(uid=request.user)
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
        except Profile.DoesNotExist:
            prof = "None"

        userphoto.append(unicode(prof))

    variables = RequestContext(request, {'nodejs_url':nodejs_url, 'profile':profile, 'users':users, 'usernames':usernames, 'userphoto':userphoto})
    return render_to_response('week1/notification.html', variables, )

@login_required
def folder(request):
    uid = request.user.id
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    nodejs_url = settings.NODEJS_SOCKET_URL
    media_url = settings.MEDIA_URL

    currentuser = User.objects.get(uid=request.user)
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
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
        except Profile.DoesNotExist:
            prof = None

        if prof != None:
            users.append(u.id)
            userphoto.append(unicode(prof))


    variables = RequestContext(request, {'media_url':media_url, 'nodejs_url':nodejs_url, 'profile':profile, 'folderusers':folderusers, 'users':users, 'userphoto':userphoto})
    return render_to_response('week1/folder.html', variables, )

@login_required
def add_folder(request, user2):
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

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

    users = User.objects.filter(id__in=folderlist)

    currentuser = User.objects.get(uid=request.user)
    profile = Profile.objects.get(user=currentuser)

    variables = RequestContext(request, {'users':users, 'profile':profile})
    return render_to_response('week1/add_folder.html', variables, )

@csrf_protect
@login_required
def historyboard(request):
    media_url = settings.MEDIA_URL
    nodejs_url = settings.NODEJS_SOCKET_URL
    uid = request.user.id
    query = request.GET.get('srch-term', None)
    
    if query:
        return HttpResponseRedirect('/week1/search/results/'+query, {'query': query})

    currentuser = User.objects.get(uid=request.user)
    num_result = Profile.objects.filter(user=currentuser).count()
    if num_result == 0:
        p = Profile.objects.create(user=currentuser)
        p.save()

    allusers = list(User.objects.all())
    users = []
    userphoto = []
    for u in allusers:
        try:
            prof = Profile.objects.values_list('photo', flat=True).get(user=u)
        except Profile.DoesNotExist:
            prof = None

        if prof != None:
            users.append(u.id)
            userphoto.append(unicode(prof))

    return render_to_response('week1/historyboard.html', {'user':currentuser, 'users':users, 'userphoto':userphoto, 'nodejs_url':nodejs_url, 'media_url':media_url})

