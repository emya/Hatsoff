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
    username = forms.EmailField(widget=forms.TextInput(attrs=dict(required=True, max_length=100)), label=_("Email address"), label_suffix="")
    first_name = forms.RegexField(regex=r'^[a-zA-Z]+$', widget=forms.TextInput(attrs=dict(required=True, max_length=100)), label=_("First Name"), label_suffix="", error_messages={'invalid': _("This value must contain only letters.") })
    last_name = forms.RegexField(regex=r'^[a-zA-Z]+$', widget=forms.TextInput(attrs=dict(required=True, max_length=100)), label=_("Last Name"), label_suffix="", error_messages={'invalid': _("This value must contain only letters.") })
    password1 = forms.CharField(widget=forms.PasswordInput(attrs=dict(required=True, max_length=30, render_value=False)), label=_("Password"), label_suffix="")
    password2 = forms.CharField(widget=forms.PasswordInput(attrs=dict(required=True, max_length=30, render_value=False)), label=_("Password again"), label_suffix="")

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
    username = forms.EmailField(widget=forms.TextInput(attrs=dict(required=True, max_length=100)), label=_("Email address"))
    password = forms.CharField(widget=forms.PasswordInput(attrs=dict(required=True, max_length=30, render_value=False)), label=_("Password"))
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
        fields = ('photo', 'profession', 'worksAt', 'city', 'education', 'birthyear', 'birthdate', 'language', 'fQuote', 'fFilm', 'fBook', 'filmNow', 'hobby', 'cities')
        labels = {
            'profession': _('Profession'),
            'worksAt': _('Independent/Company name'),
            'city': _('City'),
            'education': _('Education'),
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
            'describe': _('Describe yourself (your career, your interests) (2-3 lines)'),
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        return cleaned_data

class Step3(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('skill1', 'skill2', 'skill3')
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
        if 'weburl' in self.cleaned_data:
            weburl = self.cleaned_data['weburl']
            if weburl:
                validate = URLValidator()
                try:
                    validate(weburl)
                except ValidationError, e:
                    raise forms.ValidationError(_(e))
        return cleaned_data

class Step5(forms.ModelForm):
    class Meta:
        model = Showcase
        fields = ('title', 'image', 'video', 'youtube', 'describe', 'role', 'completion')
        widgets = {
        }
        labels = {
            'title': _('Title'),
            'image': _('Add Photo'),
            'video': _('Add Video'),
            'youtube': _('Add URL link to Youtube'),
            'describe': _('Descibe your work'),
            'role': _('Your Role'),
            'completion': _('Year of completion'),
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        if 'video' in self.cleaned_data:
            video = self.cleaned_data['video'] 
            if video and not video.name.endswith('.mp4'):
                raise forms.ValidationError(_("Please choose mp4 file."))
        return cleaned_data

class Step6(forms.ModelForm):
    class Meta:
        model = UpcomingWork
        fields = ('title', 'image', 'describe', 'role', 'status', 'targetdate', 'comment', 'get_help', 'collaborators', 'fund', 'comment_help')
        widgets = {
        }
        labels = {
            'title': _('Title'),
            'image': _('Add Photo'),
            'describe': _('Descibe your work'),
            'role': _('Your Role'),
            'status': _('Status of work (for eg: entering post-production phase)'),
            'targetdate': _('Target finish date'),
            'comment': _('Comment'),
            'collaborators': _('Collaborators'),
            'fund': _('Do you need to raise funds? If so how much and for what?'),
            'comment_help': _('Comments'),
        }
    def clean(self):
        cleaned_data = self.cleaned_data
        return cleaned_data

class Step7(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('collaborators', 'explore', 'availableHours', 'rate', 'fQuote', 'fFilm', 'fBook', 'filmNow', 'hobby', 'cities')
        labels = {
            'collaborators': _('Collaborators you may want to collaborate with (eg. scientists)'),
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
        fields = ('profession', 'describe',)
        widgets = {
            'describe': forms.Textarea(attrs={'cols': 60, 'rows': 5}),
        }
        labels = {
            'describe': _('Describe yourself'),
            'profession': _('Profession'),
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
        fields = ('worksAt', 'city', 'education', 'language', 'skill1', 'skill2', 'skill3')
        labels = {
            'worksAt': _('Independent/Company name'),
            'city': _('City'),
            'education': _('Education'),
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
