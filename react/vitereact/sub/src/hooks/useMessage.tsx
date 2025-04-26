import { isPlainObject } from "lodash-es";
import { proxy, useSnapshot } from "valtio";
import { proxyMap } from "valtio/utils";

export type Message = {
  type: string;
  payload: MessagePayload;
};

type MessagePayload = {
  frame_id: number;
  npz_md5?: string[];
  f_ts?: string[];
  npz_path?: string[];
  feature_index?: number[];
  table_datas?: Record<
    string,
    {
      columns: string[];
      rows: Record<string, any>[];
    }
  >;
  data: {
    frame_meta: Record<string, any>;
  };
  camera_datas?: {
    name: string;
    data: string | null
  }[];
};

export type ColorItem = { data: string; background_color?: string };

type State = {
  frameIndex: number;
  frameMeta: Record<string, any>;
  frameMetaEntries: Map<number, [string, any][]>;
  tableData: Map<number, { name: string; fields: string[]; items: string[][] | ColorItem[][] }[]>;
  labelData?: {
    npz_md5: string[];
    f_ts: string[];
    npz_path?: (string | null)[];
    feature_index?: (number | null)[];
  };
  camera_datas: {
    name: string;
    data: string | null
  }[];
};

const state = proxy<State>({
  frameIndex: 0,
  frameMeta: {},
  frameMetaEntries: proxyMap(),
  tableData: proxyMap(),
  camera_datas: [],
});

const toEntries = (data: Record<string, any>, acc: [string, any][] = []) => {
  Object.entries(data).forEach(([key, value]) => {
    if (isPlainObject(value)) {
      toEntries(value, acc);
    } else {
      acc.push([key, value]);
    }
  });
  return acc;
};

window.addEventListener("message", (event: MessageEvent<Message | null>) => {
  console.log("message:", event.data?.type);
  if (event.data?.type !== "json_data") return;

  const payload = event.data.payload;
  const frameIndex = payload.frame_id;
  const frameMeta = payload.data;

  state.frameIndex = frameIndex;
  state.frameMeta = frameMeta;

  if (!state.labelData && payload.npz_md5 && payload.f_ts) {
    state.labelData = {
      npz_md5: payload.npz_md5,
      f_ts: payload.f_ts,
      npz_path: payload.npz_path,
      feature_index: payload.feature_index
    };
  }

  if (!state.tableData.has(frameIndex) && payload.table_datas) {
    state.tableData.set(
      frameIndex,
      Object.entries(payload.table_datas)
        .filter(([_, { columns, rows }]) => columns.length !== 0 && rows.length !== 0)
        .map(([name, { columns, rows }]) => ({
          name,
          fields: columns,
          items: rows.map((row) => columns.map((field) => row[field]))
        }))
    );
  }

  if (payload.camera_datas) {
    state.camera_datas = [...payload.camera_datas]
  }

  if (!state.frameMetaEntries.has(frameIndex)) {
    state.frameMetaEntries.set(frameIndex, toEntries(frameMeta));
  }
});

const useMessage = () => useSnapshot(state);

export default useMessage;
