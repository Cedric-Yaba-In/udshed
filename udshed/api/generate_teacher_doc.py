import frappe
import os
import base64
from frappe import _
from docxtpl import DocxTemplate
from io import BytesIO

def load_template(template_file, from_file_db=True):
    if from_file_db:
        file_name = frappe.db.get_value("File", {"file_url": template_file}, "name")
        template_file = frappe.get_doc("File", file_name)
        return DocxTemplate(template_file.get_full_path())
    
    temp_path = os.path.join(
        frappe.get_app_path("udshed"),"templates","words",template_file
    )
    return  DocxTemplate(temp_path)

@frappe.whitelist()
def download_contract_to_signed():
    tpl = load_template("teacher_contract_tpl.docx",False)

    connected_user = frappe.get_doc("User ",frappe.session.user)
    obj = {
        "full_name":connected_user.name,
        "email":connected_user.email,
        "titre":"",
        "grade":"",
        "phone":connected_user.phone
    }
    if frappe.db.exists("Teacher ",{"email":connected_user.email}):
        teacher_data = frappe.get_doc("Teacher",{"email":connected_user.email})
        obj = {
            **obj,
            "full_name":teacher_data.name,
            "titre":teacher_data.titre,
            "grade":teacher_data.grade,
        }

    tpl.render(obj)

    # Sauvegarder en mémoire
    output = BytesIO()
    tpl.save(output)
    output.seek(0)

    # Récupérer le contenu binaire
    file_content = output.getvalue()
    return base64.b64encode(file_content).decode()

@frappe.whitelist()
def download_signed_contract(url_file):
    doc = load_template(url_file,True)
    doc.render({})

    # Sauvegarder en mémoire
    output = BytesIO()
    doc.save(output)
    output.seek(0)

    # Récupérer le contenu binaire
    file_content = output.getvalue()
    return base64.b64encode(file_content).decode()