import frappe

import frappe

@frappe.whitelist()
def get_user_context():
	user = frappe.session.user

	# ADMIN
	if user == "Administrator" or "System Manager" in frappe.get_roles(user):
		return {
			"role": "Administrator",
			"lock_faculty": False,
			"lock_filiere": False,
			"lock_niveau": False,
			"can_create_course": True,
			"can_edit_course": True
		}

	# COORDINATEUR DE NIVEAU
	coord = frappe.db.get_value(
		"Field of study Level Coordinator",
		{"user": user},
		["faculty", "filiere", "niveau"],
		as_dict=True
	)

	if coord:
		return {
			"role": "Coordinator",
			"faculty": coord.faculty,
			"filiere": coord.filiere,
			"niveau": coord.niveau,
			"lock_faculty": True,
			"lock_filiere": True,
			"lock_niveau": True,
			"can_create_course": True,
			"can_edit_course": True
		}

	# ENSEIGNANT
	teacher = frappe.db.get_value(
		"Teacher",
		{"user": user},
		"name"
	)

	if teacher:
		return {
			"role": "Teacher",
			"lock_faculty": True,
			"lock_filiere": True,
			"lock_niveau": True,
			"can_create_course": False,
			"can_edit_course": False
		}

	# PAR DÉFAUT
	return {
		"role": "Guest",
		"can_create_course": False,
		"can_edit_course": False
	}



def get_field_of_study_and_levels_for_coordinator(user):
    list_of_fields_of_study = frappe.db.get_all('Field of study Level', filters={"coordinator": user.name}, fields=['field_of_study'])
    return {
        "fields_of_study": [field.field_of_study for field in list_of_fields_of_study],
        "levels": ["Licence 1", "Licence 2"]
    }

@frappe.whitelist()
def get_user_session_data():
    user = frappe.get_doc("User", frappe.session.user)
    roles = frappe.get_roles(user.name)

    if "Coordinateur " in roles:
        #role coordinateur, donc charger les filières et niveaux associés
        
        return get_field_of_study_and_levels_for_coordinator(user)

    if "Enseignant" in roles:
        #role enseignant, donc charger les cours associés
        pass

    if "System Manager" in roles or "Administrator" in roles:
        #role admin, donc tout charger
        pass