import _ from "lodash";
import { withScriptjs, withGoogleMap } from "react-google-maps";
import React, { useEffect } from 'react';
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { GoogleMapKey } from "@/global";

export const MapWithMarkers = withScriptjs(withGoogleMap((props) => {
  // withScriptjs,withGoogleMap 的作用
  // withScriptjs: 用于加载google map script
  // withGoogleMap: 用于加载google map
  // 用法：withScriptjs(withGoogleMap((props) => {return <GoogleMap></GoogleMap>}))
  // props: googleMapURL,loadingElement,containerElement,mapElement
  // googleMapURL: google map script url
  // loadingElement: 加载中的div
  // containerElement: 容器div
  // mapElement: 地图div
  // GoogleMap: google map
  // 如果不写withScriptjs,withGoogleMap，那么下面的google就会是undefined，报错
  useEffect(() => {
    const locations = [
      { lat: -31.56391, lng: 147.154312 },
      { lat: -33.718234, lng: 150.363181 },
      { lat: -33.727111, lng: 150.371124 },
      { lat: -33.848588, lng: 151.209834 },
      { lat: -33.851702, lng: 151.216968 },
      { lat: -34.671264, lng: 150.863657 },
      { lat: -35.304724, lng: 148.662905 },
      { lat: -36.817685, lng: 175.699196 },
      { lat: -36.828611, lng: 175.790222 },
      { lat: -37.75, lng: 145.116667 },
      { lat: -37.759859, lng: 145.128708 },
      { lat: -37.765015, lng: 145.133858 },
      { lat: -37.770104, lng: 145.143299 },
      { lat: -37.7737, lng: 145.145187 },
      { lat: -37.774785, lng: 145.137978 },
      { lat: -37.819616, lng: 144.968119 },
      { lat: -38.330766, lng: 144.695692 },
      { lat: -39.927193, lng: 175.053218 },
      { lat: -41.330162, lng: 174.865694 },
      { lat: -42.734358, lng: 147.439506 },
      { lat: -42.734358, lng: 147.501315 },
      { lat: -42.735258, lng: 147.438 },
      { lat: -43.999792, lng: 170.463352 },
    ];
    async function initMap() {
      // Request needed libraries.
      const { Map, InfoWindow } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
      const map = new google.maps.Map(
        document.getElementById("map") as HTMLElement,
        {
          zoom: 6,
          center: { lat: -31.56391, lng: 147.154312 },
          mapId: 'DEMO_MAP_ID',
        }
      );
      const infoWindow = new google.maps.InfoWindow({
        content: "",
        disableAutoPan: true,
      });

      const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const markers = locations.map((position, i) => {
        const label = labels[i % labels.length];
        const pinGlyph = new google.maps.marker.PinElement({
          glyph: label,
          glyphColor: "white",
        })
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position,
          content: pinGlyph.element,
        });

        marker.addListener("click", () => {
          infoWindow.setContent(position.lat + ", " + position.lng);
          infoWindow.open(map, marker);
        });
        return marker;
      });
      new MarkerClusterer({ markers, map });
    }
    initMap();
  }, [])

  return <> </>
}))

const TestGoogleMap: React.FC<{}> = ({}) => {
  return (
    <div>
      google原生提供的示例,Marker+clusterer,
      <br/>切换到GoogleMapUseApi菜单后会显示不出来，两个有冲突
      <div id="map" style={{ width: "100%", height: 800 }}></div>
      <MapWithMarkers
        googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${GoogleMapKey}`}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `80vh` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    </div>
  )
}
export default TestGoogleMap
