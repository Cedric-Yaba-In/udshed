# Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Fieldofstudy(Document):

	def before_save(self):
		old_doc = self.get_doc_before_save()
		# Si c'est une création, pas besoin de comparer
		if not old_doc:
			return

		old_rows = {row.name: row for row in old_doc.field_of_study_level}
		new_rows = {row.name: row for row in self.field_of_study_level}
		teacher_to_cordo_list = []

		# 🔹 Détection des suppressions
		# for row_name in old_rows:
		# 	if row_name not in new_rows and row_name not in teacher_to_cordo_list:
		# 		teacher_to_cordo_list.append(row_name)

		# 🔹 Détection des ajouts
		for row_name in new_rows:
			if row_name not in old_rows:
				new_row = new_rows[row_name]
				fieldname = "coordonateur"
				if new_row.get(fieldname) not in teacher_to_cordo_list:
					teacher_to_cordo_list.append(new_row.get(fieldname))
		
		# 🔹 Détection des modifications
		for row_name in new_rows:
			if row_name in old_rows:
				old_row = old_rows[row_name]
				new_row = new_rows[row_name]
				fieldname = "coordonateur"
				if old_row.get(fieldname) != new_row.get(fieldname) and new_row.get(fieldname) not in teacher_to_cordo_list:
					teacher_to_cordo_list.append(new_row.get(fieldname))

		# Ajout du role coordonateur aux enseignants concernés
		for teacher in teacher_to_cordo_list:
			t = frappe.get_doc("Teacher",teacher)
			t_user = frappe.get_doc("User", t.user)
			if not frappe.db.exists("Has Role", { "parent": t_user.email, "role": "Coordonateur" }):
				t_user.append("roles", {"role": "Coordonateur"})
				t_user.save()

		