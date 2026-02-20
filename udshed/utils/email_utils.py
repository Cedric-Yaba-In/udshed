import frappe

def get_formatted_sender(name="Udshed", email=None):
    """
    Retourne un expéditeur formaté correctement
    """
    if not email:
        # Essayer de récupérer l'email par défaut
        email = frappe.db.get_value("Email Account", 
            {"default_outgoing": 1}, "email_id")
        
        if not email:
            # Fallback sur l'email de l'utilisateur
            email = frappe.session.user
    
    return f"{name} <{email}>"