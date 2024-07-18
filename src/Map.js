import React, { useEffect, useState, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: 30.48873,
  lng: -87.19806,
};
const libraries = ["places"];

function Map() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [totalDistance, setTotalDistance] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [waypoints, setWaypoints] = useState([{ location: "" }]);

  const handleWaypointChange = (index, value) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index].location = value;
    setWaypoints(newWaypoints);
  };

  const addWaypoint = () => {
    setWaypoints([...waypoints, { location: "" }]);
  };

  const removeWaypoint = (index) => {
    const newWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(newWaypoints);
  };

  const loadDirections = useCallback(async () => {
    if (waypoints.some((wp) => !wp.location)) {
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    const formattedWaypoints = waypoints.map((wp) => ({
      location: wp.location,
    }));

    directionsService.route(
      {
        origin: { lat: 30.532666949482124, lng: -87.30156987413315 },
        destination: { lat: 30.48873, lng: -87.19806 },
        waypoints: formattedWaypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          setDirectionsResponse(response);
          const totalDistance = response.routes[0].legs.reduce((sum, leg) => {
            return sum + leg.distance.value;
          }, 0);
          const totalDuration = response.routes[0].legs.reduce((sum, leg) => {
            return sum + leg.duration.value;
          }, 0);

          setTotalDuration((totalDuration / 60).toFixed(2)); // Convert to minutes and round to 2 decimal places
          setTotalDistance((totalDistance / 1000).toFixed(2)); // Convert to kilometers and round to 2 decimal places
        } else {
          console.error("Directions request failed due to " + status);
        }
      }
    );
  }, [waypoints]);

  useEffect(() => {
    if (isLoaded && map && waypoints.every((wp) => wp.location)) {
      loadDirections();
    }
  }, [isLoaded, map, waypoints, loadDirections]);

  return isLoaded ? (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        mapId="DEMO_MAP_ID"
        onLoad={(map) => setMap(map)}
      >
        {directionsResponse && (
          <DirectionsRenderer
            options={{
              directions: directionsResponse,
            }}
          />
        )}
      </GoogleMap>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "grey",
          padding: "10px",
        }}
      >
        <h2>Total Duration {totalDuration} min</h2>
        <h2>Total Distance: {totalDistance} km</h2>
        <div>
          {waypoints.map((wp, index) => (
            <div key={index}>
              <input
                type="text"
                value={wp.location}
                onChange={(e) => handleWaypointChange(index, e.target.value)}
                placeholder={`Waypoint ${index + 1}`}
              />
              <button onClick={() => removeWaypoint(index)}>Remove</button>
            </div>
          ))}
          <button onClick={addWaypoint}>Add Waypoint</button>
          <button onClick={loadDirections}>Calculate Route</button>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}

export default React.memo(Map);
