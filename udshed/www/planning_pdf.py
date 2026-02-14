import frappe, json
from datetime import datetime, timedelta
import udshed.api.planning_calendar as planning_calendar
from frappe.utils import getdate, add_days
from frappe.utils.pdf import get_pdf
from frappe.utils import get_url



@frappe.whitelist(allow_guest=False)
def generate_planning_pdf(filters):
    filters = json.loads(filters)
    app_logo = get_url("/assets/udshed/images/logo.png")
    print("app_lien ",app_logo)
    neveau_filiere = frappe.get_doc("Field of study Level",filters["niveau"])
    filiere = frappe.get_doc("Field of study", filters["filiere"])
    period = planning_calendar.get_period()
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
        filiere=filters["filiere"],
        niveau=filters["niveau"],
        week_start=filters["week_start"],
    )
    

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
            "css": css
        }

    start = datetime.strptime(filters["week_start"],"%Y-%m-%d")
    end = start + timedelta(days=6)

    html = frappe.render_template(
        "udshed/www/planning_pdf.html",
        {
            "grid":grid,
            "filters":filters,
            "week_start": start.strftime("%d %B %Y"),
            "week_end": end.strftime("%d %B %Y"),
            "school_name": school_name,
            "school_logo": school_logo,
            "coordinator": neveau_filiere.coordonateur,
            "niveau":neveau_filiere.level,
            "filiere":filiere.name_of_field,
            "app_logo": app_logo,
            "generated_on": datetime.now().strftime("%d/%m/%Y à %H:%M"),
            "period":period
        }
    )

    pdf = get_pdf(html,{
    "orientation": "Landscape",
    "page-size": "A4",
    "margin-top": "10mm",
    "margin-bottom": "10mm",
    "margin-left": "12mm",
    "margin-right": "12mm",
})

    frappe.local.response.filename = "planning.pdf"
    frappe.local.response.filecontent = pdf
    frappe.local.response.type = "pdf"





