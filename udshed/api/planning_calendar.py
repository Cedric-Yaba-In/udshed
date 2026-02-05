import frappe

@frappe.whitelist()
def get_week_planning(filiere, niveau, academic_year, week_start):
    return frappe.get_all(
        "Planning Item",
        filters={
            "filiere": filiere,
            "niveau": niveau,
            "academic_year": academic_year,
            "week_start": week_start
        },
        fields=[
            "name",
            "day_of_week",
            "half_day",
            "course",
            "teacher",
            "room"
        ]
    )