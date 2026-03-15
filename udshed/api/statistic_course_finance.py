import frappe
from datetime import datetime,timedelta
import udshed.api.course as course
import udshed.api.statistic_course as statistic_course
import udshed.api.planning as planning
from functools import reduce

@frappe.whitelist()
def statistic_year(academic_year, semestre=None):
    """Statistique global des finances de l'année"""
    teaching_units = course.get_teaching_unit_by_year(academic_year=academic_year,semestre=None)
    teaching_units_key = teaching_units.keys()
    planning_items = planning.get_all_planning_item_by_filter(academic_year,semestre=semestre)
    planing_filtred_key = []
    # print("Planning Items ", teaching_units)

    for item_key in planning_items.keys():
        if item_key in teaching_units_key:
            planing_filtred_key.append(item_key)

    #Preparation de l'ensemble des kpis
    result = {
        "global":{
            "consume_price":0,
            "total_hours": statistic_course.get_total_hours_of_teaching_unit_in_dict(teaching_units),
            "rate_moyenne":get_default_taux(),
            "completion":0,
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
            "total_hours":statistic_course.get_total_hours_of_teaching_unit_in_list([x for x in list(teaching_units.values()) if x["faculte"]==faculty]),
            "completion":0,
            "filiere": frappe.db.count("Field of study",{"faculte":faculty}),
            "consume_price":0,
            "total_price":0
        }
    
    #Pour chaque teaching unit
    for plan_key in planing_filtred_key:
        planning_items_by_course = planning_items[plan_key]
        result["global"]["sessions"]+=len(planning_items_by_course["planning"])
        hours_done=0
        consume_price = 0
        for plan in planning_items_by_course["planning"]:
            period = plan["period"].split("-")
            format_period_start = "%H:%M" if len(period[0])==5 else "%H:%M:%S"
            format_period_end = "%H:%M" if len(period[1])==5 else "%H:%M:%S"
            current_hours = datetime.strptime(period[1], format_period_end) - datetime.strptime(period[0], format_period_start)
            hours_done = hours_done +  int(current_hours.total_seconds()/60)
            faculty_list_dict[planning_items_by_course["faculte"]]["sessions"] += 1
            consume_price += get_price_of_teacher_list_by_donehours(teaching_units[plan_key]["enseignant"],int(current_hours.total_seconds()/60),plan["type"])

        faculty_list_dict[planning_items_by_course["faculte"]]["consume_price"] +=consume_price
        faculty_list_dict[planning_items_by_course["faculte"]]["done_hours"] += hours_done            
        result["global"]["consume_price"] += consume_price
        result["global"]["done_hours"] += hours_done



@frappe.whitelist()
def statistic_cours_faculte(academic_year,faculty,course_type=None,semestre=None):
    """ Statistique de la faculté pour une année"""
    pass


@frappe.whitelist()
def statistic_fieldofstudy(academic_year,faculty,filiere,semestre=None,course_type=None):
   pass


@frappe.whitelist()
def statistic_level(academic_year,faculty,filiere,niveau,semestre=None,course_type=None):
   pass

@frappe.whitelist()
def statistic_teacher(academic_year,teacher, faculty=None,filiere=None,niveau=None, semestre=None ):
    pass

@frappe.whitelist()
def get_default_finance_config():
    """Get defaut Config finance by title"""
    udshed_config = frappe.doc = frappe.get_single('Udshed Setting')
    config_payement_list = {}
    for config_pay in udshed_config.configuration_des_paiements_par_grade:
        if config_pay.grade not in config_payement_list.keys():
            config_payement_list[config_pay.grade]= {"grade":config_pay.grade,"price":int(config_pay.prix_heure)}
    return config_payement_list


#Calcul du taux par défaut

def get_default_taux():
    config_payment_list = get_default_finance_config()
    somme = sum(map(lambda x: x["price"],config_payment_list))
    return somme /( len(config_payment_list) if len(config_payment_list)>0 else 1)

def get_price_of_teacher_list_by_donehours(teacher_list, done_hours, type_planning):
    config_payment_list = get_default_finance_config()
    done_price= 0
    for t in teacher_list:
        if teacher_list["type_cours"] != type_planning:
            continue
        teacher = frappe.get_doc("Teacher",t["enseignant"])
        titre = teacher.titre
        if titre in config_payment_list.keys():
            done_price += config_payment_list[titre]["price"]*done_hours
        else:
            frappe.throw(f"Configuration manquante<br>Veuillez configurez les prix par haire pour le titre <b>{titre}</b> dans le paneau de configuration général et réessayez")
    
    return done_price


def get_total_price_of_teaching_unit(teaching_unit):
    # teacher_list = list(map(lambda:x.enseignant,teaching_unit.table_enseignant))
    config_payment_list = get_default_finance_config()
    list_hours_by_type = {
        "Cours Magistral (CM)":t.nombre_dheure_cm,
        "Travaux Pratique (TP)":t.nombre_dheure_tp,
        "Travaux Dirigés (TD)":t.nombre_dheure_td
    }
    total_price = 0
    for t in teaching_unit.table_enseignant:
        teacher = frappe.get_doc("Teacher",t.enseignant)
        titre = teacher.titre
        if titre in config_payment_list.keys():
            total_price += config_payment_list[titre]["price"]*int(list_hours_by_type[t.type_de_cours])
        else:
            frappe.throw(f"Configuration manquante<br>Veuillez configurez les prix par haire pour le titre <b>{titre}</b> dans le paneau de configuration général et réessayez")
    
    return total_price
    
