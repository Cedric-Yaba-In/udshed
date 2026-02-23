import frappe

def get_school_setting():
    return frappe.get_single("Udshed Setting")

def get_school_name():
    setting  = get_school_setting()
    if setting.school_name:
        return setting.school_name
    return ""

def get_school_logo():
    setting  = get_school_setting()
    if setting.school_logo:
        return setting.school_logo
    return ""

def get_school_data():
    return get_school_name(), get_school_logo()