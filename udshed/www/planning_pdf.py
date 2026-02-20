import frappe, json
import udshed.api.planning_calendar_pdf as planning_calendar_pdf

@frappe.whitelist()
def download_planning_pdf(filters):
    filters = json.loads(filters)
    pdf, planning_name,items,_,_ = planning_calendar_pdf.generate_planning_pdf(filters)
    frappe.local.response.filename = planning_name
    frappe.local.response.filecontent = pdf
    frappe.local.response.type = "pdf"





