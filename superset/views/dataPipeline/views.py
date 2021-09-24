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
# import json
import simplejson as json
from flask import g
from flask_appbuilder import expose, has_access
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_babel import lazy_gettext as _

from superset import app, db
from superset.models.slice import Slice
from superset.typing import FlaskResponse
from superset.views.base import (
    SupersetModelView,
    common_bootstrap_payload,
    )
from superset.views.utils import (
    bootstrap_user_data,
)
from superset.utils import core as utils
from superset.viz import BaseViz


class DataPipelineModelView(
    SupersetModelView
):  # pylint: disable=too-many-ancestors
    route_base = "/pipeline"
    datamodel = SQLAInterface(Slice)
    @expose("/create/")
    @has_access
    def create(self) -> FlaskResponse:
        # if not app.config["ENABLE_REACT_CRUD_VIEWS"]:
        #     return redirect("/pipeline/create")
        # list_template = "superset/pipeline.html"
        # return self.render_template("superset/pipeline.html")
        # return super().render_app_template()
        bootstrap_data = {
            "user": bootstrap_user_data(g.user, include_perms=True),
            # "dashboard_data": dashboard_data,
            # "datasources": datasources_payload,
            "common": common_bootstrap_payload(),
            # "editMode": edit_mode,
            # "urlParams": url_params,
        }
        return self.render_template(
            "superset/basic.html",
            entry="wisDOM",
            bootstrap_data=json.dumps(
                bootstrap_data, default=utils.pessimistic_json_iso_dttm_ser
            ),
        )
    @expose("/permission/")
    @has_access
    def permission(self) -> FlaskResponse:
        bootstrap_data = {
            "user": bootstrap_user_data(g.user),
            "common": common_bootstrap_payload(),
        }
        return self.render_template(
            "superset/basic.html",
            entry="tablePermission",
            bootstrap_data=json.dumps(
                bootstrap_data, default=utils.pessimistic_json_iso_dttm_ser
            ),
        )
    @expose("/workspace/")
    @has_access
    def workspace(self) -> FlaskResponse:
        bootstrap_data = {
            "user": bootstrap_user_data(g.user),
            "common": common_bootstrap_payload(),
        }
        return self.render_template(
            "superset/basic.html",
            entry="workspace",
            bootstrap_data=json.dumps(
                bootstrap_data, default=utils.pessimistic_json_iso_dttm_ser
            ),
        )
    @expose("/newworkspace/")
    @has_access
    def newworkspace(self) -> FlaskResponse:
        bootstrap_data = {
            "user": bootstrap_user_data(g.user),
            "common": common_bootstrap_payload(),
        }
        return self.render_template(
            "superset/basic.html",
            entry="newworkspace",
            bootstrap_data=json.dumps(
                bootstrap_data, default=utils.pessimistic_json_iso_dttm_ser
            ),
        )
    @expose("/outputs/")
    @has_access
    def outputsspace(self) -> FlaskResponse:
        bootstrap_data = {
            "user": bootstrap_user_data(g.user),
            "common": common_bootstrap_payload(),
        }
        return self.render_template(
            "superset/basic.html",
            entry="outputs",
            bootstrap_data=json.dumps(
                bootstrap_data, default=utils.pessimistic_json_iso_dttm_ser
            ),
        )
