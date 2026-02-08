import frappe, json
from datetime import datetime, timedelta
import udshed.api.planning_calendar as planning_calendar
from frappe.utils import getdate, add_days
from frappe.utils.pdf import get_pdf

@frappe.whitelist()
def generate_planning_pdf():
    filters = json.loads(frappe.form_dict.filters) if frappe.form_dict.filters else {}
    print_week_planning(
        filiere=filters.get("filiere"),
        niveau=filters.get("niveau"),
        academic_year=filters.get("academic_year"),
        week_start=filters.get("week_start")
    )

def print_week_planning(academic_year, filiere, niveau, week_start):

    data = planning_calendar.get_week_planning(academic_year, filiere, niveau, week_start)

    week_start_dt = datetime.fromisoformat(week_start)
    week_end = week_start_dt + timedelta(days=6)

    planning = build_planning_grid(data, week_start_dt)

    context = {
        "academic_year": academic_year,
        "faculty": frappe.db.get_value("Field of study", filiere, "faculte"),
        "filiere": filiere,
        "niveau": niveau,
        "week_start": week_start_dt.strftime("%d %B %Y"),
        "week_end": week_end.strftime("%d %B %Y"),
        "days": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        "planning": planning
    }

    html = frappe.render_template("udshed/www/planning_pdf.html", context)
    pdf = frappe.utils.pdf.get_pdf(html)

    frappe.local.response.filename = "planning.pdf"
    frappe.local.response.filecontent = pdf
    frappe.local.response.type = "download"



DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

def build_planning_grid(data, week_start):
    grid = {
        "morning": {d: [] for d in DAYS},
        "afternoon": {d: [] for d in DAYS},
    }

    for item in data:
        day_index = item["date"].weekday()
        if day_index > 5:
            continue

        day = DAYS[day_index]
        period = "morning" if item["period"] == "Matin" else "afternoon"

        type_map = {
            "Cours": "cours",
            "Travaux Pratiques (TP)": "tp",
            "Controle Continue (CC)": "cc",
            "Examen": "exam",
        }

        grid[period][day].append({
            "course": item["course"],
            "label": item["type"],
            "type": type_map.get(item["type"], "cours"),
            "prof1": item["enseignant"],
            "prof2": ""
        })

    return grid
