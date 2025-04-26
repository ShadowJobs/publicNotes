import _ from "lodash";
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from "react-google-maps";
import React, { useState } from 'react';
import { GoogleMapKey } from "@/global";
// 绘制少量点
export const MapWithMarkers = withScriptjs(withGoogleMap((props) => {
  const ps = props.points
  const MarkerWithInfo = (props) => {
    const point = props.point;
    const [isOpen, setIsOpen] = useState(false);
    const [fixed, setFixed] = useState(false)
    return <Marker position={{ lat: point.lat, lng: point.lon }}
      onMouseOver={() => { setIsOpen(true); }}
      onMouseOut={() => { if (!fixed) setIsOpen(false); }}
      onMouseUp={() => setFixed(true)}
      icon={{
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: ps.data.colors.find(v => v.label == point.label).color,
        fillOpacity: 1,
        strokeColor: ps.data.colors.find(v => v.label == point.label).color,
        strokeWeight: 0.5,
        scale: 5,
      }}>
      {isOpen && (
        <InfoWindow onCloseClick={() => {
          setIsOpen(false)
          setFixed(false)
        }}>
          <table className="maptable">
            {Object.entries(point).map(([k, v]: [string, any]) => {
              return <tr key={k}>
                <td className="label" style={{ fontWeight: "bold" }}>{k}</td>
                <td></td>
                <td className="content">{k == "link" ? <a href={v} target="_blank">GO</a> : v}</td>
              </tr>
            })}
          </table>
        </InfoWindow>
      )}
    </Marker>;
  }

  return <GoogleMap defaultZoom={17} defaultCenter={{ lat: 30.215248460272325, lng: 120.22947910294302 }} >
    {ps.data.points.map(point => (
      <MarkerWithInfo key={point.t} point={point} />
    ))}
  </GoogleMap>
}));


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
      使用react-google-maps库，
      <MapWithMarkers
        points={points}
        googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${GoogleMapKey}`}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `80vh` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    </div>
  )
}
export default TestGoogleMap
