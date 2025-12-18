// Client logic for FOS Day Plan (loaded via doctype_js)
console.log("✅ fos_day_plan.js loaded for FOS Day Plan");

frappe.ui.form.on("FOS Day Plan", {
  onload(frm) {
    const table_fieldname = "day_plan_items";

    if (!frm.fields_dict[table_fieldname]) return;

    // Filter "Case" field inside child table
    frm.set_query("case", table_fieldname, function (doc, cdt, cdn) {
      if (!doc.region) {
        frappe.msgprint(__("Please set Region first."));
      }

      return {
        filters: [
          ["FOS Case", "region", "=", doc.region || ""],
          ["FOS Case", "status", "in", ["Open", "Pending"]],
          ["FOS Case", "is_in_day_plan", "=", 0], // not already in day plan
        ],
      };
    });
  },

  refresh(frm) {
    calculate_total_planned_amount(frm);
  },

  // 🔹 NEW: before_save – build full_name_for_doc = <agent>_<plan_date>
  before_save(frm) {
    const agent = (frm.doc.agent || frm.doc.agent_name || "").trim();
    const plan_date = frm.doc.plan_date;

    if (!agent || !plan_date) {
      // Nothing to do — optional: you could block save here
      return;
    }

    const name_value = agent + "_" + plan_date; // plan_date is YYYY-MM-DD
    frm.set_value("full_name_for_doc", name_value);
  },

  day_plan_items_add(frm) {
    calculate_total_planned_amount(frm);
  },

  day_plan_items_remove(frm) {
    calculate_total_planned_amount(frm);
  },

  // When Region changes → filter agents + auto-fill cases
  region(frm) {
    filter_agents_by_region(frm);
    auto_fill_cases(frm);
  },

  // When Agent changes → auto-fill cases
  agent(frm) {
    auto_fill_cases(frm);
  },

  // Start Day button (fieldname = start_day)
  start_day(frm) {
    start_day_with_location(frm);
  },

  // End Day button (fieldname = end_day)
  end_day(frm) {
    end_day_with_location(frm);
  },
});

// ─────────────────────────────────────────────
// Filter Agents by Region
// ─────────────────────────────────────────────

function filter_agents_by_region(frm) {
  if (!frm.doc.region) return;

  frm.set_query("agent", function () {
    return {
      filters: {
        region: frm.doc.region, // only show agents of this region
      },
    };
  });
}

// ─────────────────────────────────────────────
// Auto-fill Cases for Region + Agent
// ─────────────────────────────────────────────

function auto_fill_cases(frm) {
  // only in Draft
  if (frm.doc.docstatus !== 0) return;

  if (!frm.doc.agent || !frm.doc.region) {
    return;
  }

  if ((frm.doc.day_plan_items || []).length) {
    frappe.confirm(
      __(
        "Load all open cases for Region {0}? Existing rows will be replaced.",
        [frm.doc.region]
      ),
      () => fetch_and_set_cases(frm)
    );
  } else {
    fetch_and_set_cases(frm);
  }
}

function fetch_and_set_cases(frm) {
  frappe.call({
    method: "frappe.client.get_list",
    args: {
      doctype: "FOS Case",
      filters: {
        region: frm.doc.region,
        status: ["in", ["Open", "Pending"]],
        is_in_day_plan: 0,
      },
      fields: ["name", "fos_customer", "status", "overdue_amt", "pending_amount"],
      limit_page_length: 500,
    },
    callback(r) {
      const cases = r.message || [];

      frm.clear_table("day_plan_items");

      cases.forEach((c) => {
        const row = frm.add_child("day_plan_items");
        row.case = c.name;
        row.customer = c.fos_customer;
        row.status = c.status;
        row.overdue_amount = c.overdue_amt;
        row.pending_amount = c.pending_amount;
      });

      frm.refresh_field("day_plan_items");
      calculate_total_planned_amount(frm);
    },
  });
}

// ─────────────────────────────────────────────
// Helper Functions – totals
// ─────────────────────────────────────────────

function to_number(val) {
  if (!val) return 0;
  if (typeof val === "number") return val;

  if (typeof val === "string") {
    const cleaned = val.replace(/[^\d.-]/g, "");
    if (!cleaned) return 0;
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  return 0;
}

function calculate_total_planned_amount(frm) {
  let total = 0;

  (frm.doc.day_plan_items || []).forEach((row) => {
    const pending = to_number(
      row.pending_amount || row.pending_amt || row.pending
    );
    const overdue = to_number(
      row.overdue_amount || row.overdue_amt || row.overdue
    );

    const row_value = pending > 0 ? pending : overdue;
    total += row_value;
  });

  frm.set_value("total_planned_amount", total);
  frm.refresh_field("total_planned_amount");
}

// ─────────────────────────────────────────────
// Start/End Day with GPS
// ─────────────────────────────────────────────

function start_day_with_location(frm) {
  if (!navigator.geolocation) {
    frappe.msgprint(__("Geolocation is not supported by this browser."));
    return;
  }

  frappe.dom.freeze(__("Getting your location..."));

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      frappe.dom.unfreeze();

      const { latitude, longitude } = pos.coords;

      // Set time + location
      frm.set_value("day_start_time", frappe.datetime.now_datetime());
      frm.set_value("start_latitude", latitude);
      frm.set_value("start_longitude", longitude);

      frm.save().then(() => {
        frappe.msgprint(
          __("Day started at {0}, {1}", [
            latitude.toFixed(6),
            longitude.toFixed(6),
          ])
        );
      });
    },
    (err) => {
      frappe.dom.unfreeze();
      frappe.msgprint(__("Could not get location: {0}", [err.message]));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
    }
  );
}

function end_day_with_location(frm) {
  if (!navigator.geolocation) {
    frappe.msgprint(__("Geolocation is not supported by this browser."));
    return;
  }

  frappe.dom.freeze(__("Getting your location..."));

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      frappe.dom.unfreeze();

      const { latitude, longitude } = pos.coords;

      // Set time + location
      frm.set_value("day_end_time", frappe.datetime.now_datetime());
      frm.set_value("end_latitude", latitude);
      frm.set_value("end_longitude", longitude);

      frm.save().then(() => {
        frappe.msgprint(
          __("Day ended at {0}, {1}", [
            latitude.toFixed(6),
            longitude.toFixed(6),
          ])
        );
      });
    },
    (err) => {
      frappe.dom.unfreeze();
      frappe.msgprint(__("Could not get location: {0}", [err.message]));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
    }
  );
}




// ─────────────────────────────────────────────
// Child Table: FOS Day Plan Item
// - Auto-fill row from FOS Case
// - "Start Visit" button (fieldname = details) → open FOS Case
// ─────────────────────────────────────────────

frappe.ui.form.on("FOS Day Plan Item", {
  // When user selects a Case in the row
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

  // "Start Visit" button → fieldname = details (label shown as Start Visit)
  details(frm, cdt, cdn) {
    console.log("▶ [FOS Day Plan Item] details() / Start Visit clicked", cdt, cdn);
   // frappe.msgprint("Debug: Start Visit button clicked");

    const row = locals[cdt][cdn];
    if (!row || !row.case) {
      frappe.msgprint(__("Please select a Case first."));
      console.warn("⚠ Start Visit clicked without a Case");
      return;
    }

    console.log(`🚀 Routing to FOS Case ${row.case} from Start Visit`);
    frappe.set_route("Form", "FOS Case", row.case);
  },
});
