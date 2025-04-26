// 打开docoment.ejs里的这一样，即可显示。注意版本号：需要2.0版本的才能打开这种热力图
{/* <script type="text/javascript" src="https://webapi.amap.com/maps?v=2.0&key=xxxx"></script> */ }


import React, { useEffect } from 'react';
import { LoadScript,useJsApiLoader } from "@react-google-maps/api";
import { GoogleMapKey } from '@/global';

const mapContainerStyle = { height: "85vh", width: "100%" };

export const MapWithHeatmapLayer:React.FC<{data:any}> = ({data}) => {
  const { isLoaded } = useJsApiLoader({ //这里为什么套2层,useJsApiLoader和LoadScript?因为google.maps必须在loadScript里或者withScriptjs里才能用,
    id: 'google-map-script',
    googleMapsApiKey: GoogleMapKey,
    libraries: ["visualization"],
  });

  const heatmapData = data.data.points.map(point => new google.maps.LatLng(point.lat, point.lon));

  useEffect(() => {
    if (!isLoaded) return;
    const map = new window.google.maps.Map(document.getElementById('heatmap-example'), {
      center: {lat: data.data.points[0].lat, lng: data.data.points[0].lon},
      zoom: 13,
    });
    const heatmap = new window.google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      radius: 20,
    });
    heatmap.setMap(map);
  }, [isLoaded, heatmapData]);

  return isLoaded ? (
    <div id="heatmap-example" style={mapContainerStyle}></div>
  ) : <></>;
}
const GoogleHeatMap: React.FC = () => {
    return <LoadScript googleMapsApiKey={GoogleMapKey} libraries={["visualization"]}>
        <MapWithHeatmapLayer data={{
        "data": {
          "colors": [
            {
              "color": "#237804",
              "label": "within_limit_0.3m",
              "level": 50,
              "radius": 5
            },
            {
              "color": "#ad6800",
              "label": "over_limit_0.3m",
              "level": 200,
              "radius": 5
            },
            {
              "color": "#f5222d",
              "label": "over_limit_0.7m",
              "level": 200,
              "radius": 5
            }
          ],
          "min_x": 121.1611774797,
          "min_y": 31.1845692726,
          "order": 4,
          "points": [
            {
              "label": "over_limit_0.3m",
              "lat": 31.2795747385,
              "lon": 121.18015886589998,
              "t": 1690377750.019934
            },
            {
              "label": "over_limit_0.3m",
              "lat": 31.279574741399998,
              "link": "https://mviz.xx.com/player/v4/?user=MSD&format=multi_pbe_gz&zip=20&path=//mviz-convert-prod-data-obs.obs.cn-east-3.myhuaweicloud.com/7c/35/47186c753865019ad2ccaecae39b/v4/99914b932bd37a50b983c5e7c90ae93b&slice_bag=1690377740.019934,1690377778.279917",
              "lon": 121.1801588543,
              "t": 1690377750.979933
            },
            {
              "label": "over_limit_0.3m",
              "lat": 31.28026174,
              "link": "https://mviz.xx.com/player/v4/?user=MSD&format=multi_pbe_gz&zip=20&path=//mviz-convert-prod-data-obs.obs.cn-east-3.myhuaweicloud.com/7c/35/47186c753865019ad2ccaecae39b/v4/99914b932bd37a50b983c5e7c90ae93b&slice_bag=1690380486.937353,1690380550.517273",
              "lon": 121.179741949,
              "t": 1690380522.35729
            },
            {
              "label": "over_limit_0.3m",
              "lat": 31.280261742099995,
              "link": "https://mviz.xx.com/player/v4/?user=MSD&format=multi_pbe_gz&zip=20&path=//mviz-convert-prod-data-obs.obs.cn-east-3.myhuaweicloud.com/7c/35/47186c753865019ad2ccaecae39b/v4/99914b932bd37a50b983c5e7c90ae93b&slice_bag=1690380486.937353,1690380550.517273",
              "lon": 121.17974195019998,
              "t": 1690380522.37729
            },
            {
              "label": "over_limit_0.3m",
              "lat": 31.280261746399997,
              "link": "https://mviz.xx.com/player/v4/?user=MSD&format=multi_pbe_gz&zip=20&path=//mviz-convert-prod-data-obs.obs.cn-east-3.myhuaweicloud.com/7c/35/47186c753865019ad2ccaecae39b/v4/99914b932bd37a50b983c5e7c90ae93b&slice_bag=1690380486.937353,1690380550.517273",
              "lon": 121.17974194580002,
              "t": 1690380522.39729
            },
            {
              "label": "over_limit_0.3m",
              "lat": 31.280261750099992,
              "link": "https://mviz.xx.com/player/v4/?user=MSD&format=multi_pbe_gz&zip=20&path=//mviz-convert-prod-data-obs.obs.cn-east-3.myhuaweicloud.com/7c/35/47186c753865019ad2ccaecae39b/v4/99914b932bd37a50b983c5e7c90ae93b&slice_bag=1690380486.937353,1690380550.517273",
              "lon": 121.17974193929999,
              "t": 1690380522.41729
            },
            {
              "label": "over_limit_0.3m",
              "lat": 31.280261750500003,
              "link": "https://mviz.xx.com/player/v4/?user=MSD&format=multi_pbe_gz&zip=20&path=//mviz-convert-prod-data-obs.obs.cn-east-3.myhuaweicloud.com/7c/35/47186c753865019ad2ccaecae39b/v4/99914b932bd37a50b983c5e7c90ae93b&slice_bag=1690380486.937353,1690380550.517273",
              "lon": 121.1797419379,
              "t": 1690380522.43729
            },
            {
              "label": "over_limit_0.3m",
              "lat": 31.2802617414,
              "link": "https://mviz.xx.com/player/v4/?user=MSD&format=multi_pbe_gz&zip=20&path=//mviz-convert-prod-data-obs.obs.cn-east-3.myhuaweicloud.com/7c/35/47186c753865019ad2ccaecae39b/v4/99914b932bd37a50b983c5e7c90ae93b&slice_bag=1690380486.937353,1690380550.517273",
              "lon": 121.17974194170002,
              "t": 1690380522.45729
            },
            {
              "label": "within_limit_0.3m",
              "lat": 31.2744384172,
              "lon": 121.1883400966,
              "t": 1690380627.53719
            },
            {
              "label": "within_limit_0.3m",
              "lat": 31.274456320700008,
              "lon": 121.18842690339999,
              "t": 1690380628.497189
            },
            {
              "label": "within_limit_0.3m",
              "lat": 31.2744728906,
              "lon": 121.18850782969999,
              "t": 1690380629.457188
            }
          ],
          "width": 0.14622920040000054
        },
        "func": "[dt_source-egopose]GLOBAL_LATERAL_POSITION_ERROR_TRAJECTORY",
        "select_type": "dt_source-egopose",
        "tips": [
          "lon",
          "lat",
          "t",
          "label",
          "link"
        ]
      }} />
    </LoadScript>
}
export default GoogleHeatMap
