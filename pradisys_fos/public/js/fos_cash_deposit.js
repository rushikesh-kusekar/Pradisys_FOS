// Client logic for FOS Cash Deposit
console.log("✅ fos_cash_deposit.js loaded for FOS Cash Deposit");

frappe.ui.form.on("FOS Cash Deposit", {
  // 1) On form refresh → filter child table collections
  refresh(frm) {
    frm.set_query("collection", "collections", function () {
      return {
        filters: [
          ["FOS Collection", "is_deposited", "!=", 1],
          ["FOS Collection", "docstatus", "=", 1],
        ],
      };
    });

    frm.refresh_field("collections");
  },

  // 2) When Day Plan is selected → auto-load undeposited collections
  day_plan(frm) {
    if (!frm.doc.day_plan) {
      return;
    }

    // Optional: set FOS Agent from the Day Plan
    frappe.call({
      method: "frappe.client.get",
      args: {
        doctype: "FOS Day Plan",
        name: frm.doc.day_plan,
      },
      callback(dp) {
        if (dp.message && dp.message.agent && !frm.doc.fos_agent) {
          frm.set_value("fos_agent", dp.message.agent);
        }
      },
    });

    load_collections_for_day_plan(frm);
  },
});

// ─────────────────────────────────────────────
// Helpers – Load undeposited collections
// ─────────────────────────────────────────────

function load_collections_for_day_plan(frm) {
  // If table already has rows, confirm before replacing
  if ((frm.doc.collections || []).length) {
    frappe.confirm(
      __("Replace existing rows with all undeposited collections for this Day Plan?"),
      () => _fetch_and_set_rows(frm)
    );
  } else {
    _fetch_and_set_rows(frm);
  }
}

function _fetch_and_set_rows(frm) {
  frappe.call({
    method: "frappe.client.get_list",
    args: {
      doctype: "FOS Collection",
      filters: {
        day_plan: frm.doc.day_plan,
        is_deposited: 0, // only not-yet-deposited collections
        // Optional: also match agent
        // fos_agent: frm.doc.fos_agent || undefined,
      },
      fields: ["name", "amount"],
      limit_page_length: 500,
    },
    callback(r) {
      const cols = r.message || [];
      frm.clear_table("collections");

      let total = 0;
      cols.forEach((c) => {
        const row = frm.add_child("collections");
        row.collection = c.name;
        row.amount = c.amount;
        total += parseFloat(c.amount || 0);
      });

      frm.refresh_field("collections");

      // Set Amount Deposited = sum of all collection amounts
      frm.set_value("amount_deposited", total);

      // If you want a popup, uncomment:
      // frappe.msgprint(
      //   __(
      //     "Loaded {0} collections for this Day Plan. Total amount: {1}",
      //     [cols.length, total]
      //   )
      // );
    },
  });
}
