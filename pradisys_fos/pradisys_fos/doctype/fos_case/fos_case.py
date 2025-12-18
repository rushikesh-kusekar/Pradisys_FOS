import frappe
from frappe.model.document import Document
from frappe import _


class FOSCase(Document):
    """Controller for FOS Case."""

    def validate(self):
        """
        Backend version of Server Script:
        'FOS Case KYC Status' (After Save).

        Auto-update Case.status based on outcome_type.
        """
        self._update_status_from_outcome_type()

    # ---------- Helpers ----------

    def _update_status_from_outcome_type(self):
        """Apply the same logic that was in the Server Script."""
        if not self.outcome_type:
            return

        # If visit is completed, mark case as Closed
        if self.outcome_type == "Completed":
            self.status = "Closed"
        else:
            # For any other outcome, keep it Pending
            # (only change if it is not already Closed)
            if self.status in (None, "", "Open", "Visit Planned", "Pending"):
                self.status = "Pending"


# -------------------------------------------------------------------
# Permission helpers for FOS Case
# -------------------------------------------------------------------


def get_permission_query_conditions(user: str | None = None) -> str | None:
    """
    Restrict FOS Agents to only their own linked cases.

    This replaces the Server Script "FOS Case Permission" (Permission Query).
    """
    if not user:
        user = frappe.session.user

    # 1) Get roles for the current user
    roles = frappe.get_all(
        "Has Role",
        filters={"parent": user},
        pluck="role",
    )

    # 2) Let System Manager and FOS Manager see everything
    if "System Manager" in roles or "FOS Manager" in roles:
        return None  # no extra condition

    # 3) Find the field in FOS Agent that links to User
    meta = frappe.get_meta("FOS Agent")
    user_link_fieldname = None

    for df in meta.fields:
        if df.fieldtype == "Link" and df.options == "User":
            user_link_fieldname = df.fieldname
            break

    # If we couldn't find a User link field, don't restrict
    if not user_link_fieldname:
        return None

    user_escaped = frappe.db.escape(user)

    # 4) Build the condition string (Frappe will AND it with existing conditions)
    condition = f"""
        `tabFOS Case`.`agent` in (
            select name
            from `tabFOS Agent`
            where `{user_link_fieldname}` = {user_escaped}
        )
    """

    return condition


def has_permission(doc, user: str | None = None) -> bool:
    """
    Extra safety: for a single FOS Case document, check if user can access it.

    - System Manager / FOS Manager: always True
    - Otherwise: user must be the linked User on the FOS Agent in doc.agent
    """
    if not user:
        user = frappe.session.user

    if user == "Administrator":
        return True

    roles = frappe.get_all(
        "Has Role",
        filters={"parent": user},
        pluck="role",
    )

    if "System Manager" in roles or "FOS Manager" in roles:
        return True

    # Same logic: find the User link field on FOS Agent
    meta = frappe.get_meta("FOS Agent")
    user_link_fieldname = None

    for df in meta.fields:
        if df.fieldtype == "Link" and df.options == "User":
            user_link_fieldname = df.fieldname
            break

    if not user_link_fieldname or not doc.agent:
        return False

    # Check whether this user's agent record matches doc.agent
    count = frappe.db.count(
        "FOS Agent",
        {
            "name": doc.agent,
            user_link_fieldname: user,
        },
    )

    return count > 0
