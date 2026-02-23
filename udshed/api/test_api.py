import frappe
from frappe import _

@frappe.whitelist()
def get_academic_dashboard(academic_year=None, faculty=None, filiere=None, niveau=None):

    # -----------------------------
    # STATIC MOCK DATA
    # -----------------------------

    total_courses = 320
    completed_courses = 250
    pending_courses = total_courses - completed_courses

    total_cc = 60
    completed_cc = 45
    pending_cc = total_cc - completed_cc

    execution_rate = round((completed_courses / total_courses) * 100, 2)

    monthly_evolution = {
        "labels": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        "datasets": [
            {
                "name": "Cours réalisés",
                "values": [30, 45, 40, 50, 55, 30]
            }
        ]
    }

    by_filiere = {
        "labels": ["Informatique", "Gestion", "Droit"],
        "datasets": [
            {
                "values": [85, 60, 92]
            }
        ]
    }

    alerts = [
        {
            "type": "warning",
            "message": "Filière Gestion en dessous de 65% d'exécution"
        },
        {
            "type": "danger",
            "message": "15 CC non programmés"
        }
    ]

    return {
        "kpis": {
            "total_courses": total_courses,
            "completed_courses": completed_courses,
            "pending_courses": pending_courses,
            "total_cc": total_cc,
            "completed_cc": completed_cc,
            "execution_rate": execution_rate
        },
        "monthly_evolution": monthly_evolution,
        "by_filiere": by_filiere,
        "alerts": alerts
    }