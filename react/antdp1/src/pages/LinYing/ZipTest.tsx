import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Col, Image, Radio, Row, Space, Spin } from "antd";
import JSZip from 'jszip';
import VirtualList from 'react-tiny-virtual-list';
import { FrontendPre } from "@/global";

const ImgW = 300;
const NUM_PER_PAGE = 20;
const ZipTest = () => {
  const [imagesData, setImagesData] = useState([]);
  const [rollType, setRollType] = useState<"virtual-list" | "intersect-obsv">("virtual-list")

  const [allImagesData, setAllImagesData] = useState([]);
  const [obsImages, setObsImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [zipHandler, setZipHandler] = useState();
  const observerRef = useRef();
  const loadMoreRef = useCallback((node) => { // 观察最后一个元素
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setObsImages(prevState => {
          console.log(allImagesData);
          return [
            ...prevState,
            ...allImagesData.slice(prevState.length, prevState.length + NUM_PER_PAGE)
          ]
        });
      }
    });
    if (node) observerRef.current.observe(node);
  }, [allImagesData]);
  const loadZipFile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${FrontendPre}/compress.zip`); //1,gpt用fetch，下载文件，umi的request没有获取blob()的方法？
      const blob = await response.blob()

      const zip = new JSZip();
      const data = await zip.loadAsync(blob); //2，解压压缩文件
      const images = Object.keys(data.files).filter(file =>
        file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".JPG")
      );

      const imagesData = await Promise.all(images.map(async (image) => {
        const content = await data.files[image].async('base64');
        return {
          name: image,
          url: `data:image/png;base64,${content}` //这里注意
        };
      }));

      setZipHandler(zip);
      setImagesData(imagesData);
      setAllImagesData(imagesData)
      setObsImages(imagesData.slice(0, NUM_PER_PAGE))
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  };

  useEffect(() => { loadZipFile(); }, []);

  // 定义单个列表项目渲染
  const renderItem = ({ index, style }) => (
    <div key={index} style={style}>
      <Image width={200} src={imagesData[index].url} />
      <p>{imagesData[index].name}</p>
    </div>
  );

  return (
    <>
      <Radio.Group value={rollType} onChange={e => setRollType(e.target.value)}>
        <Radio.Button value="virtual-list">virtual-list</Radio.Button>
        <Radio.Button value="intersect-obsv">intersect-obsv</Radio.Button>
      </Radio.Group>
      {rollType == "virtual-list" ?
        //2， 虚拟滚动，
        <VirtualList width='100%' height={"85vh"} itemCount={imagesData.length}
          itemSize={220} renderItem={renderItem}
        /> :
        <div>
          自己写的分段加载，利用IntersectionObserver
          <div style={{ marginBottom: 10, position: "sticky", top: 0, zIndex: 10 }}><Space>
            <Button loading={loading} type="primary" onClick={() => setObsImages([...allImagesData])}>Load All</Button>

            <Button type="primary" disabled={!zipHandler} onClick={async () => {

              const zipBlob = await zipHandler.generateAsync({ type: "blob" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(zipBlob);
              link.download = "girl-images.zip";
              link.click(); // This will download the zip
            }}>Download Zip</Button>
          </Space></div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {loading ? <Spin /> :
              obsImages && (<div style={{ width: "100%" }}>
                <Image.PreviewGroup>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${ImgW}px, 1fr))`, gap: 10 }}>
                    {obsImages.map((image, idx) => (
                      <div key={image.name}>
                        <Image width={ImgW} src={image.url} />
                        <div style={{ width: ImgW, wordBreak: "break-all" }}>[{idx}] {image.name}</div>
                      </div>
                    ))}
                  </div>
                </Image.PreviewGroup>
                {obsImages.length < allImagesData.length && <div ref={loadMoreRef}>Load More...<Spin /></div>}
              </div>)
            }
          </div>
        </div>
      }
    </>
  );
};

export default ZipTest;
