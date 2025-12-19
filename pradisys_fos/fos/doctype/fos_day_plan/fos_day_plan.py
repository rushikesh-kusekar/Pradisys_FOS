# apps/pradisys_fos/pradisys_fos/pradisys_fos/doctype/fos_day_plan/fos_day_plan.py

import frappe
from frappe.model.document import Document
from frappe import _


class FOSDayPlan(Document):
    """
    Controller for FOS Day Plan.

    This merges the behaviours you previously had in Server Scripts:
    - "FOS Day Plan" (After Submit)
    - "FOS Agent Assign" (After Submit)
    - "FOS Day plan Cancel" (After Cancel)
    """

    def on_submit(self):
        """
        After Submit:
        1) Link each Case with this Day Plan
        2) Mark is_in_day_plan = 1 on FOS Case
        3) Push visit_date from plan_date (if present)
        4) Set Case.agent = row.agent OR Day Plan.agent
           (only if Case.agent is currently empty)
        """

        parent_agent = self.agent  # Agent on Day Plan header
        plan_date = self.get("plan_date")

        for row in (self.day_plan_items or []):
            if not row.case:
                continue

            updates: dict[str, object] = {
                "is_in_day_plan": 1,
                "day_plan": self.name,
            }

            # Optional: visit_date from plan_date
            if plan_date:
                updates["visit_date"] = plan_date

            # --- Agent assignment logic ---
            # Some sites do NOT have an `agent` field on the child table,
            # so we must read it safely to avoid AttributeError.
            row_agent = getattr(row, "agent", None)
            target_agent = row_agent or parent_agent

            if target_agent:
                current_agent = frappe.db.get_value("FOS Case", row.case, "agent")
                # Only assign if Case.agent is empty (don't override)
                if not current_agent:
                    updates["agent"] = target_agent

            # Apply all updates in one DB call
            frappe.db.set_value("FOS Case", row.case, updates)

        frappe.msgprint(
            _("Linked Cases are marked 'in Day Plan' and agent info is updated."),
            alert=True,
        )

    def on_cancel(self):
        """
        After Cancel:
        1) Remove link to this Day Plan from each Case
        2) Set is_in_day_plan = 0
        3) Clear visit_date
        4) Clear agent IF the Case was linked to THIS Day Plan
        """

        for row in (self.day_plan_items or []):
            if not row.case:
                continue

            # Which Day Plan is currently set on the Case?
            case_day_plan = frappe.db.get_value("FOS Case", row.case, "day_plan")

            updates: dict[str, object] = {
                "is_in_day_plan": 0,
                "day_plan": None,
                "visit_date": None,
            }

            # Only clear agent if this Case was linked to THIS Day Plan
            if case_day_plan == self.name:
                updates["agent"] = None

            frappe.db.set_value("FOS Case", row.case, updates)

        frappe.msgprint(
            _("Linked Cases are detached from this Day Plan."),
            alert=True,
        )
