import frappe

def get_unique_sorted_period(periods):
    set_period = {}
    unique = []
    print("Periods ",periods)
    for d in periods:
        if d["name"] not in set_period:
            set_period[d["name"]]=d["name"]
            data_to_set = {
                "name": d["name"],
                "label": set_period[d["name"]],
                "libelle":d["libelle"],
                "heure_de_debut":d["heure_de_debut"],
                "heure_de_fin":d["heure_de_fin"]
            }
            if "fuseau_horaire" in d:
                data_to_set["fuseau_horaire"] = d["fuseau_horaire"]
            unique.append(data_to_set)
            
    return sorted(unique,key = lambda x: x["name"])


@frappe.whitelist()
def get_period(field_of_study_level):
    calendar_name = frappe.get_doc("Field of study Level",field_of_study_level).calendrier
    calendar = frappe.get_doc("Calendar Planing",{"name":calendar_name})
    periods = frappe.db.get_all('Planning Period', filters={"parent":calendar_name},fields=["name","libelle","heure_de_debut","heure_de_fin"])
    return get_unique_sorted_period([{"name":p.name,"libelle": p.libelle,"fuseau_horaire":calendar.fuseau_horaire,"heure_de_debut":p.heure_de_debut,"heure_de_fin":p.heure_de_fin} for p in periods])

@frappe.whitelist()
def get_all_periods():
    periods = frappe.db.get_all('Planning Period',fields=["name","libelle","heure_de_debut","heure_de_fin"])
    result_periods = []
    calendar_list = {}
    for period in periods:
        if period.name not in calendar_list:
            calendar_list[period.name] = frappe.get_doc("Calendar Planing", period.name)
        result_periods.append({"name":period.name, "libelle": period.libelle, "fuseau_horaire":calendar_list[period.name].fuseau_horaire,"heure_de_debut":period.heure_de_debut,"heure_de_fin":period.heure_de_fin})
    return get_unique_sorted_period(result_periods)


@frappe.whitelist()
def get_default_period():
    calendar = frappe.get_doc("Calendar Planing", "Defaut")
    periods = frappe.get_all('Planning Period', filters={"parent":calendar.name},fields=["name","libelle","heure_de_debut","heure_de_fin"])
    return  get_unique_sorted_period([{"name":p.name,"libelle": p.libelle,"fuseau_horaire":calendar.fuseau_horaire,"heure_de_debut":p.heure_de_debut,"heure_de_fin":p.heure_de_fin} for p in periods])

