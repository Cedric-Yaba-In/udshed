import frappe, json, os
import udshed.utils.time_utils as time_utils

def create_default_data():
    default_acadamic_year = time_utils.get_default_academic_year()
    create_default_period()

def create_default_period():
    if not frappe.db.exists("Planning Period",{"heure_de_debut":"08:00","heure_de_fin":"12:00"}):
        frappe.get_doc({
            "doctype":"Planning Period",
            "heure_de_debut":"08:00",
            "heure_de_fin":"12:00",
            "libelle":"Matin",
            "position":0
        }).insert(ignore_permissions=True)
    if not frappe.db.exists("Planning Period",{"heure_de_debut":"13:30","heure_de_fin":"16:45"}):
        frappe.get_doc({
            "doctype":"Planning Period",
            "heure_de_debut":"13:30",
            "heure_de_fin":"16:45",
            "libelle":"Soir",
            "position":1
        }).insert(ignore_permissions=True)

def load_json(doctype, path):
    if not os.path.exists(path):
        return

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not frappe.db.exists(doctype, data.get("name") or data.get("title")):
        doc = frappe.get_doc(data)
        doc.insert(ignore_permissions=True)

def load_workspace():
    path = os.path.join(
        frappe.get_app_path("udshed"),
        "udshed", "data", "workspaces", "udshed.json"
    )
    load_json("Workspace", path)

def load_sidebar():
    path = os.path.join(
        frappe.get_app_path("udshed"),
        "udshed", "data", "workspace_sidebar", "udshed_sidebar.json"
    )
    load_json("Workspace Sidebar", path)
    
def after_install():
    create_default_data()
    load_workspace()
    load_sidebar()