# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
# This file is included in the final Docker image and SHOULD be overridden when
# deploying the image to prod. Settings configured here are intended for use in local
# development environments. Also note that superset_config_docker.py is imported
# as a final step as a means to override "defaults" configured here
#

import logging
import os

from cachelib.file import FileSystemCache

logger = logging.getLogger()


def get_env_variable(var_name, default=None):
    """Get the environment variable or raise exception."""
    try:
        return os.environ[var_name]
    except KeyError:
        if default is not None:
            return default
        else:
            error_msg = "The environment variable {} was missing, abort...".format(
                var_name
            )
            raise EnvironmentError(error_msg)


DATABASE_DIALECT = get_env_variable("DATABASE_DIALECT")
DATABASE_USER = get_env_variable("DATABASE_USER")
DATABASE_PASSWORD = get_env_variable("DATABASE_PASSWORD")
DATABASE_HOST = get_env_variable("DATABASE_HOST")
DATABASE_PORT = get_env_variable("DATABASE_PORT")
DATABASE_DB = get_env_variable("DATABASE_DB")

# The SQLAlchemy connection string.
SQLALCHEMY_DATABASE_URI = "%s://%s:%s@%s:%s/%s" % (
    DATABASE_DIALECT,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_DB,
)

REDIS_HOST = get_env_variable("REDIS_HOST")
REDIS_PORT = get_env_variable("REDIS_PORT")
REDIS_CELERY_DB = get_env_variable("REDIS_CELERY_DB", 0)
REDIS_RESULTS_DB = get_env_variable("REDIS_CELERY_DB", 1)

# Enable Celery worker
from celery.task.schedules import crontab
# RESULTS_BACKEND = FileSystemCache("/app/superset_home/sqllab") //V1.0.1

class CeleryConfig(object):
    BROKER_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_CELERY_DB}"
    CELERY_IMPORTS = (
        'superset.sql_lab',
        'superset.tasks',
    )
    CELERY_RESULT_BACKEND = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_RESULTS_DB}"
    CELERYD_LOG_LEVEL = 'DEBUG'
    CELERYD_PREFETCH_MULTIPLIER = 10
    CELERY_ACKS_LATE = True
    CELERY_ANNOTATIONS = {
        'sql_lab.get_sql_results': {
            'rate_limit': '10/s',
        },
        'email_reports.send': {
            'rate_limit': '1/s',
            'time_limit': 120,
            'soft_time_limit': 150,
            'ignore_result': True,
        },
    }
    CELERY_TASK_PROTOCOL = 1
    CELERYBEAT_SCHEDULE = {
        'email_reports.schedule_hourly': {
            'task': 'email_reports.schedule_hourly',
            'schedule': crontab(minute='1', hour='*'),
        },
        'cache-warmup-hourly': {
            'task': 'cache-warmup',
            'schedule': crontab(minute=0, hour='*'),  # hourly
            'kwargs': {
                'strategy_name': 'top_n_dashboards',
                'top_n': 5,
                'since': '7 days ago',
            },
        },
    }

from cachelib.redis import RedisCache
RESULTS_BACKEND = RedisCache(
    host=get_env_variable("REDIS_HOST"), port=get_env_variable("REDIS_PORT"), key_prefix='superset_results')

CELERY_CONFIG = CeleryConfig
SQLLAB_CTAS_NO_LIMIT = True

#
# Optionally import superset_config_docker.py (which will have been included on
# the PYTHONPATH) in order to allow for local settings to be overridden
#
try:
    import superset_config_docker
    from superset_config_docker import *  # noqa

    logger.info(
        f"Loaded your Docker configuration at " f"[{superset_config_docker.__file__}]"
    )
except ImportError:
    logger.info("Using default Docker config...")

ENABLE_PROXY_FIX = True

from flask_appbuilder.security.manager import AUTH_OID, AUTH_REMOTE_USER, AUTH_DB, AUTH_LDAP, AUTH_OAUTH

AUTH_TYPE = AUTH_OAUTH
OAUTH_PROVIDERS = [
    {
        'name':'Wistron Azure AD',
        'token_key':'access_token',                                                     # Name of the token in the response of access_token_url
        'icon':'fa-windows',                                                            # Icon for the provider
        'remote_app': {
            'client_id': get_env_variable("AZURE_APPLICATION_ID"),                        # Client Id (Identify Superset application)
            'client_secret': get_env_variable("AZURE_APPLICATION_SECRET"),                # Secret for this Client Id (Identify Superset application)
            'api_base_url': 'https://graph.microsoft.com/',
            'client_kwargs': {
                'scope': 'openid offline_access https://graph.microsoft.com/mail.read',
                'resource': get_env_variable("AZURE_APPLICATION_ID"),
            },
            'request_token_url': None,
            'access_token_url':'https://login.microsoftonline.com/{}/oauth2/v2.0/token'.format(get_env_variable("AZURE_TENANT_ID")),
            'authorize_url':'https://login.microsoftonline.com/{}/oauth2/v2.0/authorize'.format(get_env_variable("AZURE_TENANT_ID"))
        }
    }
]

# Will allow user self registration, allowing to create Flask users from Authorized User
AUTH_USER_REGISTRATION = True

# The default user self registration role
AUTH_ROLE_PUBLIC = 'Beta'
AUTH_USER_REGISTRATION_ROLE = 'Beta'

from custom_sso_security_manager import CustomSsoSecurityManager
CUSTOM_SECURITY_MANAGER = CustomSsoSecurityManager

# Enable redis session store
from redis import Redis
SESSION_TYPE = 'redis'
PERMANENT_SESSION_LIFETIME = int(get_env_variable("PERMANENT_SESSION_LIFETIME"))
SESSION_REDIS = Redis(host=get_env_variable("SESSION_REDIS_HOST"), port=get_env_variable("SESSION_REDIS_PORT"), db=get_env_variable("SESSION_REDIS_DB_NUMBER"))

# Change Cache type
CACHE_CONFIG = {
    'CACHE_TYPE': 'redis',
    'CACHE_DEFAULT_TIMEOUT': 60 * 60 * 24, # 1 day default (in secs)
    'CACHE_KEY_PREFIX': 'superset_results',
    'CACHE_REDIS_URL': "redis://%s:%s/0" % (get_env_variable("REDIS_HOST"), get_env_variable("REDIS_PORT")),
}

# Enable iframe
SESSION_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SECURE = True
ENABLE_CORS = True

# Disable csrf expire
WTF_CSRF_TIME_LIMIT = None

# Add endpoints that need to be exempt from CSRF protection
WTF_CSRF_EXEMPT_LIST = ["superset.views.core.log", "superset.charts.api.data", "superset.views.core.explore_json", "superset.connectors.sqla.views.TableModelView"]
