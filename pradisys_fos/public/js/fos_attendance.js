// Client logic for FOS Attendance – Geolocation
console.log("✅ fos_attendance.js loaded for FOS Attendance");

// Helper: update doc fields (lat, lng, geolocation JSON)
function set_fos_geo_fields(frm, lat, lng) {
  frm.set_value({
    latitude: lat,
    longitude: lng,
    geolocation: JSON.stringify({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            // GeoJSON = [lng, lat]
            coordinates: [lng, lat],
          },
        },
      ],
    }),
  });
}

// Helper: update map view + marker
function set_fos_geo_map(frm, lat, lng) {
  const field = frm.fields_dict.geolocation;
  if (!field || !field.map) return;

  const map = field.map;

  // Reuse same marker to avoid adding many markers
  if (frm._fos_geo_marker) {
    frm._fos_geo_marker.setLatLng([lat, lng]);
  } else {
    // L is the Leaflet global used by Frappe's GeoJSON map field
    frm._fos_geo_marker = L.marker([lat, lng]).addTo(map);
  }

  map.setView([lat, lng], 16); // street-level zoom
}

frappe.ui.form.on("FOS Attendance", {
  // When user clicks the button (Button field with fieldname = fetch_geolocation)
  fetch_geolocation(frm) {
    if (!navigator.geolocation) {
      frappe.msgprint(__("Geolocation is not supported by this browser."));
      return;
    }

    frappe.dom.freeze(__("Fetching your geolocation..."));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        frappe.dom.unfreeze();

        const lat = position.coords.latitude; // e.g. 18.57 (Pune)
        const lng = position.coords.longitude; // e.g. 73.94

        // 1) Save values on the document
        set_fos_geo_fields(frm, lat, lng);

        // 2) Update the map + marker
        set_fos_geo_map(frm, lat, lng);

        frm.refresh_fields();
      },
      (error) => {
        frappe.dom.unfreeze();
        frappe.msgprint(
          __("Unable to fetch location: ") + error.message
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  },

  // When form is opened/refreshed, keep map in sync with saved coords
  refresh(frm) {
    if (frm.doc.latitude && frm.doc.longitude) {
      set_fos_geo_map(frm, frm.doc.latitude, frm.doc.longitude);
    }
  },
});
