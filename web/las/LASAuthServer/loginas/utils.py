import logging

from django.conf import settings as django_settings
from django.contrib.auth import load_backend, login, logout
from django.contrib.auth.models import update_last_login
from django.contrib.auth.signals import user_logged_in
from django.contrib import messages
from django.core.signing import TimestampSigner, SignatureExpired
from datetime import timedelta
from django.contrib.auth.models import User

from . import config as la_settings

import loginmanager.views

signer = TimestampSigner()
logger = logging.getLogger(__name__)
username_field = "username"


def login_as(user, request, store_original_user=True):
    """
    Utility function for forcing a login as specific user -- be careful about
    calling this carelessly :)
    """
    
    # Logout from other las modules. Reason: if we don't, and the user has already opened a module
    # once the new user is logged in, the module won't switch to the new user since the previous session
    # is still open and valid (so it won't even go to the lasauthserver to check if the current user is logged in)
    loginmanager.views.logoutFromLASModules(request)

    # Save the original user pk before it is replaced in the login method
    original_user_pk = request.user.pk
    if store_original_user == False:
        logout(request)

    # Find a suitable backend.
    if not hasattr(user, 'backend'):
        for backend in django_settings.AUTHENTICATION_BACKENDS:
            if user == load_backend(backend).get_user(user.pk):
                user.backend = backend
                break

    # Log the user in.
    if hasattr(user, 'backend'):
        signal_was_connected = False
        if not la_settings.UPDATE_LAST_LOGIN:
            # Prevent update of user last_login
            signal_was_connected = user_logged_in.disconnect(update_last_login)

        try:
            # Actually log user in
            login(request, user)
        finally:
            # Restore signal if needed
            if signal_was_connected:
                user_logged_in.connect(update_last_login)
    else:
        return

    # Set a flag on the session
    if store_original_user:
        messages.warning(request, la_settings.MESSAGE_LOGIN_SWITCH.format(username=user.__dict__[username_field]),
                         extra_tags=la_settings.MESSAGE_EXTRA_TAGS)
        request.session[la_settings.USER_SESSION_FLAG] = signer.sign(original_user_pk)


def restore_original_login(request):
    """
    Restore an original login session, checking the signed session
    """
    original_session = request.session.get(la_settings.USER_SESSION_FLAG)

    if not original_session:
        return

    try:
        original_user_pk = signer.unsign(
            original_session,
            max_age=timedelta(days=la_settings.USER_SESSION_DAYS_TIMESTAMP).total_seconds()
        )
        print "original user pk =", original_user_pk
        user = User.objects.get(pk=original_user_pk)
        messages.info(request, la_settings.MESSAGE_LOGIN_REVERT.format(username=user.__dict__[username_field]),
                      extra_tags=la_settings.MESSAGE_EXTRA_TAGS)
        login_as(user, request, store_original_user=False)
        if la_settings.USER_SESSION_FLAG in request.session:
            del request.session[la_settings.USER_SESSION_FLAG]
    except SignatureExpired:
        pass

def existsPreviousUser(request):
    return (request.session.get(la_settings.USER_SESSION_FLAG) is not None)
