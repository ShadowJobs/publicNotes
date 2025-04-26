import { Layout, Skeleton } from "antd";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <Layout className="min-h-screen">
      <Suspense
        fallback={
          <div className="grid h-screen w-screen place-items-center">
            <Skeleton className="w-1/2" active paragraph={{ rows: 12 }} />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </Layout>
  );
}
