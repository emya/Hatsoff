from django import forms
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _

from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth import authenticate

from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

from django.forms import extras
from .models import Profile, Showcase, UpcomingWork

class RegistrationForm(forms.Form):
    username = forms.EmailField(widget=forms.TextInput(attrs=dict(required=True, max_length=100, placeholder=" Email")), label=_("Email address"), label_suffix="")
    first_name = forms.RegexField(regex=r'^[a-zA-Z]+$', widget=forms.TextInput(attrs=dict(required=True, max_length=100, placeholder=" First name")), label=_("First Name"), label_suffix="", error_messages={'invalid': _("This value must contain only letters.") })
    last_name = forms.RegexField(regex=r'^[a-zA-Z]+$', widget=forms.TextInput(attrs=dict(required=True, max_length=100, placeholder=" Last name")), label=_("Last Name"), label_suffix="", error_messages={'invalid': _("This value must contain only letters.") })
    password1 = forms.CharField(widget=forms.PasswordInput(attrs=dict(required=True, max_length=30, render_value=False, placeholder=" Password")), label=_("Password"), label_suffix="")
    password2 = forms.CharField(widget=forms.PasswordInput(attrs=dict(required=True, max_length=30, render_value=False, placeholder=" Confirm Password")), label=_("Password again"), label_suffix="")

    def clean(self):
        MIN_LENGTH = 8
        MIN_NUMBER = 2
        username = self.cleaned_data.get('username')
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
                password1 = self.cleaned_data['password1'] 
                password2 = self.cleaned_data['password2'] 
                if len(password1) < MIN_LENGTH:
                    raise forms.ValidationError(_("The new password must be at least %d characters long." % MIN_LENGTH))
                if sum(p.isdigit() for p in password1) < MIN_NUMBER:
                    raise forms.ValidationError(_("The new password must include at least %d numbers." % MIN_NUMBER))
                if password1 != password2:
                    raise forms.ValidationError(_("The two passwords did not match."))
            return self.cleaned_data
        raise forms.ValidationError(_("The email already exists, Please log in with the email or try another one"))

class LoginForm(forms.Form):
    username = forms.EmailField(widget=forms.TextInput(attrs=dict(required=True, max_length=100, placeholder=" Email")), label=_("Email address"))
    password = forms.CharField(widget=forms.PasswordInput(attrs=dict(required=True, max_length=30, render_value=False, placeholder=" Password")), label=_("Password"))
    def clean(self):
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')

        try:
            userexist = User.objects.get(username=username)
            user = authenticate(username=username, password=password)
            if not user or not user.is_active:
                raise forms.ValidationError("Sorry, that login was invalid. Please try again.")
        except User.DoesNotExist:
            raise forms.ValidationError("Sorry, Your email is not registered. Please sign up.")
        return self.cleaned_data

    def login(self, request):
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        user = authenticate(username=username, password=password)
        return user

class Step1(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('photo', 'profession1', 'profession2', 'profession3', 'profession4', 'profession5', 'worksAt', 'city', 'education', 'birthyear', 'birthdate', 'language', 'fQuote', 'fFilm', 'fBook', 'filmNow', 'hobby', 'cities')
        labels = {
            'profession1': _('Profession (up to 5)'),
            'worksAt': _('Independent/Company name'),
            'city': _('City'),
            'education': _('Education (School and degree)'),
            'language': _('Language(s)'),
            'birthdate': _('Birthdate'),
            'photo': _('Add profile photo'),
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        return cleaned_data

class Step2(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('describe',)
        widgets = {
            'describe': forms.Textarea(attrs={'cols': 60, 'rows': 5}),
        }
        labels = {
            'describe': _('Describe yourself, your career, your interests (80 characters)'),
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        return cleaned_data

class Step3(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('skill1', 'skill2', 'skill3', 'skill4', 'skill5', 'skill6', 'skill7', 'skill8', 'skill9', 'skill10')
        widgets = {
        }
        labels = {
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        return cleaned_data

class Step4(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('weburl',)
        widgets = {
        }
        labels = {
            'weburl': _('Web URL'),
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        if 'weburl' in cleaned_data:
            url = cleaned_data.get('weburl')
            print (url)
            if url != "" and (not (url.startswith('http://'))):
                url = 'http://' + url
                cleaned_data['weburl'] = url
                
                if url:
                    validate = URLValidator()
                    try:
                        validate(url)
                    except ValidationError, e:
                        raise forms.ValidationError("Sorry, that login was invalid. Please try again.")
        return cleaned_data

class Step5(forms.ModelForm):
    class Meta:
        model = Showcase
        fields = ('title', 'image', 'video', 'youtube', 'describe', 'role1', 'role2', 'role3', 'role4', 'role5','completion')
        widgets = {
        }
        labels = {
            'title': _('Title'),
            'image': _('Add Photo'),
            'video': _('Add Video (mp4)'),
            'youtube': _('Add URL link to Youtube'),
            'describe': _('Describe your work'),
            'role1': _('Your Role'),
            'completion': _('Year of completion'),
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        if 'youtube' in cleaned_data:
            youtube = cleaned_data.get('youtube') 
            if youtube !="" and "www.youtube.com" in youtube:
                if "watch?v=" in youtube:
                    embedyoutube = youtube.replace("watch?v=", "embed/")
                    cleaned_data['youtube'] = embedyoutube
            else:
                raise forms.ValidationError(_("Please enter a valid youtube URL."))

        return cleaned_data
        """ 
        if 'video' in self.cleaned_data:
            video = self.cleaned_data['video'] 
            if video and not video.name.endswith('.mp4'):
                raise forms.ValidationError(_("Please choose mp4 file."))
        """
        

class Step6(forms.ModelForm):
    class Meta:
        model = UpcomingWork
        fields = ('title', 'image', 'describe', 'role1', 'role2', 'role3', 'role4', 'role5', 'status', 'targetstartdate', 'targetfinishdate', 'comment', 'get_help', 'collaborator1', 'collaborator2', 'collaborator3', 'collaborator4', 'collaborator5', 'fund', 'comment_help', 'preferred_city', 'often', 'time_commitment', 'give_back', 'collaborator_skill1', 'collaborator_skill2', 'collaborator_skill3', 'collaborator_skill4', 'collaborator_skill5', 'collaborator_skill6', 'collaborator_skill7', 'collaborator_skill8', 'collaborator_skill9', 'collaborator_skill10')
        widgets = {
        }
        labels = {
            'title': _('Title'),
            'image': _('Add Photo'),
            'describe': _('Describe your work'),
            'role1': _('Your Role'),
            'status': _('Status of work (for eg: entering post-production phase)'),
            'targetstartdate': _('Start date'),
            'targetfinishdate': _('End date'),
            'Additional info?': _('Comment'),
            'often': _('How often would you like to work with your collaborator?  (eg. 3 hours per week)'),
            'collaborator1': _('What kind of collaborators are you seeking? (eg. Video editor)'),
            'fund': _('Do you need to raise funds? If so how much and for what?'),
            'comment_help': _('Comments'),
            'preferred_city': _('Preferred city location of collaborator?'),
            'time_commitment': _('Time commitment of project? (Dates, no. of hours per day etc)'),
            'give_back': _('How will you give back to your collaborator?'),
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        return cleaned_data

class Step7(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('collaborators', 'interestproject', 'explore', 'availableHours', 'rate', 'fQuote', 'fFilm', 'fBook', 'filmNow', 'hobby', 'cities')
        labels = {
            'collaborators': _('Collaborators you may want to collaborate with (eg. scientists)'),
            'interestproject': _('Project type(s) or field(s) you want to explore (eg. Agriculture)'),
            'explore': _('Projects/ fields you may want to explore (eg. interior design)'),
            'availableHours': _('How many hours per week would you be available for a project of your choice?'),
            'rate': _('What is your rate? Would you be open to free collaboration?'),
            'hobby': _('Hobby'),
            'fQuote': _('Favorite quote(s)'),
            'fFilm': _('Favorite film/TV show/online show'),
            'fBook': _('Favorite book/author'),
            'filmNow': _('Book/Film/TV show you are reading/watching now'),
            'cities': _('Lived in other cities? if so where?'),
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        return cleaned_data

class ProfessionForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('profession1', 'profession2', 'profession3', 'profession4', 'profession5', 'describe',)
        widgets = {
            'describe': forms.Textarea(attrs={'cols': 60, 'rows': 5}),
        }
        labels = {
            'describe': _('Describe yourself'),
            'profession1': _('Profession (up to 5)'),
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        return cleaned_data

class ForgotPasswordForm(PasswordResetForm):
    email = forms.EmailField(required=True, max_length=254)
    class Meta:
        model = User
        fields = ("email")

class PersonalInfo(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('worksAt', 'city', 'education', 'language')
        labels = {
            'worksAt': _('Independent/Company name'),
            'city': _('City'),
            'education': _('Education (School and degree)'),
            'language': _('Language'),
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        return cleaned_data

class PersonalPhoto(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('photo',)
        labels = {
            'photo': _('Add profile photo'),
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        return cleaned_data
"""
class Funfact(forms.Form):
    funaboutyou = forms.CharField(max_length=200, required=False)
    hobby = forms.CharField(max_length=200, required=False)
    fQuote = forms.CharField(max_length=200, required=False)
    fFilm = forms.CharField(max_length=200, required=False)
    fTV = forms.CharField(max_length=200, required=False)
    fYoutube= forms.CharField(max_length=200, required=False)
    fBook= forms.CharField(max_length=200, required=False)

class PersonalPhoto(forms.Form):
    photo = forms.ImageField(required=False)
"""
