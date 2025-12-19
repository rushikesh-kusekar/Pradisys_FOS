import frappe

def get_permission_query_conditions(user):
    # Always allow Administrator
    if not user or user == "Administrator":
        return ""

    roles = frappe.get_roles(user)

    # Example: Managers see all
    if "FOS Manager" in roles:
        return ""

    # ✅ TODO: change this condition to your actual rule
    # Option A: show only records owned by user
    return f"`tabFOS Case`.owner = {frappe.db.escape(user)}"

    # Option B: if you have a field like assigned_to:
    # return f"`tabFOS Case`.assigned_to = {frappe.db.escape(user)}"


def has_permission(doc, ptype="read", user=None):
    user = user or frappe.session.user
    if user == "Administrator":
        return True

    roles = frappe.get_roles(user)
    if "FOS Manager" in roles:
        return True

    # Must match same logic as query conditions
    return doc.owner == user
