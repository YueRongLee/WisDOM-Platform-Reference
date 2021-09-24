import os
import base64
import json
import logging
import re
import jwt
from superset.security import SupersetSecurityManager
from flask_appbuilder.security.views import AuthOAuthView
from flask import flash, g, redirect, request, url_for, session
from flask_appbuilder._compat import as_unicode
from flask_appbuilder import expose

logger = logging.getLogger()

class AuthOAuthView(AuthOAuthView):
  login_template = "appbuilder/general/security/login_oauth.html"

  @expose('/logout/')
  def logout(self):
   logger.debug("========logout========")
   logger.debug(g.user.is_authenticated)
   session.clear()
   super(AuthOAuthView, self).logout()    
   return redirect("https://login.microsoftonline.com/wistron.com/oauth2/logout" ) 

  @expose("/login/")
  @expose("/login/<provider>")
  @expose("/login/<provider>/<register>")
  def login(self, provider=None, register=None):
    logger.debug("Provider: {0}".format(provider))
    if g.user is not None and g.user.is_authenticated:
      logger.debug("Already authenticated {0}".format(g.user))
      return redirect(self.appbuilder.get_url_for_index)
    if provider is None:
      query_string = request.query_string.decode()
      if (not (query_string and not query_string.isspace())):
        return redirect("/login/Wistron Azure AD")
      else:
        return redirect("/login/Wistron Azure AD?{0}".format(query_string))
    else:
      logger.debug("Going to call authorize for: {0}".format(provider))
      state = jwt.encode(
        request.args.to_dict(flat=False),
        self.appbuilder.app.config["SECRET_KEY"],
        algorithm="HS256",
      )
      try:
        if register:
          logger.debug("Login to Register")
          session["register"] = True
        if provider == "twitter":
          return self.appbuilder.sm.oauth_remotes[
            provider
          ].authorize_redirect(
            redirect_uri=url_for(
              ".oauth_authorized",
              provider=provider,
              _external=True,
              state=state,
            )
          )
        else:
          return self.appbuilder.sm.oauth_remotes[
            provider
          ].authorize_redirect(
            redirect_uri=url_for(
              ".oauth_authorized", provider=provider, _external=True
            ),
            state=state.decode("ascii"),
          )
      except Exception as e:
        logger.error("Error on OAuth authorize: {0}".format(e))
        flash(as_unicode(self.invalid_login_message), "warning")
        return redirect(self.appbuilder.get_url_for_index)

class CustomSsoSecurityManager(SupersetSecurityManager):
  def __init__(self, appbuilder):
    super(CustomSsoSecurityManager, self).__init__(appbuilder)
    self.authoauthview = AuthOAuthView

  def oauth_user_info(self, provider, response=None):
    logging.debug("Oauth2 provider: {0}.".format(provider))
    if provider == 'Wistron Azure AD':
      logging.debug("Azure response received : {0}".format(response))
      access_token = response["access_token"]
      me = self._azure_jwt_token_parse(access_token)

      detailedProfile = self.appbuilder.sm.oauth_remotes[provider].get('beta/me').json()
      logging.debug("Detailed profile : {0}".format(detailedProfile))

      user_id = ''
      if user_id is not None:
        user_id = detailedProfile['mailNickname']

      me['user_id'] = user_id

      encode = jwt.encode(me, os.environ.get("SUPERSET_JWT_SECRET"), algorithm='HS512')
      logging.debug(encode)

      session['access_token'] = encode
      session['empl_id'] = user_id

      return {
        'name': me['name'],
        'email': me['upn'],
        'first_name': me['family_name'],
        'last_name': me['name'].split('/')[0],
        'id': me['oid'],
        # 'username': me['oid'],
        'username': user_id,
        'empl_id': user_id,
        'access_token': access_token,
      }

  def _azure_parse_jwt(self, access_token):
    jwt_token_parts = r"^([^\.\s]*)\.([^\.\s]+)\.([^\.\s]*)$"
    matches = re.search(jwt_token_parts, access_token)
    if not matches or len(matches.groups()) < 3:
        logging.error("Unable to parse token.")
        return {}
    return {
        "header": matches.group(1),
        "Payload": matches.group(2),
        "Sig": matches.group(3),
    }

  def _azure_jwt_token_parse(self, access_token):
    jwt_split_token = self._azure_parse_jwt(access_token)
    if not jwt_split_token:
        return

    jwt_payload = jwt_split_token["Payload"]
    # Prepare for base64 decoding
    payload_b64_string = jwt_payload
    payload_b64_string += "=" * (4 - ((len(jwt_payload) % 4)))
    decoded_payload = base64.urlsafe_b64decode(payload_b64_string)

    if not decoded_payload:
      logging.error("Payload of id_token could not be base64 url decoded.")
      return

    jwt_decoded_payload = json.loads(decoded_payload.decode("utf-8"))

    return jwt_decoded_payload
