import _ from "lodash";
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from "react-google-maps";
import React, { useState } from 'react';
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";
import { compose, withProps } from 'recompose';
import { GoogleMapKey } from "@/global";

export const MapWithMarkerClusterer = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${GoogleMapKey}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `800px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)(props => {
  const ps = {
    "colors": [
      { "color": "#237804", "label": "within_limit_3.0m", "level": 50, "radius": 5 },
      { "color": "#ad6800", "label": "over_limit_3.0m", "level": 200, "radius": 5 },
      { "color": "blue", "label": "over_limit_3.7m", "level": 200, "radius": 5 }
    ],
    "order": 2,
    "points": [
      {
        "label": "within_limit_3.0m",
        "lat": 30.216248460272325,
        "lon": 120.23047910294302,
        "t": 1653554860.034574,
        "link": "/"
      },
      {
        "label": "over_limit_3.7m",
        "lat": 30.216259478264377,
        "lon": 120.23052960427104,
        "t": 1653554860.314577
      },
      {
        "label": "within_limit_3.0m",
        "lat": 30.21626999919562,
        "lon": 120.23058024141979,
        "t": 1653554860.594578
      },
      {
        "label": "over_limit_3.7m",
        "lat": 30.216279773669314,
        "lon": 120.23063029663918,
        "t": 1653554860.874585
      }
    ]
  };

  const MarkerWithInfo = (props) => {
    const point = props.point;
    const [isOpen, setIsOpen] = useState(false);
    const [fixed, setFixed] = useState(false);
    return (
      <Marker position={{ lat: point.lat, lng: point.lon }}
        onMouseOver={() => { setIsOpen(true); }}
        onMouseOut={() => { if (!fixed) setIsOpen(false); }}
        onMouseUp={() => setFixed(true)}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: ps.colors.find(v => v.label == point.label).color,
          fillOpacity: 1,
          strokeColor: ps.colors.find(v => v.label == point.label).color,
          strokeWeight: 0.5,
          scale: 5,
        }}>
        {isOpen && (
          <InfoWindow onCloseClick={() => {
            setIsOpen(false)
            setFixed(false)
          }}>
            <table className="maptable">
              {Object.entries(point).map(([k, v]) => (
                <tr key={k}>
                  <td className="label" style={{ fontWeight: "bold" }}>{k}</td>
                  <td></td>
                  <td className="content">{k === "link" ? <a href={v} target="_blank" rel="noopener noreferrer">GO</a> : v}</td>
                </tr>
              ))}
            </table>
          </InfoWindow>
        )}
      </Marker>
    )
  }
  return <GoogleMap
    defaultZoom={13}
    defaultCenter={{ lat: 30.226248460272325, lng: 120.23047910294302 }}
  >
    <MarkerClusterer
      averageCenter
      enableRetinaIcons
      gridSize={60}
    >
      {
        ps.points.map((point) => (
          <MarkerWithInfo key={point.t} point={point} />
        ))
      }
    </MarkerClusterer>
  </GoogleMap>
});

const TestGoogleMap: React.FC<{}> = ({ }) => {
  const points = {
    "data": {
      "colors": [
        { "color": "#237804", "label": "within_limit_3.0m", "level": 50, "radius": 5 },
        { "color": "#ad6800", "label": "over_limit_3.0m", "level": 200, "radius": 5 },
        { "color": "blue", "label": "over_limit_3.7m", "level": 200, "radius": 5 }
      ],
      "order": 2,
      "points": [
        {
          "label": "within_limit_3.0m",
          "lat": 30.216248460272325,
          "lon": 120.23047910294302,
          "t": 1653554860.034574,
          "link": "/"
        },
        {
          "label": "over_limit_3.7m",
          "lat": 30.216259478264377,
          "lon": 120.23052960427104,
          "t": 1653554860.314577
        },
        {
          "label": "within_limit_3.0m",
          "lat": 30.21626999919562,
          "lon": 120.23058024141979,
          "t": 1653554860.594578
        },
        {
          "label": "over_limit_3.7m",
          "lat": 30.216279773669314,
          "lon": 120.23063029663918,
          "t": 1653554860.874585
        }
      ]
    },
    "func": "[dt_source-predictor]GLOBAL_LATERAL_POSITION_ERROR_TRAJECTORY",
    "select_type": "dt_source-predictor",
    "tips": ["lon", "lat", "t", "label", "link"]
  };
  return (
    <div>
      绘制海量点，使用react-google-maps库里的MarkerClusterer
      <MapWithMarkerClusterer />
    </div>
  )
}
export default TestGoogleMap
