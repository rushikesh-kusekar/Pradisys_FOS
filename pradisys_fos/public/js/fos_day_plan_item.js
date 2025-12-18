// Client logic for FOS Day Plan Item (grid row) - DEBUG v3
// Button fieldname = "details" (label in UI can be "Start Visit")
console.log("✅ fos_day_plan_item.js loaded (debug v3) for FOS Day Plan Item");

frappe.ui.form.on("FOS Day Plan Item", {
  // 1) When user selects a Case in the row
  case(frm, cdt, cdn) {
    console.log("▶ [FOS Day Plan Item] case() triggered", cdt, cdn);
    const row = locals[cdt][cdn];

    if (!row || !row.case) {
      console.log("⚠ No case set on row");
      return;
    }

    frappe.call({
      method: "frappe.client.get",
      args: {
        doctype: "FOS Case",
        name: row.case,
      },
      callback(r) {
        if (!r || !r.message) {
          console.log("⚠ No FOS Case data returned for", row.case);
          return;
        }
        const d = r.message;

        // Fill row values from FOS Case
        frappe.model.set_value(cdt, cdn, "customer", d.fos_customer || "");
        frappe.model.set_value(cdt, cdn, "address", d.current_address || "");

        // Auto-set agent on Day Plan header if available
        if (d.fos_agent) {
          frm.set_value("fos_agent", d.fos_agent);
        }

        console.log("✅ Row filled from FOS Case", d.name);
      },
    });
  },

  // 2) "Start Visit" button → fieldname = details
  //    Open the linked FOS Case so agent can track visit there.
  details(frm, cdt, cdn) {
    console.log("▶ [FOS Day Plan Item] details() / Start Visit clicked", cdt, cdn);
    frappe.msgprint("Debug: Start Visit (details) button clicked");
    open_case_from_row(frm, cdt, cdn, "details");
  },
});

// Shared helper: navigate to Case from a row
function open_case_from_row(frm, cdt, cdn, source) {
  const row = locals[cdt][cdn];

  if (!row || !row.case) {
    frappe.msgprint(__("Please select a Case first."));
    console.warn("⚠ No case in row for", source, "handler");
    return;
  }

  console.log(`🚀 Routing to FOS Case ${row.case} from ${source}`);
  frappe.set_route("Form", "FOS Case", row.case);
}
