# Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Fieldofstudy(Document):

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

