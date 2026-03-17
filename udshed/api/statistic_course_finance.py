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
            "total_price":get_total_price_of_teaching_unit_list(list(teaching_units.values())),
            "done_hours":0,
            "rate_moyenne":get_default_taux(),
            "completion_finance":0,
            "sessions":0,
            "default_currency":frappe.defaults.get_user_default("currency"),
            "default_finance_by_grade":get_default_finance_config()
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
            "total_price":get_total_price_of_teaching_unit_list([x for x in list(teaching_units.values()) if x["faculte"]==faculty]),
            "completion_finance":0,
            "filiere": frappe.db.count("Field of study",{"faculte":faculty}),
            "consume_price":0,
        }
    
    #Pour chaque teaching unit
    for plan_key in planing_filtred_key:
        planning_items_by_course = planning_items[plan_key]
        result["global"]["sessions"]+=len(planning_items_by_course["planning"])
        hours_done=0
        consume_price = 0
        for plan in planning_items_by_course["planning"]:
            period = frappe.get_doc("Planning Period",plan["period"])
            current_hours = datetime.strptime(str(period.heure_de_fin), "%H:%M:%S") - datetime.strptime(str(period.heure_de_debut), "%H:%M:%S")
            hours_done = hours_done +  int(current_hours.total_seconds()/60)
            faculty_list_dict[planning_items_by_course["faculte"]]["sessions"] += 1                
            consume_price += get_price_of_teacher_list_by_donehours(teaching_units[plan_key]["enseignant"],int(current_hours.total_seconds()/3600),plan["type"]) 
        
        # print("Cunsume price ",teaching_units[plan_key]["enseignant"],int(current_hours.total_seconds()/3600),plan["type"],consume_price)
        
        faculty_list_dict[planning_items_by_course["faculte"]]["consume_price"] +=consume_price
        faculty_list_dict[planning_items_by_course["faculte"]]["done_hours"] += hours_done            
        result["global"]["consume_price"] += consume_price
        result["global"]["done_hours"] += hours_done
    result["global"]["completion_finance"] = "{:.2f}".format((result["global"]["consume_price"] / (result["global"]["total_price"] if result["global"]["total_price"]>0 else 1 )) * 100)
    result["global"]["done_hours"] =  int(result["global"]["done_hours"] / 60)
    for f in faculty_list_dict.values():
        total_price = f["total_price"] if f["total_price"] >0 else 1
        result["faculte"].append({
            **f,
            "done_hours":int(f["done_hours"] / 60),
            "completion_finance": "{:.2f}".format((int(f["consume_price"]) /total_price)*100), 
            "completion_color": statistic_course.get_completion_color((int(f["consume_price"]) /total_price)*100)
        })

    return result
    



@frappe.whitelist()
def statistic_cours_faculte(academic_year,faculty,course_type=None,semestre=None):
    """ Statistique de la faculté pour une année"""
    teaching_units = course.get_teaching_unit_by_year(academic_year=academic_year,faculty=faculty,semestre=None)
    teaching_units_key = teaching_units.keys()
    planning_items = planning.get_all_planning_item_by_filter(academic_year=academic_year,faculty=faculty,semestre=semestre)
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
            "total_price":get_total_price_of_teaching_unit_list(list(teaching_units.values())),
            "done_hours":0,
            "rate_moyenne":get_default_taux(),
            "completion_finance":0,
            "sessions":0,
            "default_currency":frappe.defaults.get_user_default("currency"),
            "default_finance_by_grade":get_default_finance_config(),
            "filiere_count":0
        },
        "filiere":[],
    }   

     #Preparation des kpis de facultes
    filiere_list_dict = {}    
    for value in teaching_units.values():
        for niveau in value["niveau"]:
            if niveau["filiere"] not in filiere_list_dict.keys():
                filiere_found =frappe.get_doc("Field of study",niveau["filiere"])
                filiere_list_dict[niveau["filiere"]] = {
                    "filiere":filiere_found,
                    "sessions":0,
                    "done_hours":0,
                    "total_hours":0,
                    "total_price":0,
                    "completion_finance":0,
                    "consume_price":0,
                    "completion":0,
                    "teaching_unit":[value],
                    "niveau_count":frappe.db.count("Field of study Level",{"parent":filiere_found.name})
                }
                result["global"]["filiere_count"] +=1
            else:
                filiere_list_dict[niveau["filiere"]]["teaching_unit"].append(value)
    
    #Pour chaque teaching unit
    for plan_key in planing_filtred_key:
        planning_items_by_course = planning_items[plan_key]
        result["global"]["sessions"]+=len(planning_items_by_course["planning"])
        hours_done=0
        consume_price = 0
        filiere_found = list(set([x["filiere"] for x in planning_items_by_course["niveau"]]))
        for plan in planning_items_by_course["planning"]:
            period = frappe.get_doc("Planning Period",plan["period"])
            current_hours = datetime.strptime(str(period.heure_de_fin), "%H:%M:%S") - datetime.strptime(str(period.heure_de_debut), "%H:%M:%S")
            consume_price_item = get_price_of_teacher_list_by_donehours(teaching_units[plan_key]["enseignant"],int(current_hours.total_seconds()/3600),plan["type"]) 

            hours_done = hours_done +  int(current_hours.total_seconds()/60)
            for f in filiere_found:
                filiere_list_dict[f]["sessions"] += 1
                filiere_list_dict[f]["consume_price"] +=consume_price_item
            consume_price += consume_price_item

        for f in filiere_found:
            filiere_list_dict[f]["done_hours"] += hours_done
            
        result["global"]["done_hours"] += hours_done
        result["global"]["consume_price"] += consume_price

    result["global"]["completion_finance"] = "{:.2f}".format((result["global"]["consume_price"] / (result["global"]["total_price"] if result["global"]["total_price"]>0 else 1)) * 100)
    result["global"]["done_hours"] =  int(result["global"]["done_hours"] / 60)

    for f in filiere_list_dict.values():
        total_price = get_total_price_of_teaching_unit_list(f["teaching_unit"])
        total_price = total_price if total_price >0 else 1
        f.pop("teaching_unit")

        result["filiere"].append({
            **f,
            "total_price":total_price,
            "done_hours":int(f["done_hours"] / 60),
            "completion": "{:.2f}".format((int(f["consume_price"] / 60) / total_price)*100), 
            "completion_color": statistic_course.get_completion_color((int(f["consume_price"] / 60) / total_price)*100),
        })

    return result




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
            config_payement_list[config_pay.grade]= int(config_pay.prix_heure)
    return config_payement_list


#Calcul du taux par défaut

def get_default_taux():
    config_payment_list = get_default_finance_config()
    somme = sum(config_payment_list.values())
    return somme /( len(config_payment_list) if len(config_payment_list)>0 else 1)

def get_price_of_teacher_list_by_donehours(teacher_list, done_hours, type_planning):
    config_payment_list = get_default_finance_config()
    done_price= 0
    for t in teacher_list:
        if t["type_cours"] != type_planning:
            continue
        teacher = frappe.get_doc("Teacher",t["enseignant"])
        titre = teacher.titre
        if titre in config_payment_list.keys():
            done_price += config_payment_list[titre]*done_hours
        else:
            frappe.throw(f"Configuration manquante<br>Veuillez configurez les prix par haire pour le titre <b>{titre}</b> dans le paneau de configuration général et réessayez")
    
    return done_price

def get_total_price_of_teaching_unit_list(teachint_units):
    total_price = 0
    for t in teachint_units:
        total_price += get_total_price_of_teaching_unit(t)
    
    return total_price
        
def get_total_price_of_teaching_unit(teaching_unit):
    # teacher_list = list(map(lambda:x.enseignant,teaching_unit.table_enseignant))
    config_payment_list = get_default_finance_config()
    list_hours_by_type = {
        "Cours Magistral (CM)":teaching_unit["nombre_dheure_cm"],
        "Travaux Pratique (TP)":teaching_unit["nombre_dheure_tp"],
        "Travaux Dirigés (TD)":teaching_unit["nombre_dheure_td"],
        "Cours":teaching_unit["nombre_dheure_cm"],
    }
    total_price = 0
    for t in teaching_unit["enseignant"]:
        if not t["enseignant"]:
            continue
        teacher = frappe.get_doc("Teacher",t["enseignant"])
        titre = get_titre_of_teacher(teacher)
        
        if titre in config_payment_list.keys():
            total_price += config_payment_list[titre]*int(list_hours_by_type[t["type_cours"]])
        else:
            frappe.throw(f"Configuration manquante<br>Veuillez configurez les prix par heure pour le titre <b>{titre}</b> dans le paneau de configuration général et réessayez")
    
    return total_price+list_hours_by_type["Cours"]


def get_titre_of_teacher(teacher):
    titre  = teacher.titre
    if titre:
        return titre
    grade = teacher.grade
    if grade == "Pr":
        return "Professeur"
    elif grade == "Dr":
        return "Chargé de Cours"
    
    return "Professionnel de Classe D"
