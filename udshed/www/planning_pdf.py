import frappe, json
from datetime import datetime, timedelta
import udshed.api.planning_calendar as planning_calendar
from frappe.utils import getdate, add_days
from frappe.utils.pdf import get_pdf
from frappe.utils import get_url


@frappe.whitelist(allow_guest=False)
def generate_planning_pdf(filters):
    filters = json.loads(filters)
    app_logo = get_url("/assets/udshed/images/logo-basic.png")
    neveau_filiere = frappe.get_doc("Field of study Level",filters["niveau"])
    filiere = frappe.get_doc("Field of study", filters["filiere"])

    company_name = frappe.defaults.get_user_default("Company")
    # company = frappe.get_doc("Company", company_name)
    # company = frappe.defaults.get_user_default("Company")
    # company = frappe.db.get_value("Company", frappe.defaults.get_global_default("company"))

    print("Compagny ",company_name)
    items = frappe.call(
        "udshed.api.planning_calendar.get_week_planning",
        academic_year=filters["academic_year"],
        filiere=filters["filiere"],
        niveau=filters["niveau"],
        week_start=filters["week_start"],
    )
    

    grid = {
        "Monday": {"Morning":None,"Afternoon":None},
        "Tuesday":{"Morning":None,"Afternoon":None},
        "Wednesday":{"Morning":None,"Afternoon":None},
        "Thursday":{"Morning":None,"Afternoon":None},
        "Friday":{"Morning":None,"Afternoon":None},
        "Saturday":{"Morning":None,"Afternoon":None}
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
            # "company_name": company.company_name,
            # "company_logo": company.logo,
            "company_name": "Udshed",
            "company_logo": "",
            "coordinator": neveau_filiere.coordonateur,
            "niveau":neveau_filiere.level,
            "filiere":filiere.name_of_field,
            "app_logo": app_logo,
            "generated_on": datetime.now().strftime("%d/%m/%Y à %H:%M")
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





