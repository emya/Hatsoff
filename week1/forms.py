from django import forms
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _

from django.contrib.auth.forms import PasswordResetForm

class RegistrationForm(forms.Form):
    username = forms.EmailField(widget=forms.TextInput(attrs=dict(required=True, max_length=100)), label=_("Email address"))
    first_name = forms.RegexField(regex=r'^[a-zA-Z]+$', widget=forms.TextInput(attrs=dict(required=True, max_length=100)), label=_("First Name"), error_messages={'invalid': _("This value must contain only letters.") })
    last_name = forms.RegexField(regex=r'^[a-zA-Z]+$', widget=forms.TextInput(attrs=dict(required=True, max_length=100)), label=_("Last Name"), error_messages={'invalid': _("This value must contain only letters.") })
    password1 = forms.CharField(widget=forms.PasswordInput(attrs=dict(required=True, max_length=30, render_value=False)), label=_("Password"))
    password2 = forms.CharField(widget=forms.PasswordInput(attrs=dict(required=True, max_length=30, render_value=False)), label=_("Password again"))

    def clean_email(self):
        try:
            user = User.objects.get(email__iexact=self.cleaned_data['email'])
        except User.DoesNotExist:
            return self.cleaned_data['username']
        raise forms.ValidationError(_("The email already exists, Please try another one"))

    def clean(self):
        if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError(_("The two passwords did not match."))
        return self.cleaned_data
    """ 
    def clean_username(self):
        try:
            user = User.objects.get(username__iexact=self.cleaned_data['username'])
        except User.DoesNotExist:
            return self.cleaned_data['username']
        raise forms.ValidationError(_("The Username already exists, Please try another one"))
    """

class ProfileForm(forms.Form):
    photo = forms.FileField(required=False)
    displayname = forms.CharField(max_length=100, required=False)
    profession = forms.CharField(max_length=200, required=True)
    worksAt = forms.CharField(max_length=100, required=False)
    city = forms.CharField(max_length=100, required=False)
    education = forms.CharField(max_length=200, required=False)
    birthdate = forms.DateField(required=False)
    language = forms.CharField(max_length=200, required=False)
    fQuote = forms.CharField(max_length=200, required=False)
    fFilm = forms.CharField(max_length=100, required=False)
    fTV = forms.CharField(max_length=100, required=False)
    fYoutube = forms.CharField(max_length=100, required=False)
    fBook = forms.CharField(max_length=100, required=False)
    bookNow = forms.CharField(max_length=200, required=False)
    filmNow = forms.CharField(max_length=200, required=False)
    TVNow = forms.CharField(max_length=200, required=False)
    hobby = forms.CharField(max_length=200, required=False)
    cities = forms.CharField(max_length=200, required=False)

class ForgotPasswordForm(PasswordResetForm):
    email = forms.EmailField(required=True, max_length=254)
    class Meta:
        model = User
        fields = ("email")

class Step1(forms.Form):
    displayname = forms.CharField(max_length=100, required=False, label=_("Display Name"))
    profession = forms.CharField(max_length=100, required=True)
    city = forms.CharField(max_length=100, required=False)
    worksAt = forms.CharField(max_length=100, required=False, label=_("Work At"))
    education = forms.CharField(max_length=100, required=False)
    birthdate = forms.DateField(required=False)
    language = forms.CharField(max_length=100, required=False)
    photo = forms.ImageField(required=False)

class Step2(forms.Form):
    describe = forms.CharField(max_length=500, required=False)

class Step3(forms.Form):
    skill1 = forms.CharField(max_length=200, required=False)
    skill2 = forms.CharField(max_length=200, required=False)
    skill3 = forms.CharField(max_length=200, required=False)
    skill4 = forms.CharField(max_length=200, required=False)
    skill5 = forms.CharField(max_length=200, required=False)
    skill6 = forms.CharField(max_length=200, required=False)
    skill7 = forms.CharField(max_length=200, required=False)
    skill8 = forms.CharField(max_length=200, required=False)
    skill9 = forms.CharField(max_length=200, required=False)
    skill10 = forms.CharField(max_length=200, required=False)

class Step4(forms.Form):
    weburl = forms.CharField(max_length=200, required=False)

class Step5(forms.Form):
    title = forms.CharField(max_length=200, required=False)
    image = forms.ImageField(required=False)
    describe = forms.CharField(max_length=500, required=False)
    role = forms.CharField(max_length=300, required=False)
    completion = forms.IntegerField(required=False)

class Step6(forms.Form):
    title = forms.CharField(max_length=200, required=False)
    image = forms.ImageField(required=False)
    describe = forms.CharField(max_length=500, required=False)
    role = forms.CharField(max_length=300, required=False)
    status = forms.CharField(max_length=300, required=False)
    targetdate = forms.DateField(required=False)
    comment = forms.CharField(max_length=300, required=False)

class Step7(forms.Form):
    funaboutyou = forms.CharField(max_length=200, required=False)
    hobby = forms.CharField(max_length=200, required=False)
    fQuote = forms.CharField(max_length=200, required=False)
    fFilm = forms.CharField(max_length=200, required=False)
    fTV = forms.CharField(max_length=200, required=False)
    fYoutube= forms.CharField(max_length=200, required=False)
    fBook = forms.CharField(max_length=200, required=False)
    bookNow = forms.CharField(max_length=200, required=False)
    filmNow = forms.CharField(max_length=200, required=False)
    TVNow = forms.CharField(max_length=200, required=False)
    cities = forms.CharField(max_length=200, required=False)

class PersonalInfo(forms.Form):
    city = forms.CharField(max_length=100, required=False)
    worksAt = forms.CharField(max_length=100, required=False, label=_("Work At"))
    education = forms.CharField(max_length=100, required=False)
    language = forms.CharField(max_length=100, required=False)
    skill1 = forms.CharField(max_length=200, required=False)
    skill2 = forms.CharField(max_length=200, required=False)

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
