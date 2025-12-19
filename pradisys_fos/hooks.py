app_name = "pradisys_fos"
app_title = "Pradisys FOS"
app_publisher = "ePradisys Technologies Pvt. Ltd."
app_description = "Pradisys FOS - Feet-on-Street field operations with day plans, collections, attendance, KYC and dashboards for financial services."
app_email = "pradisystechnologies@gmail.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "pradisys_fos",
# 		"logo": "/assets/pradisys_fos/logo.png",
# 		"title": "Pradisys FOS",
# 		"route": "/pradisys_fos",
# 		"has_permission": "pradisys_fos.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/pradisys_fos/css/pradisys_fos.css"
# app_include_js = "/assets/pradisys_fos/js/pradisys_fos.js"

# include js, css files in header of web template
# web_include_css = "/assets/pradisys_fos/css/pradisys_fos.css"
# web_include_js = "/assets/pradisys_fos/js/pradisys_fos.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "pradisys_fos/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "pradisys_fos/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "pradisys_fos.utils.jinja_methods",
# 	"filters": "pradisys_fos.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "pradisys_fos.install.before_install"
# after_install = "pradisys_fos.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "pradisys_fos.uninstall.before_uninstall"
# after_uninstall = "pradisys_fos.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "pradisys_fos.utils.before_app_install"
# after_app_install = "pradisys_fos.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "pradisys_fos.utils.before_app_uninstall"
# after_app_uninstall = "pradisys_fos.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "pradisys_fos.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"pradisys_fos.tasks.all"
# 	],
# 	"daily": [
# 		"pradisys_fos.tasks.daily"
# 	],
# 	"hourly": [
# 		"pradisys_fos.tasks.hourly"
# 	],
# 	"weekly": [
# 		"pradisys_fos.tasks.weekly"
# 	],
# 	"monthly": [
# 		"pradisys_fos.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "pradisys_fos.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "pradisys_fos.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "pradisys_fos.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["pradisys_fos.utils.before_request"]
# after_request = ["pradisys_fos.utils.after_request"]

# Job Events
# ----------
# before_job = ["pradisys_fos.utils.before_job"]
# after_job = ["pradisys_fos.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"pradisys_fos.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }



# -------------------------
# Fixtures (exported via: bench --site <site> export-fixtures)
# -------------------------

base_fixtures = [
    {"dt": "Custom Field", "filters": [["name", "like", "FOS%"]]},
    {"dt": "Property Setter", "filters": [["name", "like", "FOS%"]]},
    {"dt": "Client Script", "filters": [["name", "like", "FOS%"]]},
    {"dt": "Server Script", "filters": [["name", "like", "FOS%"]]},
]

fos_ui_fixtures = [
    {"dt": "Workspace", "filters": [["name", "=", "FOS"]]},
    {"dt": "Custom HTML Block", "filters": [["name", "=", "FOS-Custom Block"]]},

    # Use LIKE so '-' vs '–' dash mismatch doesn't break export
    {"dt": "Number Card", "filters": [["name", "like", "FOS%"]]},
    {"dt": "Dashboard Chart", "filters": [["name", "like", "FOS%"]]},
]

# ✅ Final fixtures used by Frappe
fixtures = base_fixtures + fos_ui_fixtures









override_doctype_class = {
    "FOS Cash Deposit": "pradisys_fos.fos.doctype.fos_cash_deposit.fos_cash_deposit.FOSCashDeposit",
    "FOS Collection": "pradisys_fos.fos.doctype.fos_collection.fos_collection.FOSCollection",
    "FOS Day Plan": "pradisys_fos.fos.doctype.fos_day_plan.fos_day_plan.FOSDayPlan",
    "FOS Case": "pradisys_fos.fos.doctype.fos_case.fos_case.FOSCase",
}


permission_query_conditions = {
    "FOS Case": "pradisys_fos.fos.permissions.fos_case.get_permission_query_conditions",
    "FOS Collection": "pradisys_fos.fos.permissions.fos_collection.get_permission_query_conditions",
}

has_permission = {
    "FOS Case": "pradisys_fos.fos.permissions.fos_case.has_permission",
    "FOS Collection": "pradisys_fos.fos.permissions.fos_collection.has_permission",
}


doctype_js = {
    "FOS Day Plan": "public/js/fos_day_plan.js",
    "FOS Attendance": "public/js/fos_attendance.js",
    "FOS Cash Deposit": "public/js/fos_cash_deposit.js",
    "FOS Day Plan Item": "public/js/fos_day_plan_item.js",  
    "FOS Case": "public/js/fos_case.js", 
}






