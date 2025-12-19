import frappe

def get_permission_query_conditions(user):
    if not user or user == "Administrator":
        return ""

    roles = frappe.get_roles(user)
    if "FOS Manager" in roles:
        return ""

    # ✅ TODO: adjust field name for your DocType
    return f"`tabFOS Collection`.owner = {frappe.db.escape(user)}"


def has_permission(doc, ptype="read", user=None):
    user = user or frappe.session.user
    if user == "Administrator":
        return True

    roles = frappe.get_roles(user)
    if "FOS Manager" in roles:
        return True

    return doc.owner == user
