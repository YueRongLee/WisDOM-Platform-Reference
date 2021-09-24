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


class DatasetManagementModelView(
    SupersetModelView
):  # pylint: disable=too-many-ancestors
    route_base = "/setting"
    datamodel = SQLAInterface(Slice)
    @expose("/datasetManagement/")
    @has_access
    def create(self) -> FlaskResponse:
        bootstrap_data = {
            "user": bootstrap_user_data(g.user, include_perms=True),
            "common": common_bootstrap_payload(),
        }
        return self.render_template(
            "superset/basic.html",
            entry="datasetManagement",
            bootstrap_data=json.dumps(
                bootstrap_data, default=utils.pessimistic_json_iso_dttm_ser
            ),
        )
