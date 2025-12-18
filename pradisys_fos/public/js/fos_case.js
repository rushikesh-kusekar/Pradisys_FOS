// Client logic for FOS Case
console.log("✅ fos_case.js loaded for FOS Case");

// ─────────────────────────────────────────────
// 1) Start Collection button → opens FOS Collection
// ─────────────────────────────────────────────

frappe.ui.form.on("FOS Case", {
  // Custom button: fieldname = start_collection
  start_collection(frm) {
    console.log("Start Collection button clicked");

    if (!frm.doc.name) {
      frappe.msgprint(__("Please save the Case first."));
      return;
    }

    // Pre-fill values for FOS Collection
    frappe.route_options = {
      case: frm.doc.name,
      customer: frm.doc.fos_customer || frm.doc.customer || "",
      fos_agent: frm.doc.agent || frm.doc.fos_agent || "",
      day_plan: frm.doc.day_plan || "",
      collection_datetime: frappe.datetime.now_datetime(),
    };

    // Open New FOS Collection form
    frappe.new_doc("FOS Collection");
  },

  // ─────────────────────────────────────────
  // 2) Start / End Day buttons → capture GPS
  //    fieldnames: start_day, end_day
  // ─────────────────────────────────────────

  start_day(frm) {
    capture_location(frm, "start");
  },

  end_day(frm) {
    capture_location(frm, "end");
  },

  // ─────────────────────────────────────────
  // 3) On refresh → render map with route
  // ─────────────────────────────────────────
  refresh(frm) {
    render_map(frm);
  },
});

// ─────────────────────────────────────────────
// Capture Live Location (Start / End)
// ─────────────────────────────────────────────

function capture_location(frm, mode) {
  if (!navigator.geolocation) {
    frappe.msgprint(__("Geolocation is not supported by your browser."));
    return;
  }

  frappe.dom.freeze(__("Fetching live location…"));

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      frappe.dom.unfreeze();

      const { latitude, longitude } = pos.coords;

      if (mode === "start") {
        frm.set_value("day_start_time", frappe.datetime.now_datetime());
        frm.set_value("start_latitude", latitude);
        frm.set_value("start_longitude", longitude);
      } else {
        frm.set_value("day_end_time", frappe.datetime.now_datetime());
        frm.set_value("end_latitude", latitude);
        frm.set_value("end_longitude", longitude);
      }

      frm.save().then(() => {
        frappe.show_alert({
          message: `${mode.toUpperCase()} Location Saved: ${latitude.toFixed(
            5
          )}, ${longitude.toFixed(5)}`,
          indicator: "green",
        });

        render_map(frm);
      });
    },
    (err) => {
      frappe.dom.unfreeze();
      frappe.msgprint(
        __("❌ Unable to get GPS location: {0}", [err.message])
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
    }
  );
}

// ─────────────────────────────────────────────
// Render Map – Add Start Marker, End Marker, Route Line
// assumes Map field with fieldname = "geolocation"
// ─────────────────────────────────────────────

function render_map(frm) {
  const mapfield = frm.get_field("geolocation");
  if (!mapfield || !mapfield.map) return;

  const map = mapfield.map;

  const start_lat = frm.doc.start_latitude;
  const start_lng = frm.doc.start_longitude;
  const end_lat = frm.doc.end_latitude;
  const end_lng = frm.doc.end_longitude;

  // Clear old markers & polylines (keep base tiles)
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });

  const markers = [];

  // Start marker
  if (start_lat && start_lng) {
    const startMarker = L.marker([start_lat, start_lng])
      .addTo(map)
      .bindPopup("📍 Start Location")
      .openPopup();

    markers.push(startMarker);
  }

  // End marker
  if (end_lat && end_lng) {
    const endMarker = L.marker([end_lat, end_lng])
      .addTo(map)
      .bindPopup("🏁 End Location");

    markers.push(endMarker);
  }

  // Route line between start & end
  if (start_lat && start_lng && end_lat && end_lng) {
    const routeLine = L.polyline(
      [
        [start_lat, start_lng],
        [end_lat, end_lng],
      ],
      {
        color: "red",
        weight: 4,
        opacity: 0.8,
      }
    ).addTo(map);

    // Fit map to show full route
    map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
    return;
  }

  // If only one marker exists → center on it
  if (markers.length === 1) {
    map.setView(markers[0].getLatLng(), 15);
  }
}
