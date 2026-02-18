import frappe, json
from datetime import datetime, timedelta
import udshed.api.planning_calendar as planning_calendar
from frappe.utils import getdate, add_days
from frappe.utils.pdf import get_pdf
from frappe.utils import get_url

def get_unique_sorted_period(periods):
    set_period = {}
    unique = []
    for d in periods:
        if d["name"] not in set_period:
            set_period[d["name"]]=d["name"]
            unique.append({
                "name": d["name"],
                "label": set_period[d["name"]]
            })
            
    return sorted(unique,key = lambda x: x["name"])

def get_valid_period(periods,items):
    periods_to_valid = {}
    for period in periods:
        periods_to_valid[period["name"]] = False
    for item in items:
         period= item["period"]
         if period not in periods_to_valid:
             continue
         periods_to_valid[period] = True
    return [p for p in periods if periods_to_valid[p["name"]]]
    

@frappe.whitelist(allow_guest=False)
def generate_planning_pdf(filters):
    filters = json.loads(filters)
    app_logo = get_url("/assets/udshed/images/logo.png")
    filiere = None
    niveau_filiere = None
    Teacher = None

    if filters["filiere"]:
        filiere = frappe.get_doc("Field of study", filters["filiere"])
        filiere_filter = filters["filiere"]
    else:
        filiere_filter = None

    if "niveau" in filters and  filters["niveau"]:
        niveau_filter = filters["filiere"]
        niveau_filiere = frappe.get_doc("Field of study Level",filters["niveau"])
    else:
        niveau_filter = None

    if filters["teacher"]:
        Teacher = frappe.get_doc("Teacher", {"name": filters["teacher"]})
        teacher_filter = filters["teacher"]
    else:
        teacher_filter = None

    
    setting= frappe.get_single("Udshed Setting")
    school_name = ""
    school_logo =""
    if setting.school_name:
        school_name = setting.school_name
    
    if setting.school_logo:
        school_logo = get_url(setting.school_logo)


    items = frappe.call(
        "udshed.api.planning_calendar.get_week_planning",
        academic_year=filters["academic_year"],
        filiere=filiere_filter,
        niveau=niveau_filter,
        teacher=teacher_filter,
        week_start=filters["week_start"],
    )

    if "niveau" in filters and  filters["niveau"]:
        period = get_valid_period(get_unique_sorted_period(planning_calendar.get_period(niveau_filiere.name)), items)
        if len(period)==0:
            period = get_unique_sorted_period(planning_calendar.get_period(niveau_filiere.name))
    else:
        period = get_valid_period(get_unique_sorted_period(planning_calendar.get_all_periods()),items)
        if len(period)==0:
            period = get_unique_sorted_period(planning_calendar.get_default_period())

    

    grid = {
        "Monday": {},
        "Tuesday":{},
        "Wednesday":{},
        "Thursday":{},
        "Friday":{},
        "Saturday":{}
    }

    for it in items:
        day = it["date"].strftime("%A")
        half = it["period"]
        css = {
            "Cours":"cm",
            "Traveaux Pratiques (TP)":"tp",
            "Controlle Continue (CC)":"cc",
            "Examen de session normal":"exam",
            "Examen de rattrapage":"exam"
        }.get(it["type"],"cm")

        grid[day][half] = {
            "subject": it["course"],
            "cours_label": it["cours_label"],
            "type": it["type"],
            "batiment": it["batiment"],
            "salle": it["salle"],
            "teachers": [it["enseignant"]],
            "mode":it["mode"],
            "filiere":it["filiere"],
            "niveau_label":it["niveau_label"],
            "css": css
        }

    start = datetime.strptime(filters["week_start"],"%Y-%m-%d")
    end = start + timedelta(days=6)
    data_to_print = {
            "grid":grid,
            "filters":filters,
            "week_start": start.strftime("%d %B %Y"),
            "week_end": end.strftime("%d %B %Y"),
            "school_name": school_name,
            "school_logo": school_logo,
            "app_logo": app_logo,
            "generated_on": datetime.now().strftime("%d/%m/%Y à %H:%M"),
            "period":period
        }
    if Teacher:
        data_to_print["teacher"] = f"{Teacher.grade}. {Teacher.first_name} {Teacher.last_name}"
    if filiere:
        data_to_print["filiere"]=filiere.name_of_field,
        
    if  niveau_filiere:
        data_to_print["coordinator"] =  niveau_filiere.coordonateur,
        data_to_print["niveau"]=niveau_filiere.level,
    print("Data to print ",data_to_print)
    html = frappe.render_template(
        "udshed/www/planning_pdf.html",
        data_to_print
    )

    pdf = get_pdf(html,{
    "orientation": "Landscape",
    "page-size": "A4",
    "margin-top": "10mm",
    "margin-bottom": "10mm",
    "margin-left": "12mm",
    "margin-right": "12mm",
})
    planning_name = "Planning"
    if filiere:
        planning_name += f" {filiere.field_of_study_code}"
    if niveau_filiere:
        planning_name += f" {niveau_filiere.level}"
    if teacher_filter:
        planning_name += f" {Teacher.first_name} {Teacher.last_name}"
    
    planning_name += f" du {start.strftime('%d %B')}  au {end.strftime('%d %B')} {filters['academic_year']}.pdf"

    frappe.local.response.filename = planning_name
    frappe.local.response.filecontent = pdf
    frappe.local.response.type = "pdf"





