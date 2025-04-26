import _ from "lodash";
import React, { useState } from 'react';
import { GoogleMap, LoadScript, MarkerClusterer, Marker, InfoWindow } from "@react-google-maps/api";
import { GoogleMapKey } from "@/global";

const mapContainerStyle = {
  height: "80vh",
  width: "100%"
};

function MapWithMarkerClusterer({ }) {
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
  }
  const MarkerWithInfo = (props) => {
    const point = props.point;
    const [isOpen, setIsOpen] = useState(false);
    const [fixed, setFixed] = useState(false);
    return (
      <Marker position={{ lat: point.lat, lng: point.lon }}
        clusterer={props.clusterer}
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
  return (<div>
    切换到GoogleMapOrigin菜单后会显示不出来，两个有冲突 <br />
    使用了@react-google-maps/api的MarkerClusterer
    <LoadScript googleMapsApiKey={GoogleMapKey}>
      <GoogleMap id="marker-example" mapContainerStyle={mapContainerStyle} zoom={17} center={{
        lat: 30.216248460272325,
        lng: 120.22847910294302
      }}>
        {/* minimumClusterSize (Number)：相当于最小可形成聚类的标记数量。默认值为2。 */}
        <MarkerClusterer minimumClusterSize={3}>
          {(clusterer) => ps.points.map((point) => <MarkerWithInfo key={point.t} point={point} clusterer={clusterer} />)}
        </MarkerClusterer>
      </GoogleMap>
    </LoadScript>
  </div>);
}

const TestGoogleMap: React.FC<{}> = ({ }) => {
  return <MapWithMarkerClusterer/>
}
export default TestGoogleMap
