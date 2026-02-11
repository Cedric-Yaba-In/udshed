import frappe
import json
from datetime import date
import udshed.api.course as course
from frappe.query_builder import DocType
from frappe.query_builder.functions import Count
from datetime import datetime


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
def get_week_planning(academic_year,filiere, niveau,  week_start):
    PlanningItem = DocType("Planning Item")
    TeachingUnit = DocType("Teaching Unit")
    CourseNiveauFiliere = DocType("Course Field of study level item")
    CourseEnseignant = DocType("Course Teacher Item")
    date_week_start = datetime.fromisoformat(week_start)

    print("filiere & niveau ",filiere,niveau)
    query = (
        frappe.qb.from_(PlanningItem)
        .join(TeachingUnit)
        .on(PlanningItem.cours == TeachingUnit.name)
        .join(CourseNiveauFiliere)
        .on(CourseNiveauFiliere.parent == TeachingUnit.name)
        .join(CourseEnseignant)
        .on(CourseEnseignant.parent == TeachingUnit.name)
        .select(
            TeachingUnit.course,
            PlanningItem.salle,
            PlanningItem.batiment,
            PlanningItem.name,
            PlanningItem.type,
            PlanningItem.cours,
            PlanningItem.date,
            PlanningItem.period,
            CourseNiveauFiliere.niveau,
            CourseNiveauFiliere.filiere,
            CourseEnseignant.enseignant,
        )
        .where(
            (CourseNiveauFiliere.filiere == filiere) &
            (CourseNiveauFiliere.niveau == niveau) &
            (PlanningItem.academic_year == academic_year) #&
            # (PlanningItem.date >= date_week_start) &
            # (PlanningItem.date < frappe.utils.add_days(date_week_start, 7))
        )
    )
    data =  query.run(as_dict=True)
    data = [item for item in data if item.date >= date_week_start and item.date <= frappe.utils.add_days(date_week_start, 7)]

    for doc in data:
        teacher = frappe.get_doc("Teacher",{"name":doc.enseignant})
        doc["enseignant"] = f"{teacher.grade}. {teacher.first_name} {teacher.last_name}"
        cours  = frappe.get_doc("Course",doc.course)
        doc["cours_label"] = cours.intitule
        if doc.salle:
            doc["salle"] = (frappe.get_doc("Room",doc.salle)).code
        if doc.batiment:
            doc["batiment"] = (frappe.get_doc("Building", doc.batiment)).code

    return data


@frappe.whitelist()
def create_planning(academic_year, cours, course_type,batiment,salle, day_of_week, half_day):

    teaching_unit = course.get_single_teaching_unit(cours,academic_year)
    cours_teachers = list(map(lambda x: x.enseignant, teaching_unit.table_enseignant))
    date_week_start = datetime.fromisoformat(day_of_week)
       
    planning_days = frappe.get_all("Planning Item",{"date":date_week_start, "period":half_day},["name","cours","type","date","period"])
    for plan in planning_days:
        doc = course.get_single_teaching_unit(plan.cours,academic_year)
        cours_teachers_existing = list(map(lambda x: x.enseignant, doc.table_enseignant))
        # Check for common teachers
        common_teachers = set(cours_teachers).intersection(set(cours_teachers_existing))
        if common_teachers:
            frappe.throw(f"Conflit de planning détecté avec le cours '{doc.intitule_cours}' pour les enseignants: {', '.join(common_teachers)}")

    planning_data = {
        "doctype":"Planning Item",
        "cours":teaching_unit.name,
        "type":course_type,
        "date":date_week_start,
        "period":half_day,
        "academic_year":academic_year
    }

    if salle:
        planning_data["salle"] = salle
    if batiment:
        planning_data["batiment"] = batiment
     
    planning = frappe.get_doc(planning_data)

    planning.insert(ignore_permissions = True)
    return planning