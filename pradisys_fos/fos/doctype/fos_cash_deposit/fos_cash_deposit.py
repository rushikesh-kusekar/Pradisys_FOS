# apps/pradisys_fos/pradisys_fos/pradisys_fos/doctype/fos_cash_deposit/fos_cash_deposit.py

import frappe
from frappe.model.document import Document
from frappe import _


class FOSCashDeposit(Document):
    """Controller for FOS Cash Deposit."""

    def on_submit(self):
        """On submit, mark linked FOS Collections as deposited."""
        if self.collections:
            for row in self.collections:
                if row.collection:
                    frappe.db.set_value(
                        "FOS Collection",
                        row.collection,
                        "is_deposited",
                        1,
                    )

        frappe.msgprint(_("Selected collections are marked as Deposited."))
