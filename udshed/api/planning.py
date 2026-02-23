import frappe
from frappe.query_builder import DocType

def get_all_planning_item_by_year(academic_year,course_type):
    PlanningItem = DocType('Planning Item')
    Course = DocType('Course')

    query = (
        frappe.qb.from_(PlanningItem)
        .join(Course)
        .on(PlanningItem.cours == Course.name)
        .select(
            PlanningItem.name,
            PlanningItem.course,
            PlanningItem.period,
            PlanningItem.date,
            PlanningItem.status,
            Course.intitule.as_("course_label"),
            Course.nombre_dheure_cm,
            Course.nombre_dheure_td,
            Course.nombre_dheure_tp
        )
        .where(
            (PlanningItem.academic_year == academic_year) &
            (PlanningItem.type == course_type)
        )
    )

    data =  query.run(as_dict=True)
    result = {}
    for d in data:
        if d.name in result:
            result[d.name].append(d)
        else:
            result[d.name] = [d]
    return result

def get_planning_item_by_year_by_teacher(academic_year,teacher):
    PlanningItem = DocType('Planning Item')
    Course = DocType('Course')
    CourseTeacherItem = DocType("Course Teacher Item")
    TeachingUnit = DocType("Teaching Unit")

    query = (
        frappe.qb.from_(PlanningItem)
        .join(Course)
        .on(PlanningItem.cours == Course.name)
        .join(TeachingUnit)
        .on(Course.name == TeachingUnit.course)
        .join(CourseTeacherItem)
        .on(TeachingUnit.enseignant == CourseTeacherItem.parent)
        .select(
            PlanningItem.name,
            PlanningItem.course,
            PlanningItem.period,
            PlanningItem.date,
            PlanningItem.status,
            Course.intitule.as_("course_label"),
            Course.nombre_dheure_cm,
            Course.nombre_dheure_td,
            Course.nombre_dheure_tp
        )
        .where(
            (PlanningItem.academic_year == academic_year) &
            (CourseTeacherItem.type == course_type)
        )
    )

    data =  query.run(as_dict=True)
    result = {}
    for d in data:
        if d.name in result:
            result[d.name].append(d)
        else:
            result[d.name] = [d]
    return result