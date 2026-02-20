import frappe
import os
import base64
from datetime import datetime, timedelta
import udshed.api.school_setting as school_setting
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

def load_school_logo(school_logo):
    file_doc = frappe.get_doc("File", {"file_url": school_logo})
    file_path = file_doc.get_full_path()

    with open(file_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode()

    return f"data:image/png;base64,{encoded}"


def get_app_logo():
    logo_path = os.path.join(
        frappe.get_app_path("udshed"),"public","images","logo.png"
    )
    with open(logo_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode()    
    return f"data:image/png;base64,{encoded}"


@frappe.whitelist(allow_guest=False)
def generate_planning_pdf(filters):

    app_logo = get_app_logo()

    filiere = None
    niveau_filiere = None
    teacher = None

    if filters["filiere"]:
        filiere_filter = filters["filiere"]
        filiere = frappe.get_doc("Field of study", filiere_filter)
    else:
        filiere_filter = None

    if "niveau" in filters and  filters["niveau"]:
        niveau_filter = filters["niveau"]
        niveau_filiere = frappe.get_doc("Field of study Level",filters["niveau"])
    else:
        niveau_filter = None

    if filters["teacher"]:
        teacher = frappe.get_doc("Teacher", {"name": filters["teacher"]})
        teacher_filter = filters["teacher"]
    else:
        teacher_filter = None

    school_name, school_logo = school_setting.get_school_data()
    school_logo = load_school_logo(school_logo)
    


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
    if teacher:
        data_to_print["teacher"] = f"{teacher.grade}. {teacher.first_name} {teacher.last_name}"
    if filiere:
        data_to_print["filiere"]=filiere.name_of_field
        
    if  niveau_filiere:
        data_to_print["coordinator"] =  niveau_filiere.coordonateur
        data_to_print["niveau"]=niveau_filiere.level
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
        planning_name += f" {teacher.first_name} {teacher.last_name}"
    
    planning_name += f" du {start.strftime('%d %B')}  au {end.strftime('%d %B')} {filters['academic_year']}.pdf"
    return pdf,planning_name,items,start,end
