# Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import frappe



class Teacher(Document):
	
	def validate(self):
		new_full_name = f"{self.grade} {self.first_name} {self.last_name}".strip()
		if not self.is_new() and self.name!=new_full_name:
			self.set_onload('rename_needed',self.get_unique_target_name(new_full_name))
		
		for row in self.contrats:
			if row.signed_contract:
				if row.have_signed_contract != True:
					row.have_signed_contract = True
			else:
				if row.have_signed_contract == True:
					row.have_signed_contract = False
				
		
	def on_update(self):
		new_full_name = f"{self.grade} {self.first_name} {self.last_name}".strip()
		if not self.is_new() and self.name!=new_full_name:
			new_name = self.get_onload('rename_needed')
			frappe.rename_doc("Teacher",self.name,new_name,force=True)

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
		else:
			user = frappe.get_doc('User', self.email)
		self.user = user.name
		self.save(ignore_permissions = True)

	def get_unique_target_name(self,name):
		if not frappe.db.exists("Teacher",name):
			return name
		
		i = 1

		while frappe.db.exists("Teacher",f"{name} ({i})"):
			i +=1
		return f"{name} ({i})"


	def after_delete(self):
		if self.user and frappe.db.exists('User', self.user):
			frappe.delete_doc('User', self.user, ignore_permissions = True)

