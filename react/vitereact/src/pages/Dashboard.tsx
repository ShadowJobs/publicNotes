import React, { useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { DashboardApps, dashboardCfg } from "@/config/navigation";
import { Button, Space, Modal, Form, Select, Input, Switch, Alert } from "antd";
import useUser from "@/hooks/useUser";
import { CloseCircleOutlined, EditOutlined } from "@ant-design/icons";
import { EditCardModal, EditMenuModal } from "./DashboardEdit";
import axios from "@/utils/axios";
import queryClient from "@/utils/query-client";

const Container = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 5px;
`;

const Welcome = styled.h1`
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 1199px) and (min-width: 769px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) and (min-width: 481px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const blinkAnimation = keyframes`
  50% {
    opacity: 0.7;
  }
`;


const FeatureCard = styled.div<{ recommend?: boolean; isDragging?: boolean; draggable?: boolean; isAdd?: boolean }>`
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  border: ${props => props.isAdd ? '2px dashed #ddd' : '1px solid #eee;'};
  min-width: 250px;
  position: relative;
  draggable: ${props => props.draggable ? 'true' : 'false'};
  cursor: ${props => props.draggable ? 'move' : 'pointer'};
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  ${props => props.isDragging && css`
    opacity: 0.5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `}

  ${props => props.recommend && css`
    &::after {
      content: "荐!";
      position: absolute;
      top: -1px;
      left: 0px;
      color: red;
      border: 1px solid red;
      border-radius: 5px;
      padding: 0px;
      width: 25px;
      height:19px;
      text-align: center;
      animation: ${blinkAnimation} 3s linear infinite;
      font-size: 12px;
    }
  `}
`;
const FeatureHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const FeatureTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 500;
  
  .anticon {
    font-size: 20px;
    color: #1677ff;
  }
`;

const MoreLink = styled.a`
  color: #1677ff;
  font-size: 14px;
  display: inline-block;
  white-space: nowrap;
`;

const ExamplesList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`;

const ExampleItem = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
`;

const Home: React.FC = () => {
  const [features, setFeatures] = useState<any[]>(dashboardCfg.DashboardApps);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [isManage, setIsManage] = useState(false);
  const { data: user } = useUser();
  const [editCard, setEditCard] = useState<any>(null);
  const [newFeature, setNewFeature] = useState<any>();

  // const { data: dashboardCfg, isLoading } = useDashboardConfig()
  const appHash = dashboardCfg?.appHash || {};
  // const DashboardApps = dashboardCfg?.DashboardApps?.map((v: string) => appHash[v]) || [];
  const [admins, setAdmins] = useState<string[]>(["root","guest"]);


  // 开始拖动
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isManage) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 放置处理
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null) return;
    const newFeatures = [...features];
    const draggedFeature = newFeatures[draggedItem];
    newFeatures.splice(draggedItem, 1);
    newFeatures.splice(dropIndex, 0, draggedFeature);

    setFeatures(newFeatures);
  };
  return (
    <Container>
      {isManage && <Alert message="拖动卡片可以调整顺序,点击保存生效" type="info" showIcon closable />}
      <EditCardModal visible={!!editCard}
        onCancel={() => setEditCard(null)}
        initialValues={editCard}
      />

      {/* admins?.includes(user?.name as string) && */}
      {
        <div style={{ position: "absolute", right: 0, top: 60, padding: 10 }}>
          <Space>
            {!isManage && <Button icon={<EditOutlined />} type="primary" onClick={() => {
              setIsManage(true)
            }} />}
            {isManage ? <>
              <EditMenuModal />
              <Button type="primary" onClick={() => {
                setEditCard({
                  icon: '/images/default.png',
                  title: 'New App',
                  cardTitle: ['New App'],
                  description: 'New App',
                  url: 'https://shadowjobs.xyccstudio.cn:39006/chat/qHMKS7m3NMyZfyLR',
                  recommend: false,
                  isAdd: true
                });
              }}>
                创建新的App
              </Button>

              <Button type="primary" onClick={() => {
                axios.post('/mdify/api/v2/dashboard/app-list', {
                  config: features.map(feature => feature.title),
                  app_type: "DashboardApps"
                }).then(res => {
                  console.log('Update dashboard config:', res.data);
                  queryClient.invalidateQueries(["dashboard/config"]);
                  setIsManage(false)
                  setNewFeature(null);
                });
              }}
                disabled={DashboardApps.length === features.length && DashboardApps.every((v: any, i: number) => v.title === features[i].title)}
              >
                保存
              </Button>
              <Button type="primary" onClick={() => {
                setFeatures([...DashboardApps]);
                setIsManage(false);
                setNewFeature(null);
              }}>
                取消
              </Button>
            </> : null}
          </Space>
        </div>}
      <Welcome>
        欢迎使用
      </Welcome>
      <FeaturesGrid>
        {features.map((feature: any, index: number) => (
          <FeatureCard
            key={feature.name} // 使用唯一标识作为key
            recommend={feature.recommend}
            isDragging={draggedItem === index}
            draggable={isManage}
            onDragStart={(e) => isManage && handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => isManage && handleDrop(e, index)}
            onClick={() => !isManage && window.open(feature.url, "_blank")}
          ><>
              <FeatureHeader>
                <FeatureTitle>
                  <img
                    src={feature.icon || '/images/deepseek.svg'}
                    alt={feature.name}
                    style={{ width: "1.5rem", height: "1.5rem", marginRight: 10 }}
                    onError={(e) => {
                      if (!e.currentTarget.getAttribute('data-tried-loading-default')) {
                        e.currentTarget.setAttribute('data-tried-loading-default', 'true');
                        e.currentTarget.src = '/images/default.png'
                      }
                    }}
                  />
                  {feature.cardTitle?.length > 0 ? <div>
                    {feature.cardTitle.map((v: string) => <div key={v}>{v}</div>)}
                  </div> : feature.name}
                </FeatureTitle>
                <MoreLink
                  href={feature.url}
                  target="_blank"
                  onClick={e => e.preventDefault()}
                >
                  More &gt;
                </MoreLink>
              </FeatureHeader>
              <ExamplesList>
                <ExampleItem>
                  {feature.description}
                </ExampleItem>
              </ExamplesList>
              {feature.is_new && <span className=
                "absolute -top-[1px] left-0 text-red-500 border border-red-500 rounded px-0 w-[25px] h-[19px] text-center text-xs animate-[blink_3s_linear_infinite]"
              >
                新
              </span>}
              {isManage && <div className="w-full h-full absolute top-0 right-0">
                <div className="w-full h-full"></div>
                <Space className="absolute top-0 right-0">
                  <span className="cursor-pointer text-danger mbtn" onClick={() => setEditCard(feature)}>
                    <EditOutlined />
                  </span>
                  <span className="cursor-pointer text-danger mbtn"
                    onClick={() => {
                      const newFeatures = [...features];
                      newFeatures.splice(index, 1);
                      setFeatures([...newFeatures]);
                    }}><CloseCircleOutlined /></span>
                </Space></div>}

            </>
          </FeatureCard>
        ))}
        {/* 加一个添加的card */}
        {isManage && <FeatureCard draggable={false} isAdd={true}>
          {newFeature ? <div style={{ textAlign: "center", height: 60 }}>
            <Button type="default" onClick={() => {
              setFeatures([...features, appHash[newFeature]]);
              setNewFeature(null);
            }}>添加到Dashboard</Button>
          </div> : <div>
            <div style={{ textAlign: "center", height: 60 }}>选择一个App</div>
          </div>}
          <Select showSearch allowClear style={{ width: "100%" }}
            options={Object.keys(appHash).filter(v => !features.map(f => f.title).includes(v)).map(v => ({ value: v, label: v }))}
            value={newFeature}
            onChange={(v) => { setNewFeature(v) }}
          />
        </FeatureCard>}
      </FeaturesGrid>
    </Container>
  );
};

export default Home;