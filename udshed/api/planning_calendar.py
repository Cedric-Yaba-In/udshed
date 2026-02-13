import frappe
import json
from datetime import date
import udshed.api.course as course
from frappe.query_builder import DocType
from frappe.query_builder.functions import Count
from datetime import datetime
import udshed.utils.time_utils as time_utils



@frappe.whitelist()
def get_week_planning(academic_year,filiere, niveau,  week_start):
    PlanningItem = DocType("Planning Item")
    TeachingUnit = DocType("Teaching Unit")
    CourseNiveauFiliere = DocType("Course Field of study level item")
    CourseEnseignant = DocType("Course Teacher Item")
    date_week_start = datetime.fromisoformat(week_start)

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
        # doc["period"] = frappe.get_doc("Planning Period",doc.period)
        if doc.salle:
            doc["salle"] = (frappe.get_doc("Room",doc.salle)).code
        if doc.batiment:
            doc["batiment"] = (frappe.get_doc("Building", doc.batiment)).code

    return data


@frappe.whitelist()
def create_planning(academic_year, cours, course_type,day_of_week, half_day,batiment=None,salle=None):
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
        
        if salle and doc.salle == salle:
            frappe.throw(f"Conflit de salle détecté avec la salle '{doc.salle}' utilisé pour le cours {doc.intitule_cours}")
            

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


@frappe.whitelist()
def update_planning(planning_item_name,academic_year,cours,course_type,batiment,salle, day_of_week, half_day):
    planning_item = frappe.get_doc("Planning Item", planning_item_name)
    teaching_unit = course.get_single_teaching_unit(cours,academic_year)

    planning_item.cours = teaching_unit.name
    planning_item.type = course_type

    cours_teachers = list(map(lambda x: x.enseignant, teaching_unit.table_enseignant))
    date_week_start = datetime.fromisoformat(day_of_week)
       
    planning_days = frappe.get_all("Planning Item",{"date":date_week_start, "period":half_day},["name","cours","type","date","period"])
    for plan in planning_days:
        if plan.name == planning_item_name:
            continue
        doc = course.get_single_teaching_unit(plan.cours,academic_year)
        cours_teachers_existing = list(map(lambda x: x.enseignant, doc.table_enseignant))
        # Check for common teachers
        common_teachers = set(cours_teachers).intersection(set(cours_teachers_existing))
        if common_teachers:
            frappe.throw(f"Conflit de planning détecté avec le cours '{doc.intitule_cours}' pour les enseignants: {', '.join(common_teachers)}")
        if salle and doc.salle == salle:
            frappe.throw(f"Conflit de salle détecté avec la salle '{doc.salle}' utilisé pour le cours {doc.intitule_cours}")
    if salle:
        planning_item.salle = salle
    if batiment:
        planning_item.batiment = batiment
     
    planning_item.save()

    return planning_item


@frappe.whitelist()
def delete_planning(planning_name):
    frappe.delete_doc("Planning Item",planning_name)
    return True

@frappe.whitelist()
def get_period():
    return frappe.db.get_all('Planning Period', order_by='position asc',fields=["name","libelle"])