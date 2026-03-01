import frappe
from frappe.query_builder import DocType

def get_all_planning_item_by_year(academic_year,course_type=None):
    PlanningItem = DocType('Planning Item')
    TeachingUnit = DocType("Teaching Unit")
    CourseFieldOfStudyLevelItem = DocType("Course Field of study level item")
    FieldOfStudy = DocType("Field of study")
    Course = DocType('Course')

    query = (
        frappe.qb.from_(PlanningItem)
        .join(TeachingUnit)
        .on(PlanningItem.cours == TeachingUnit.name)
        .join(Course)
        .on(TeachingUnit.course == Course.name)
        .join(CourseFieldOfStudyLevelItem)
		.on(CourseFieldOfStudyLevelItem.parent == TeachingUnit.name)
		.join(FieldOfStudy)
		.on(FieldOfStudy.name==CourseFieldOfStudyLevelItem.filiere)
        .select(
            PlanningItem.name,
            PlanningItem.cours,
            PlanningItem.period,
            PlanningItem.date,
            PlanningItem.status,
            PlanningItem.type,
            TeachingUnit.name.as_("teachingunit_name"),
            Course.intitule.as_("course_label"),
            Course.nombre_dheure_cm,
            Course.nombre_dheure_td,
            Course.nombre_dheure_tp,
            Course.name.as_("course_name"),
            CourseFieldOfStudyLevelItem.filiere,
			CourseFieldOfStudyLevelItem.niveau,
			CourseFieldOfStudyLevelItem.course_poid,
            FieldOfStudy.faculte
        )
        .where(
            (PlanningItem.academic_year == academic_year) 
        )
    )
    if course_type:
        query = query.where(PlanningItem.type == course_type)
    data =  query.run(as_dict=True)
    result = {}
    for d in data:
        if d.teachingunit_name in result:
            result[d.teachingunit_name].append(d)
        else:
            result[d.teachingunit_name] = [d]

    process_data = {}
    #Pour regrouper les enseignants et les niveau en fonction du cours
    for d in data:
        niveau_key = f"{d.filiere}-{d.niveau}"
        if d.teachingunit_name in process_data:			
            if niveau_key not in process_data[d.teachingunit_name]["niveau_key"]:
                process_data[d.teachingunit_name]["niveau"].append({"filiere":d.filiere,"niveau":d.niveau,"course_poid":d.course_poid})
                process_data[d.teachingunit_name]["niveau_key"].append(niveau_key)
            if not d.name in [x["name"] for x in process_data[d.teachingunit_name]["planning"] ]:
                process_data[d.teachingunit_name]["planning"].append({
                        "name":d.name,
                        "cours":d.cours,
                        "period":d.period,
                        "date":d.date,
                        "status":d.status,
                        "type":d.type
                    })
                
        else:
            process_data[d.teachingunit_name]={
                "niveau":[{"filiere":d.filiere, "niveau":d.niveau, "course_poid":d.course_poid,"faculty":d.faculte}],
                "niveau_key":[niveau_key],
                "course_name":d.course_name,
                "intitule":d.intitule,
                "nombre_dheure_cm":d.nombre_dheure_cm,
                "nombre_dheure_td":d.nombre_dheure_td,
                "nombre_dheure_tp":d.nombre_dheure_tp,
                "semestre":d.semestre,
                "faculte":d.faculte,
                "name":d.teachingunit_name,
                "planning":[{
                        "name":d.name,
                        "period":d.period,
                        "date":d.date,
                        "status":d.status,
                        "type":d.type
                }]
            }
			
	#On supprime les élements qui ont aidé au traitement
    for key in process_data.keys():
        process_data[key].pop("niveau_key")
    return process_data

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