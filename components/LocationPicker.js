import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

export function LocationPicker({ theme, value, onChange }) {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const iframeRef = useRef(null);

  // The map iframe posts its initial (default Lagos) position as soon as it
  // loads, and the message-listener effect below only resubscribes when
  // [lat, lng] change - so without this ref, handleMapMessage would call
  // whatever `onChange` closure existed when the listener was last
  // (re)attached, which can be stale by the time the message actually
  // arrives (e.g. the parent's form has since gained fields the user typed
  // in the meantime). Reading onChangeRef.current always gets the latest
  // one, regardless of when the effect last ran.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Sync initial / external value changes
  useEffect(() => {
    if (value && value.coordinates && value.coordinates.length === 2) {
      // GeoJSON coordinates is [longitude, latitude]
      const [longVal, latVal] = value.coordinates;
      setLng(String(longVal));
      setLat(String(latVal));
    }
  }, [value]);

  // Handle location update and propagate to parent - always via
  // onChangeRef.current (see comment above) since this is called from the
  // async iframe-message and geolocation callbacks below, not just from
  // direct user typing.
  const updateLocation = (latitude, longitude) => {
    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      // GeoJSON is [longitude, latitude]
      onChangeRef.current({
        type: "Point",
        coordinates: [parsedLng, parsedLat],
      });
    }
  };

  const handleTextChange = (field, text) => {
    setErrorMsg("");
    if (field === "lat") {
      setLat(text);
      updateLocation(text, lng);
      // Sync map if on web
      if (Platform.OS === "web" && iframeRef.current) {
        const parsedLat = parseFloat(text);
        const parsedLng = parseFloat(lng);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          iframeRef.current.contentWindow?.postMessage(
            { type: "set-location", lat: parsedLat, lng: parsedLng },
            "*"
          );
        }
      }
    } else {
      setLng(text);
      updateLocation(lat, text);
      // Sync map if on web
      if (Platform.OS === "web" && iframeRef.current) {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(text);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          iframeRef.current.contentWindow?.postMessage(
            { type: "set-location", lat: parsedLat, lng: parsedLng },
            "*"
          );
        }
      }
    }
  };

  // Get current device location - browser Geolocation API on web (navigator
  // .geolocation isn't available in native RN, hence the platform split),
  // expo-location on iOS/Android.
  const detectLocation = async () => {
    setLoading(true);
    setErrorMsg("");

    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLat(String(latitude.toFixed(6)));
            setLng(String(longitude.toFixed(6)));
            updateLocation(latitude, longitude);

            if (iframeRef.current) {
              iframeRef.current.contentWindow?.postMessage(
                { type: "set-location", lat: latitude, lng: longitude },
                "*"
              );
            }
            setLoading(false);
          },
          (error) => {
            console.error("Geolocation error:", error);
            setErrorMsg("Could not detect location. Please input coordinates manually.");
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        setErrorMsg("Geolocation is not supported by this browser.");
        setLoading(false);
      }
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Location permission denied. Please input coordinates manually.");
        setLoading(false);
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = position.coords;
      setLat(String(latitude.toFixed(6)));
      setLng(String(longitude.toFixed(6)));
      updateLocation(latitude, longitude);
    } catch (error) {
      console.error("Geolocation error:", error);
      setErrorMsg("Could not detect location. Please input coordinates manually.");
    } finally {
      setLoading(false);
    }
  };

  // Handle messages from Leaflet map on web
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleMapMessage = (e) => {
      if (e.data && e.data.type === "location-selected") {
        const { lat: selectedLat, lng: selectedLng } = e.data;
        setLat(String(selectedLat.toFixed(6)));
        setLng(String(selectedLng.toFixed(6)));
        updateLocation(selectedLat, selectedLng);
      }
    };

    window.addEventListener("message", handleMapMessage);
    return () => {
      window.removeEventListener("message", handleMapMessage);
    };
  }, [lat, lng]);

  // Leaflet map source for web iframe
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; overflow: hidden; background: #121212; }
        #map { width: 100vw; height: 100vh; }
        .leaflet-control-zoom { border: none !important; box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important; }
        .leaflet-bar a { background-color: #1e1e1e !important; color: #e0e0e0 !important; border-bottom: 1px solid #333 !important; }
        .leaflet-bar a:hover { background-color: #2c2c2c !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Start with default coordinates (Lagos, Nigeria)
        var currentLat = ${lat ? parseFloat(lat) : 6.5244};
        var currentLng = ${lng ? parseFloat(lng) : 3.3792};

        var map = L.map('map', { zoomControl: true }).setView([currentLat, currentLng], 13);
        
        // Use a nice tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        var marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(map);

        // Notify parent of initial position if we don't have one set yet
        if (!${lat ? "true" : "false"}) {
          window.parent.postMessage({ type: 'location-selected', lat: currentLat, lng: currentLng }, '*');
        }

        function updatePos(lat, lng) {
          marker.setLatLng([lat, lng]);
          map.setView([lat, lng]);
        }

        marker.on('dragend', function(e) {
          var position = marker.getLatLng();
          window.parent.postMessage({ type: 'location-selected', lat: position.lat, lng: position.lng }, '*');
        });

        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;
          marker.setLatLng([lat, lng]);
          window.parent.postMessage({ type: 'location-selected', lat: lat, lng: lng }, '*');
        });

        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'set-location') {
            updatePos(event.data.lat, event.data.lng);
          }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View className="mb-4 rounded-[16px] border p-4" style={{ backgroundColor: theme.surfaceSubtle, borderColor: theme.border }}>
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 pr-2">
          <Text className="text-[15px] font-bold" style={{ color: theme.text }}>
            Location Geometry (Geospatial Point) *
          </Text>
          <Text className="text-xs mt-[2px]" style={{ color: theme.textSecondary }}>
            Provide your exact coordinates (required for location-based search)
          </Text>
        </View>
        <TouchableOpacity
          onPress={detectLocation}
          disabled={loading}
          className="flex-row items-center px-3 py-1.5 rounded-[8px]"
          style={{ backgroundColor: theme.primaryLight }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <>
              <MaterialIcons name="my-location" size={16} color={theme.primary} style={{ marginRight: 4 }} />
              <Text className="text-xs font-bold" style={{ color: theme.primary }}>Detect</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {errorMsg ? (
        <Text className="text-xs text-red-500 mb-2 font-medium">{errorMsg}</Text>
      ) : null}

      <View className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <Text className="text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>Latitude</Text>
          <TextInput
            placeholder="e.g. 6.5244"
            placeholderTextColor={theme.textMuted}
            value={lat}
            onChangeText={(t) => handleTextChange("lat", t)}
            keyboardType="numeric"
            className="h-10 rounded-[8px] border px-3 text-[14px]"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }}
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>Longitude</Text>
          <TextInput
            placeholder="e.g. 3.3792"
            placeholderTextColor={theme.textMuted}
            value={lng}
            onChangeText={(t) => handleTextChange("lng", t)}
            keyboardType="numeric"
            className="h-10 rounded-[8px] border px-3 text-[14px]"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }}
          />
        </View>
      </View>

      {/* Interactive Web Map view */}
      {Platform.OS === "web" ? (
        <View className="w-full h-[220px] rounded-[12px] overflow-hidden border mt-2" style={{ borderColor: theme.border }}>
          <iframe
            ref={iframeRef}
            srcDoc={mapHtml}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Location Picker Map"
          />
        </View>
      ) : (
        <View className="p-3 rounded-[8px] items-center justify-center border border-dashed" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
          <MaterialIcons name="map" size={24} color={theme.textMuted} />
          <Text className="text-[11px] mt-1 text-center" style={{ color: theme.textSecondary }}>
            Tap "Detect" or enter coordinates manually. Map view is fully interactive on web.
          </Text>
        </View>
      )}
    </View>
  );
}
