import frappe
import udshed.utils.time_utils as time_utils


def after_install():
    create_default_data()

def create_default_data():
    default_acadamic_year = time_utils.get_default_academic_year()
    create_default_period()

def create_default_period():
    if not frappe.get_doc("Planning Period",{"heure_de_debut":"08:00","heure_de_fin":"12:00"}):
        frappe.get_doc({
            "doctype":"Planning Period",
            "heure_de_debut":"08:00",
            "heure_de_fin":"12:00",
            "libelle":"Matin"
        }).insert(ignore_permissions=True)
    if not frappe.get_doc("Planning Period",{"heure_de_debut":"13:30","heure_de_fin":"16:45"}):
        frappe.get_doc({
            "doctype":"Planning Period",
            "heure_de_debut":"13:30",
            "heure_de_fin":"16:45",
            "libelle":"Soir"
        }).insert(ignore_permissions=True)