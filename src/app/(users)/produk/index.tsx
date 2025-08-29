"use client";

import { LoadingOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";

export const TableProduk = dynamic(() => import("@/app/(users)/produk/util"), {
  ssr: false,
  loading: () => (
    <div>
      Loading... <LoadingOutlined />
    </div>
  ),
});
