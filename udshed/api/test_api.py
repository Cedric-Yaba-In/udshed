import frappe
from frappe import _

@frappe.whitelist()
def get_dashboard_stats(academic_year, week_start, filiere=None):

    # Exemple simplifié
    planning = frappe.get_all(
        "Planning Item",
        filters={
            "academic_year": academic_year
        },
        fields=["cours", "date", "salle"]
    )

    total_courses = len(planning)
    total_teachers = 0
    rooms_used = len(set(p["salle"] for p in planning if p["salle"]))
    total_hours = total_courses * 2  # exemple

    chart_data = {}
    for p in planning:
        day = str(p["date"])
        chart_data.setdefault(day, 0)
        chart_data[day] += 2

    return {
        "kpi": {
            "total_courses": total_courses,
            "total_hours": total_hours,
            "total_teachers": total_teachers,
            "rooms_used": rooms_used
        },
        "chart": {
            "labels": list(chart_data.keys()),
            "values": list(chart_data.values())
        },
        "table": planning
    }