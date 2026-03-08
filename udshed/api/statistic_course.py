import frappe
from datetime import datetime,timedelta
import udshed.api.course as course
import udshed.api.planning as planning
from functools import reduce

@frappe.whitelist()
def statistic_year(academic_year, semestre=None):
    """Statistique global de l'année"""

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



@frappe.whitelist()
def statistic_cours_faculte(academic_year,faculty,course_type=None,semestre=None):
    """ Statistique de la faculté pour une année"""

    teaching_units = course.get_teaching_unit_by_year(academic_year=academic_year,faculty=faculty,semestre=semestre)
    teaching_units_key = teaching_units.keys()
    planning_items = planning.get_all_planning_item_by_year(academic_year=academic_year,faculty=faculty,course_type=course_type)

    planing_filtred_key = []

    #On se rassure qu'on ne travail qu'avec les cours dont on a les items de planning    
    for item_key in planning_items.keys():
        if item_key in teaching_units_key:
            planing_filtred_key.append(item_key)

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
            "programs_count":0
        },
        "filiere":[],
    } 

    #Preparation des kpis de filiere
    filiere_list_dict = {}

    for value in teaching_units.values():
        for niveau in value["niveau"]:
            if niveau["filiere"] not in filiere_list_dict.keys():
                filiere_list_dict[niveau["filiere"]] = {
                    "filiere":frappe.get_doc("Field of study",niveau["filiere"]),
                    "sessions":0,
                    "done_hours":0,
                    "total_hours":0,
                    "completion":0,
                    "teaching_unit":[value]
                }
                result["global"]["programs_count"] +=1
            else:
                filiere_list_dict[niveau["filiere"]]["teaching_unit"].append(value)

    #Pour chaque teaching unit
    for plan_key in planing_filtred_key:
        planning_items_by_course = planning_items[plan_key]
        result["global"]["sessions"]+=len(planning_items_by_course["planning"])
        hours_done=0
        filiere_found = list(set([x["filiere"] for x in planning_items_by_course["niveau"]]))
        for plan in planning_items_by_course["planning"]:
            period = plan["period"].split("-")
            format_period_start = "%H:%M" if len(period[0])==5 else "%H:%M:%S"
            format_period_end = "%H:%M" if len(period[1])==5 else "%H:%M:%S"
            current_hours = datetime.strptime(period[1], format_period_end) - datetime.strptime(period[0], format_period_start)
            hours_done = hours_done +  int(current_hours.total_seconds()/60)
            for f in filiere_found:
                filiere_list_dict[f]["sessions"] += 1

        for f in filiere_found:
            filiere_list_dict[f]["done_hours"] += hours_done
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
    for f in filiere_list_dict.values():
        total_hours = get_total_hours_of_teaching_unit_in_list(f["teaching_unit"])
        f.pop("teaching_unit")

        result["filiere"].append({
            **f,
            "total_hours":total_hours,
            "done_hours":int(f["done_hours"] / 60),
            "completion": "{:.2f}".format((int(f["done_hours"] / 60) / total_hours)*100), 
            "completion_color": get_completion_color((int(f["done_hours"] / 60) / total_hours)*100),
        })

    return result


@frappe.whitelist()
def statistic_fieldofstudy(academic_year,faculty,filiere,semestre=None,course_type=None):
    """Statistique de progression d'une filiére"""
    teaching_units = course.get_teaching_unit_by_year(academic_year=academic_year,faculty=faculty,field_of_study=filiere,semestre=semestre)
    teaching_units_key = teaching_units.keys()
    planning_items = planning.get_all_planning_item_by_year(academic_year=academic_year,faculty=faculty,field_of_study=filiere ,course_type=course_type)

    planing_filtred_key = []

    #On se rassure qu'on ne travail qu'avec les cours dont on a les items de planning    
    for item_key in planning_items.keys():
        if item_key in teaching_units_key:
            planing_filtred_key.append(item_key)

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
            "level_count":0
        },
        "level":[],
    } 

    #Preparation des kpis de filiere
    level_list_dict = {}

    for value in teaching_units.values():
        for niveau in value["niveau"]:
            if niveau["niveau"] not in level_list_dict.keys():
                level_list_dict[niveau["niveau"]] = {
                    "level":frappe.get_doc("Field of study Level",niveau["niveau"]),
                    "sessions":0,
                    "done_hours":0,
                    "total_hours":0,
                    "completion":0,
                    "count_teaching_unit":len(course.get_teaching_unit_by_level(None,None,None,None,None,{"filiere":filiere,"niveau":niveau["niveau"],"academic_year":academic_year})),
                    "teaching_unit":[value]
                }
                result["global"]["level_count"] +=1
            else:
                level_list_dict[niveau["niveau"]]["teaching_unit"].append(value)

    #Pour chaque teaching unit
    for plan_key in planing_filtred_key:
        planning_items_by_course = planning_items[plan_key]
        result["global"]["sessions"]+=len(planning_items_by_course["planning"])
        hours_done=0
        level_found = list(set([x["niveau"] for x in planning_items_by_course["niveau"]]))
        for plan in planning_items_by_course["planning"]:
            period = plan["period"].split("-")
            format_period_start = "%H:%M" if len(period[0])==5 else "%H:%M:%S"
            format_period_end = "%H:%M" if len(period[1])==5 else "%H:%M:%S"
            current_hours = datetime.strptime(period[1], format_period_end) - datetime.strptime(period[0], format_period_start)
            hours_done = hours_done +  int(current_hours.total_seconds()/60)
            for n in level_found:
                level_list_dict[n]["sessions"] += 1

        for n in level_found:
            level_list_dict[n]["done_hours"] += hours_done
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
    for l in level_list_dict.values():
        total_hours = get_total_hours_of_teaching_unit_in_list(l["teaching_unit"])
        l.pop("teaching_unit")

        result["level"].append({
            **l,
            "total_hours":total_hours,
            "done_hours":int(l["done_hours"] / 60),
            "completion": "{:.2f}".format((int(l["done_hours"] / 60) / total_hours)*100), 
            "completion_color": get_completion_color((int(l["done_hours"] / 60) / total_hours)*100),
        })

    return result


def statistic_teacher(academic_year, teacher, semestre=None ):
    pass


#####Fonction d'aide
#TeachingUnit here is a dict with name of teaching unit as a key of the dict
def get_total_hours_of_teaching_unit_in_dict(teaching_units):
    return get_total_hours_of_teaching_unit_in_list(list(teaching_units.values()))

def get_total_hours_of_teaching_unit_in_list(teaching_units):
    print("Teaching unit total_hours",teaching_units)
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