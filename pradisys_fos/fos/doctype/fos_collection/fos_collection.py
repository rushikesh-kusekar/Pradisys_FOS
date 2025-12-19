import frappe
from frappe.model.document import Document
from frappe import _


class FOSCollection(Document):
    """Controller for FOS Collection."""

    # -------- BEFORE SAVE / VALIDATE --------
    def validate(self):
        """
        Backend version of Server Script:
        'FOS Collection Day Plan Link' (Before Save / Before Insert).

        Auto-link Day Plan from selected Case, if not set.
        """
        if self.case and not self.day_plan:
            self.day_plan = frappe.db.get_value("FOS Case", self.case, "day_plan")

    # -------- HELPER --------
    @staticmethod
    def _to_number(val):
        try:
            return float(val or 0)
        except Exception:
            return 0.0

    # -------- AFTER SUBMIT --------
    def on_submit(self):
        """
        Backend version of Server Script:
        'FOS Collection 2' (After Submit).

        Updates FOS Case pending/outstanding and all related Day Plan Items
        + Day Plan status based on this collection.
        """
        if not (self.case and self.amount):
            return

        collection_amount = self._to_number(self.amount)

        if collection_amount <= 0:
            frappe.throw(_("Collection Amount must be greater than zero."))

        # ---- 1) Load related Case ----
        case = frappe.get_doc("FOS Case", self.case)

        overdue = self._to_number(case.overdue_amt)
        pending = self._to_number(case.pending_amount)

        # Outstanding = Pending if present, else Overdue
        outstanding = pending if pending > 0 else overdue

        if outstanding <= 0:
            return

        if collection_amount > outstanding:
            frappe.throw(
                _(
                    "Collection Amount {0} cannot be greater than outstanding {1} "
                    "for Case {2}."
                ).format(collection_amount, outstanding, case.name)
            )

        # ---- 2) Calculate new pending + status on CASE ----
        new_pending = outstanding - collection_amount
        if new_pending > 0:
            new_status = "Pending"
        else:
            new_pending = 0
            new_status = "Closed"

        case.db_set("pending_amount", new_pending)
        case.db_set("status", new_status)

        # ---- 3) Update all Day Plan Items for this Case ----
        day_plan_items = frappe.get_all(
            "FOS Day Plan Item",
            filters={"case": case.name},
            fields=["name", "parent"],
        )

        parents = set()

        for row in day_plan_items:
            frappe.db.set_value(
                "FOS Day Plan Item",
                row.name,
                {
                    "pending_amount": new_pending,
                    "status": new_status,
                },
            )
            if row.parent:
                parents.add(row.parent)

        # ---- 4) For each related Day Plan, decide new parent status ----
        for parent_name in parents:
            try:
                dp = frappe.get_doc("FOS Day Plan", parent_name)
                rows = [r for r in (dp.day_plan_items or []) if r.case]

                # if all rows closed -> Completed
                if rows and all((r.status or "").strip() == "Closed" for r in rows):
                    frappe.db.set_value(
                        "FOS Day Plan", parent_name, "status", "Completed"
                    )
                else:
                    # otherwise mark In Progress (unless already Completed/Cancelled)
                    if dp.status in (None, "", "Draft", "Planned"):
                        frappe.db.set_value(
                            "FOS Day Plan", parent_name, "status", "In Progress"
                        )
            except Exception:
                # ignore errors in individual parents – don't break submit
                pass
