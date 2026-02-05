import frappe
import json
from datetime import date
from frappe.query_builder import DocType

def get_default_academic_year():
    default_academic_year =frappe.db.get_single_value('Academic Year', 'current_year')
    today = date.today()
    past_year = today.year
    current_year = today.year
    current_month = today.month
    if current_month >= 9:  # Si nous sommes en septembre ou après, l'année académique commence cette année
        current_year += 1
    else: 
        past_year -= 1  # Sinon, l'année académique a commencé l'année précédente

    if not default_academic_year:
        default_academic_year = frappe.get_doc({
            "doctype": "Academic Year",
            "start_month": "Septembre",
            "end_month": "Juin",
            "start_year": past_year,
            "end_year": current_year,

        }).insert(ignore_permissions=True)
    frappe.db.set_single_value('Academic Year', 'current_year', default_academic_year.name)
    return default_academic_year.name


@frappe.whitelist()
def get_week_planning(filiere, niveau, academic_year, week_start):
    PlanningItem = DocType("Planning Item")
    Course = DocType("Course")
    CourseNiveauFiliere = DocType("Course Field of study level item")
    CourseEnseignant = DocType("Course Teacher Item")

    # query = (
    #     frappe.qb.from_(PlanningItem)
    #     .join(Course)
    #     .on(PlanningItem.course == Course.name)
    #     .join(CourseNiveauFiliere)
    #     .on(   CourseNiveauFiliere.parent == Course.name
    #         & (CourseNiveauFiliere.field_of_study == filiere)
    # )


@frappe.whitelist()
def create_planning(cours, course_type, day_of_week, half_day):

    cours_value = frappe.get_doc("Course", {"name":cours})
    cours_teachers = list(map(lambda x: x.enseignant, cours_value.table_enseignant))
    default_academic_year =get_default_academic_year()

    planning_days = frappe.get_all("Planning Item",{"date":day_of_week, "period":half_day},["name","cours","type","date","period"])
    for plan in planning_days:
        doc = frappe.get_doc("Course", plan.cours)
        cours_teachers_existing = list(map(lambda x: x.enseignant, doc.table_enseignant))
        # Check for common teachers
        common_teachers = set(cours_teachers).intersection(set(cours_teachers_existing))
        if common_teachers:
            raise frappe.ValidationError(f"Conflit de planning détecté avec le cours '{doc.name}' pour les enseignants: {', '.join(common_teachers)}")

    planning = frappe.get_doc({
        "doctype":"Planning Item",
        "cours":cours_value.name,
        "type":course_type,
        "date":day_of_week,
        "period":half_day,
        "academic_year":default_academic_year
    })

    planning.insert(ignore_permissions = True)
    return planning