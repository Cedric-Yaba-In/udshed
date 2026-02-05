# Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Fieldofstudy(Document):
	# def before_save(self):
	# 	for list_field_level in self.field_of_study_level:
	# 		if(not frappe.db.exists("Field of study Level", { "field_of_study": self.name, "level": list_field_level.level})):
	# 			print("Creating Field of study Level for ", list_field_level.level)
	# 			frappe.get_doc({
	# 				"doctype":"Field of study Level",
	# 				"field_of_study": self.name,
	# 				"level": list_field_level.level,
	# 				"parent": self.name,
	# 				"coordonateur": list_field_level.coordonateur,
	# 				"parentfield": "field_of_study_level",
	# 				"parenttype": "Field of study"
	# 			}).insert()

	def before_save(self):
		for list_field_level in self.field_of_study_level:
			# Vérifie si ce niveau existe déjà
			if not any(d.level == list_field_level.level for d in self.field_of_study_level):
				print("Creating Field of study Level for ", list_field_level.level)
				# Ajoute la ligne directement à la child table en mémoire
				self.append("field_of_study_level", {
					"level": list_field_level.level,
					"coordonateur": list_field_level.coordonateur,
					"field_of_study": self.name  # facultatif si tu as déjà parent/parentfield
				})


	def after_save(self):
		settings = frappe.get_single("Udshed Setting")
		if not settings.get("current_year"):
			frappe.throw("Current year not defined!")
		current_year = frappe.doc = frappe.get_doc('Academic Year', settings.get("current_year"))

		
		# for list_field_level in self.field_of_study_level:
		# 	planning_name = f"{self.field_of_study_code} {self.list_field_level}  {current_year.start_year}-{current_year.end_year}"
			
		# 	planning = frappe.get_doc ({
		# 		"doctype":"Planning",
				
		# 	})

