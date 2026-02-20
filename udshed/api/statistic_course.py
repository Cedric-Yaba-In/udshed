import frappe
import udshed.api.course as course
import udshed.api.planning as planning

def statistic_hours_done_cours(item_planning_cours):
    nbre_done = 0
    for item in item_planning_cours:
        if item.status == "Fait":
            nbre_done += 1

    return nbre_done

def statistic_cours_faculte(academic_year,faculte=None,course_type="Cours",semestre=None):
    teaching_units = course.get_teaching_unit_by_year(academic_year,faculte,semestre)
    teaching_units_key = [ unit.name for unit in teaching_units]
    planning_items = planning.get_all_planning_item(academic_year,course_type)
    planing_filtred_key = []

    #On se rassure qu'on ne travail qu'avec les cours dont on a les items de planning    
    for item_key in planning_items.key():
        if item_key in teaching_units_key:
            planing_filtred_key.append(item_key)

    result = {
            "done":{
                "qty":0,
                "cours":[]
            },
            "to_end":{
                "qty":0,
                "cours":[]
            },
            "to_start":{
                "qty":0,
                "cours":[]
            }
        } 

    for plan_key in planing_filtred_key:
        planning_item = planning_items[plan_key]
        hours_to_do = planning_item.nombre_dheure_cm + planning_item.nombre_dheure_td + planning_item.nombre_dheure_tp
        if course_type=="Cours":
            stat_done_course = statistic_hours_done_cours(planning_item)
            percent_done_course = stat_done_course / (hours_to_do)
            data_course = {
                "name":planning_item.name,
                "intitule":planning_item.intitule,
                "course":planning_item.course,
                "status":planning_item.status,
                "percent_done":percent_done_course
                }
    
            if stat_done_course == hours_to_do:
                result["done"]["cours"].append(data_course)
                result["done"]["qty"] +=1
            else:
                result["to_end"]["cours"].append(data_course)
                result["done"]["qty"] +=1
        else:
            percent_done_course = 1
            data_course = {
                "name":planning_item.name,
                "intitule":planning_item.intitule,
                "course":planning_item.course,
                "status":planning_item.status,
                "percent_done":percent_done_course
                }
            result["done"]["cours"].append(data_course)
            result["done"]["qty"] +=1
        
        
    #Maintenant pour les cours/cc/exam non planifier et donc qui doit être fait mais non encore fait
    for unit in teaching_units:
        if unit in planing_filtred_key:
            continue
        else:
            data_course = {
                "name":unit.name,
                "intitule":unit.intitule_cours,
                "course":unit.name,
                "status":"Non planifié",
                "percent_done":0
            }
            result["to_start"]["cours"].append(data_course)
            result["to_start"]["qty"] +=1
    
    return result


def statistic_teacher(academic_year, teacher, semestre=None ):
    pass



        
       
    

    