import frappe
from frappe.utils import cint
from frappe.query_builder import DocType

@frappe.whitelist()
def get_teaching_units(
	academic_year: str,
	faculty: str,
	filiere: str = None,
	niveau: str = None
):
	"""
	Retourne les Teaching Units selon le contexte sélectionné
	"""

	# =========================
	# Validation minimale
	# =========================
	if not academic_year or not faculty:
		frappe.throw("Année académique et faculté requises")

	# =========================
	# Récupération Teaching Units
	# =========================
	conditions = {
		"academic_year": academic_year,
		"docstatus": 0
	}

	teaching_units = frappe.get_all(
		"Teaching Unit",
		filters=conditions,
		fields=[
			"name",
			"course",
		]
	)

	if not teaching_units:
		return []

	results = []

	for tu in teaching_units:
		# =========================
		# Charger le document complet
		# =========================
		doc = frappe.get_doc("Teaching Unit", tu.name)

		# =========================
		# Filtrage par filière / niveau
		# =========================
		if filiere or niveau:
			match = False
			for cls in doc.course_levels:				
				if filiere and cls.filiere != filiere:
					# if filiere and cls.faculty != faculty:
					# 	continue
					continue
				if niveau and cls.niveau != niveau:
					continue
				match = True
				break

			if not match:
				continue

		# =========================
		# Infos cours
		# =========================
		course = frappe.get_doc("Course", doc.course)

		# =========================
		# Classes concernées
		# =========================
		classes = [
			# f"{c.filiere} {c.niveau.level}"
			# for c in doc.course_levels
		]
		for c in doc.course_levels:
			level = frappe.get_doc("Field of study Level", c.niveau)
			classes.append(f"{c.filiere} {level.level}")
		

		# =========================
		# Sections & enseignants
		# =========================
		sections = [
			{
				"type": s.type_de_cours,
				"teacher": s.enseignant
			}
			for s in doc.table_enseignant
		]

		results.append({
			"name": doc.name,
			"course": doc.course,
			"course_title": course.intitule,
			"course_code": course.code if hasattr(course, "code") else "",
			# "is_common": cint(doc.is_common),
			"classes": classes,
			"sections": sections
		})

	return results

def get_single_teaching_unit(cours,academic_year):
	print("Cours ",cours,academic_year)
	if not frappe.db.exists('Teaching Unit', { 'course': cours,"academic_year":academic_year }):
		frappe.throw("Unité d'enseignement introuvable")
	teaching_unit = frappe.get_doc("Teaching Unit",{"course":cours,"academic_year":academic_year})
	return teaching_unit

@frappe.whitelist()
def get_levels_for_field(field_of_study):
	doc = frappe.get_doc("Field of study", field_of_study)
	return [{"level":row.level,"name":row.name} for row in doc.field_of_study_level]

@frappe.whitelist()
def get_levels(doctype, txt, searchfield, start, page_len, filters):
	filiere = filters.get("parent")

	return frappe.db.sql("""
        SELECT
            CAST(name AS CHAR) AS value,
            CONCAT(level, ' - ', parent) AS label
        FROM `tabField of study Level`
        WHERE parent = %s
          AND level LIKE %s
        ORDER BY level
        LIMIT %s, %s
    """, (filiere, f"%{txt}%", start, page_len))