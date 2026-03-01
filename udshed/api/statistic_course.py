import frappe
from datetime import datetime,timedelta
import udshed.api.course as course
import udshed.api.planning as planning
from functools import reduce



@frappe.whitelist()
def statistic_cours_faculte(academic_year,faculte=None,course_type=None,semestre=None):
    teaching_units = course.get_teaching_unit_by_year(academic_year,faculte,semestre)
    teaching_units_key = [ unit["name"] for unit in teaching_units]
    planning_items = planning.get_all_planning_item_by_year(academic_year,course_type)

    planing_filtred_key = []

    #On se rassure qu'on ne travail qu'avec les cours dont on a les items de planning    
    for item_key in planning_items.keys():
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
        print("Planning Item ",planning_item)
        hours_to_do = planning_item["nombre_dheure_cm"] + planning_item["nombre_dheure_td"] + planning_item["nombre_dheure_tp"]
        if course_type=="Cours":
            stat_done_course = statistic_hours_done_cours(planning_item)
            percent_done_course = stat_done_course / (hours_to_do)
            data_course = {
                "name":planning_item["name"],
                "intitule":planning_item["intitule"],
                "course":planning_item["course"],
                "status":planning_item["status"],
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
                "name":planning_item["name"],
                "intitule":planning_item["intitule"],
                "course":planning_item["course"],
                "status":planning_item["status"],
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
                "name":unit["name"],
                "intitule":unit["intitule"],
                "course":unit["name"],
                "status":"Non planifié",
                "percent_done":0
            }
            result["to_start"]["cours"].append(data_course)
            result["to_start"]["qty"] +=1
    
    return result


def statistic_teacher(academic_year, teacher, semestre=None ):
    pass


@frappe.whitelist()
def statistic_year(academic_year, semestre=None):
    teaching_units = course.get_teaching_unit_by_year(academic_year=academic_year,semestre=None)
    teaching_units_key = teaching_units.keys()
    planning_items = planning.get_all_planning_item_by_year(academic_year)
    planing_filtred_key = []
    # print("Planning Items ", teaching_units)

    for item_key in planning_items.keys():
        if item_key in teaching_units_key:
            planing_filtred_key.append(item_key)

    #Preparation de l'ensemble des kpis
    result = {
        "global":{
            "sessions":0,
            "done_hours":0,
            "total_hours": get_total_hours_of_teaching_unit_in_dict(teaching_units),
            "completion":0,
            "planned_course":0,
            "to_start_course":0,
            "end_course":0,
            "sessions_map":get_session_map([x["planning"] for x in planning_items.values()]),

        },
        "faculte":[]
    }    

    #Preparation des kpis de facultes
    faculty_list = list(set([ unit["faculte"] for key,unit in teaching_units.items()]))
    faculty_list_dict = {}
    for faculty in faculty_list:
        faculty_list_dict[faculty] = {
            "faculty":frappe.get_doc("Faculty",faculty),
            "sessions":0,
            "done_hours":0,
            "total_hours":get_total_hours_of_teaching_unit_in_list([x for x in list(teaching_units.values()) if x["faculte"]==faculty]),
            "completion":0,
            "filiere": frappe.db.count("Field of study",{"faculte":faculty})
        }
    #Pour chaque teaching unit
    for plan_key in planing_filtred_key:
        planning_items_by_course = planning_items[plan_key]
        result["global"]["sessions"]+=len(planning_items_by_course["planning"])
        hours_done=0
        for plan in planning_items_by_course["planning"]:
            period = plan["period"].split("-")
            format_period_start = "%H:%M" if len(period[0])==5 else "%H:%M:%S"
            format_period_end = "%H:%M" if len(period[1])==5 else "%H:%M:%S"
            current_hours = datetime.strptime(period[1], format_period_end) - datetime.strptime(period[0], format_period_start)
            hours_done = hours_done +  int(current_hours.total_seconds()/60)
            faculty_list_dict[planning_items_by_course["faculte"]]["sessions"] += 1

        faculty_list_dict[planning_items_by_course["faculte"]]["done_hours"] += hours_done
        hours_to_done = (
            (teaching_units[plan_key]["nombre_dheure_cm"] if teaching_units[plan_key]["nombre_dheure_cm"] else 0) +
            (teaching_units[plan_key]["nombre_dheure_td"] if teaching_units[plan_key]["nombre_dheure_td"] else 0) + 
            (teaching_units[plan_key]["nombre_dheure_tp"] if teaching_units[plan_key]["nombre_dheure_tp"] else 0)
        )
        if hours_done == hours_to_done:
            result["global"]["end_course"] += 1
        elif hours_done > 0:
            result["global"]["planned_course"] += 1
            
        result["global"]["done_hours"] += hours_done

    result["global"]["to_start_course"] = len(teaching_units) - len(planning_items)
    result["global"]["done_hours"] =  int(result["global"]["done_hours"] / 60)
    result["global"]["completion"] = "{:.2f}".format((result["global"]["done_hours"] / result["global"]["total_hours"]) * 100)
    result["faculte"] = [
        {
            **faculty,
            "done_hours":int(faculty["done_hours"] / 60),
            "completion": "{:.2f}".format((int(faculty["done_hours"] / 60) /faculty["total_hours"])*100), 
            "completion_color": get_completion_color((int(faculty["done_hours"] / 60) /faculty["total_hours"])*100)
            # "total_hours":str(timedelta(minutes=faculty["total_hours"]))[:-3]
        } for faculty in faculty_list_dict.values()
    ]

    return result

#TeachingUnit here is a dict with name of teaching unit as a key of the dict
def get_total_hours_of_teaching_unit_in_dict(teaching_units):
    return get_total_hours_of_teaching_unit_in_list(list(teaching_units.values()))

def get_total_hours_of_teaching_unit_in_list(teaching_units):
    total_hour = 0
    for value in teaching_units:
        print("vaule teaching ",value["nombre_dheure_cm"],value["nombre_dheure_td"],value["nombre_dheure_tp"],value["nombre_dheure_cm"] + value["nombre_dheure_td"] + value["nombre_dheure_tp"],"\n")
        if not value["nombre_dheure_cm"]:
            value["nombre_dheure_cm"] = 0
        if not value["nombre_dheure_td"]:
            value["nombre_dheure_td"] = 0
        if not value["nombre_dheure_tp"]:
            value["nombre_dheure_tp"] = 0
        total_hour += value["nombre_dheure_cm"] + value["nombre_dheure_td"] + value["nombre_dheure_tp"]
    return total_hour
    


def get_completion_color(rate):
    """Détermine la couleur selon le taux de complétion"""
    if rate >= 90:
        return 'success'
    elif rate >= 75:
        return 'info'
    elif rate >= 50:
        return 'warning'
    else:
        return 'danger'
    
def get_session_map(planningItem):
    item = []
    for plan in planningItem:
        item.extend(plan)

    cours_value=0
    tp_value = 0
    td_value = 0
    for x in item:
        print("item",x)
        if x["type"]=="Cours":
            cours_value +=1
        elif x["type"]=="Traveaux Dirigés (TD)":
            td_value +=1
        elif x["type"]=="Traveaux Pratiques (TP)":
            tp_value +=1

    return [
        {
            "type":"Cours",
            "value":cours_value
        },
        {
            "type":"Traveaux Pratiques (TP)",
            "value":tp_value
        },
        {
            "type":"Traveaux Dirigés (TD)",
            "value":td_value
        }
    ]

def statistic_hours_done_cours(item_planning_cours):
    nbre_done = 0
    for item in item_planning_cours:
        if item.status == "Fait":
            nbre_done += 1

    return nbre_done