# Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import frappe



class Teacher(Document):
	
	# @property
	# def full_name(self):
	# 	if not self.user:
	# 		return ""

	# 	first_name, last_name = frappe.db.get_value(
	# 		"User",
	# 		self.user,
	# 		["first_name", "last_name"]
	# 	) or ("", "")
	# 	return f"{first_name or ''} {last_name or ''}".strip()
	
	
	def after_insert(self):
		if not frappe.db.exists('User', self.email):
			user = frappe.get_doc({
				"doctype":'User',
				"email": self.email,
				"first_name": self.first_name,
				"last_name":self.last_name,
				"send_welcome_email":1,
				"roles": [
					{"role":"Teacher"}
				]
			})

			user.insert(
				ignore_permissions=True, # ignore write permissions during insert
			)
			self.user = user.name
			self.save(ignore_permissions = True)

	def after_delete(self):
		if self.user and frappe.db.exists('User', self.user):
			frappe.delete_doc('User', self.user, ignore_permissions = True)

