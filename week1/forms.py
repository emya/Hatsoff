from django import forms
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _

class RegistrationForm(forms.Form):
    username = forms.RegexField(regex=r'^\w+$', widget=forms.TextInput(attrs=dict(required=True, max_length=100)), label=_("Username"), error_messages={'invalid': _("This value must contain only letters, numbers and underscores.") })
    email = forms.EmailField(widget=forms.TextInput(attrs=dict(required=True, max_length=100)), label=_("Email address"))
    password1 = forms.CharField(widget=forms.PasswordInput(attrs=dict(required=True, max_length=30, render_value=False)), label=_("Password"))
    password2 = forms.CharField(widget=forms.PasswordInput(attrs=dict(required=True, max_length=30, render_value=False)), label=_("Password again"))
    
    def clean_username(self):
        try:
            user = User.objects.get(username__iexact=self.cleaned_data['username'])
        except User.DoesNotExist:
            return self.cleaned_data['username']
        raise forms.ValidationError(_("The Username already exists, Please try another one"))

    def clean(self):
        if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError(_("The two passwords did not match."))
        return self.cleaned_data

class ProfileForm(forms.Form):
    photo = forms.ImageField(required=False)
    fullname = forms.CharField(max_length=100, required=False)
    profile = forms.CharField(max_length=200, required=False)
    worksAt = forms.CharField(max_length=100, required=False)
    city = forms.CharField(max_length=100, required=False)
    education = forms.CharField(max_length=200, required=False)
    skills = forms.CharField(max_length=200, required=False)
    fQuote = forms.CharField(max_length=200, required=False)
    fFilmmaker = forms.CharField(max_length=100, required=False)
    fTvandYoutube = forms.CharField(max_length=100, required=False)
    fMillennial = forms.CharField(max_length=100, required=False)
    fBook = forms.CharField(max_length=100, required=False)
    showcase = forms.CharField(max_length=200, required=False)
