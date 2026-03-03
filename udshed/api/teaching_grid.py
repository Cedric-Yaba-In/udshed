import frappe
from frappe.query_builder import DocType
import udshed.utils.file_utils as file_utils

#Todo 
# 1 - Rétirer les teaching units non utilisé d'une année  

@frappe.whitelist()
def get_academic_teaching_unit(academic_year,faculty,field_of_study,field_of_study_level,semestre):
    TeachingUnit = DocType("Teaching Unit")
    TeachingUnitValue = DocType("Teaching Unit Value")
    Course = DocType("Course")
    CourseTeacherItem = DocType("Course Teacher Item")
    CourseFieldOfStudyLevelItem = DocType("Course Field of study level item")
    CourseFieldOfStudy = DocType("Field of study")

    query = (
        frappe.qb.from_(TeachingUnit)
        .join(Course)
        .on(TeachingUnit.course==Course.name)
        .join(CourseTeacherItem)
        .on(CourseTeacherItem.parent == TeachingUnit.name)
        .join(CourseFieldOfStudyLevelItem)
        .on(CourseFieldOfStudyLevelItem.parent == TeachingUnit.name)
        .join(CourseFieldOfStudy)
        .on(CourseFieldOfStudy.name==CourseFieldOfStudyLevelItem.filiere)
        .join(TeachingUnitValue)
        .on(TeachingUnitValue.name == TeachingUnit.unite_de_valeur)
        .select(
            TeachingUnit.name,
            TeachingUnit.nombre_dheure_cm,
            TeachingUnit.nombre_dheure_tp,
            TeachingUnit.nombre_dheure_td,
            TeachingUnit.nombre_dheure_tpe,
            TeachingUnit.intitule_cours,
            TeachingUnit.course.as_("course_name"),
            TeachingUnit.semestre,
            CourseTeacherItem.enseignant,
            CourseTeacherItem.type_de_cours,
            CourseFieldOfStudyLevelItem.filiere,
            CourseFieldOfStudyLevelItem.niveau,
            CourseFieldOfStudyLevelItem.course_poid,
            CourseFieldOfStudy.faculte,
            TeachingUnitValue.name.as_("ue_code"),
            TeachingUnitValue.intitule.as_("ue_intitule")
        )
        .where(
            (TeachingUnit.academic_year == academic_year) &
            (CourseFieldOfStudy.faculte == faculty) &
            (CourseFieldOfStudyLevelItem.filiere==field_of_study) &
            ( Course.semester == semestre ) &
            ( CourseFieldOfStudyLevelItem.niveau == field_of_study_level )
        )	
    )
    result = {}
    stat_result = {
        'ue_count': 0,
        'course_count': 0,
        'total_credits': 0,
        'total_hours': 0
    }
    data = query.run(as_dict=True)
    for doc in data:
        if doc.unite_de_valeur in result:
            if doc.enseignant not in result[doc.unite_de_valeur]["key_enseignant"]:
                result[doc.unite_de_valeur]["courses"]["teacher"].append(
                    {
                        "teacher":doc.enseignant,
                        "type_cours":doc.type_de_cours
                    }
                )
                result[doc.unite_de_valeur]["key_enseignant"].append(doc.enseignant)
            else:
                result[doc.unite_de_valeur]["courses"].append({
                    "code":doc.course_name,
                    "title": doc.intitule_cours,
                    "credits": doc.course_poid,
                    "type":"ENS",
                    "nombre_dheure_cm": doc.nombre_dheure_cm,
                    "nombre_dheure_td": doc.nombre_dheure_td,
                    "nombre_dheure_tp": doc.nombre_dheure_tp,
                    "nombre_dheure_tpe": doc.nombre_dheure_tpe,
                    "enseignant": doc.enseignant,
                    "type_cours": doc.type_de_cours,
                    "filiere": doc.filiere,
                    "niveau": doc.niveau,
                    "ue_intitule": doc.ue_intitule,
                    "teacher":[]
                })
                result[doc.unite_de_valeur]["ue_credits"] += int(doc.course_poid) 
                stat_result["course_count"] +=1
                stat_result["total_credits"] +=int(doc.course_poid) 
                stat_result["total_hours"] +=int(doc.nombre_dheure_cm) + int(doc.nombre_dheure_td) + int(doc.nombre_dheure_tp) + int(doc.nombre_dheure_tpe)
        else:
            result[doc.unite_de_valeur] = {
                "ue_code":doc.ue_code,
                "ue_title":doc.ue_intitule,
                "ue_credits":int(doc.course_poid),
                "courses":[
                    {
                        "code":doc.course_name,
                        "title": doc.intitule_cours,
                        "credits": doc.course_poid,
                        "type":"ENS",
                        "nombre_dheure_cm": doc.nombre_dheure_cm,
                        "nombre_dheure_td": doc.nombre_dheure_td,
                        "nombre_dheure_tp": doc.nombre_dheure_tp,
                        "nombre_dheure_tpe": doc.nombre_dheure_tpe,
                        "enseignant": doc.enseignant,
                        "type_cours": doc.type_de_cours,
                        "filiere": doc.filiere,
                        "niveau": doc.niveau,
                        "ue_intitule": doc.ue_intitule,
                        "teacher":[
                            {
                                "teacher":doc.enseignant,
                                "type_cours":doc.type_de_cours
                            }
                        ]
                    }
                ],
                "key_enseignant":[doc.enseignant]
            }
            stat_result["ue_count"] +=1
            stat_result["course_count"] +=1
            stat_result["total_credits"] +=int(doc.course_poid) 
            stat_result["total_hours"] +=int(doc.nombre_dheure_cm) + int(doc.nombre_dheure_td) + int(doc.nombre_dheure_tp) + int(doc.nombre_dheure_tpe)
    for key in result:
        result[key].pop("key_enseignant")
    
    return {"stat":stat_result,"grid":result}

@frappe.whitelist()
def import_grid(file_url,academic_year,faculte,fieldofstudy,fieldofstudylevel,semestre):
    """Importer une grille depuis Excel"""
    #a supposer c'est dans une matrice comme dans le test
    file_utils.read_frappe_excel(file_url)

    #Rétirer tous cours à cette salle de classe
    frappe.db.delete("Course Field of study level item",filters={"filiere":fieldofstudy, "niveau":fieldofstudylevel})

    record_stat = {
        "insert":0,
        "delete":0,
        "update":0
    }
    teaching_unit_in_grid = []

    academic_year_obj = frappe.get_doc("Academic Year",academic_year)
    data_grid = []
    for data in data_grid:
        worked_ue = None
        if data[0] and data[4]=="UE":
            if frappe.db.exists({ 'doctype': 'Teaching Unit Value', 'code': data[0],"academic_year":academic_year}):
                #si UE existe (module) on le met juste à jour
                worked_ue = frappe.get_doc("Teaching Unit Value",{"code":data[0]})
                worked_ue.intitule=data[2]
                worked_ue.semestre=semestre
                worked_ue.save()
            else:
                worked_ue=frappe.get_doc({
                    "doctype":"Teaching Unit Value",
                    "code":data[0],
                    "intitule":data[2],
                    "semestre":semestre,
                    "academic_year":academic_year_obj
                })
                worked_ue.doc.insert( ignore_permissions=True)
        else:
            if frappe.db.exists({'doctype':"Teaching Unit","course":data[1],"academic_year":academic_year}):
                #si le cours existe deja on le met à jour
                course = frappe.get_doc("Teaching Unit",{"course":data[1],"academic_year":academic_year})
                course.intitule_cours=data[3]
                course.unite_de_valeur=worked_ue.name
                course.semestre = semestre
                course.nombre_dheure_cm=int(data[5])
                course.nombre_dheure_td=int(data[6])
                course.nombre_dheure_tp=int(data[7])
                course.nombre_dheure_tpe=int(data[8])

                #les enseignants
                #On supprime d'abord ce qui etait présent
                frappe.db.delete("Course Teacher Item",filters={"parent":course.name})
                #Ensuite pour chaque type de cours d'enseignant, on en insére de nouveau s'in n'existe pas
                if data[9]:
                    teachers_email = data[9].split(",")
                    for teacher_email in teachers_email:
                        if not frappe.db.exists({"doctype":"User", "email":teacher_email}):
                            frappe.throw(f"Erreur l'ors de l'importation. \n\n L'enseignant {teacher_email} introuvable. Renseignez l'addresse email correspondat et réessayez")
                        teacher = frappe.get_doc("Teacher",{"email":teacher_email})
                        if not frappe.db.exists({"doctype":"Course Teacher Item","enseignant":teacher.name,}):
                            course.append("table_enseignant", {
                                "enseignant":teacher.name,
                                "type_de_cours":"CM"
                            })

                #Pour la classe,( faculté, filiere et niveau) on ajoute                
                course.append("field_of_study", {
                    "filiere":fieldofstudy,
                    "niveau":fieldofstudylevel,
                    "course_poid":int(data[3])
                })
                teaching_unit_in_grid.append(course.name)
                record_stat["update"] +=1
                course.save()
            else:
                course = frappe.get_doc({
                    "doctype":"Teaching Unit",
                    "course":data[1],
                    "intitule_cours":data[3],
                    "unite_de_valeur":worked_ue.name,
                    "semestre":semestre,
                    "academic_year":academic_year_obj,
                    "nombre_dheure_cm":int(data[5]),
                    "nombre_dheure_td":int(data[6]),
                    "nombre_dheure_tp":int(data[7]),
                    "nombre_dheure_tpe":int(data[8]),
                    "table_enseignant":[],
                    "field_of_study":[]
                })

                #les enseignants
                if data[9]:
                    teachers_email = data[9].split(", ")
                    for teacher_email in teachers_email:
                        if not frappe.db.exists({"doctype":"User", "email":teacher_email}):
                            frappe.throw(f"Erreur l'ors de l'importation. \n\n L'enseignant {teacher_email} introuvable. Renseignez l'addresse email correspondat et réessayez")
                        teacher = frappe.get_doc("Teacher", {"email":teacher_email})
                        course.append("table_enseignant", {
                            "enseignant":teacher.name,
                            "type_de_cours":"CM"
                        })

                #Pour la classe,(faculté, filiere et niveau) on ajoute
                course.append("field_of_study", {
                    "filiere":fieldofstudy,
                    "niveau":fieldofstudylevel,
                    "course_poid":int(data[3])
                })
                teaching_unit_in_grid.append(course.name)
                record_stat["insert"] +=1
                course.insert(ignore_permissions=True)
    return record_stat

            

                              



            
    