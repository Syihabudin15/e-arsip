"use client";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { Button, Tooltip } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

export function MyPDFViewer({
  fileUrl,
  download,
  onDownload,
}: {
  fileUrl: string;
  download?: boolean;
  onDownload?: Function;
}) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {
            ShowSearchPopover,
            ZoomOut,
            Zoom,
            ZoomIn,
            GoToPreviousPage,
            CurrentPageInput,
            NumberOfPages,
            GoToNextPage,
            Print,
            EnterFullScreen,
          } = slots;

          const CustomDownload = () => {
            const handleDownload = async () => {
              const response = await fetch(fileUrl);
              const blob = await response.blob();
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = fileUrl.split("/").pop() || "file.pdf";
              link.click();

              onDownload && onDownload();
            };

            return (
              <Button
                onClick={handleDownload}
                style={{ background: "transparent", border: "none" }}
              >
                <Tooltip title="Download">
                  <DownloadOutlined />
                </Tooltip>
              </Button>
            );
          };

          return (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <ShowSearchPopover />
              <ZoomOut />
              <Zoom />
              <ZoomIn />
              <GoToPreviousPage />
              <CurrentPageInput /> / <NumberOfPages />
              <GoToNextPage />
              {download && <Print />}
              {download && <CustomDownload />}
              <EnterFullScreen />
            </div>
          );
        }}
      </Toolbar>
    ),
  });

  const zoomPluginInstance = zoomPlugin();
  const { zoomTo } = zoomPluginInstance;

  // Simpan zoom level manual
  const [zoom, setZoom] = useState(1);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey) return;
    e.preventDefault();

    let newZoom = zoom;

    if (e.deltaY < 0) {
      newZoom = zoom + 0.1;
    } else {
      newZoom = zoom - 0.1;
    }

    if (newZoom < 0.5) newZoom = 0.5;
    if (newZoom > 3) newZoom = 3;

    setZoom(newZoom);
    animateZoom(zoom, newZoom);
  };

  function animateZoom(from: number, to: number, duration = 200) {
    const startTime = performance.now();

    function step(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentZoom = from + (to - from) * progress;
      zoomTo(currentZoom);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setZoom(to);
      }
    }

    requestAnimationFrame(step);
  }

  return (
    <div
      style={{
        height: "100%",
        // border: "1px solid black",
        transition: "transform 0.3s ease",
      }}
      onWheel={handleWheel}
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={fileUrl}
          plugins={[defaultLayoutPluginInstance, zoomPluginInstance]}
        />
      </Worker>
    </div>
  );
}

export const isPdfProtected = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    await PDFDocument.load(arrayBuffer); // Kalau berhasil berarti tidak terkunci
    return { status: false, msg: "OK" };
  } catch (err: any) {
    if (
      err.message.toLowerCase().includes("password") ||
      err.message.toLowerCase().includes("encrypted")
    ) {
      return {
        status: true,
        msg: "PDF memiliki proteksi. Mohon hapus dulu proteksinya",
      };
    }
    return { status: true, msg: "Gagal Upload file. Periksa jaringan!" };
  }
};

export const handleUnlock = async (file: File, pwd: string) => {
  // Set worker ke CDN pdfjs
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
  try {
    // Load PDF pakai pdfjs-dist dengan password (kalau ada)
    const loadingTask = pdfjsLib.getDocument({
      data: await file.arrayBuffer(),
      password: pwd,
    });

    await loadingTask.promise;

    // Gunakan pdf-lib untuk membuat ulang tanpa password
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer(), {
      ignoreEncryption: true,
    });
    const unlockedBytes = await pdfDoc.save();

    // pastikan tipe ArrayBuffer biasa
    const unlockedArrayBuffer: ArrayBuffer = unlockedBytes.slice().buffer;

    const unlockedFile = new File([unlockedArrayBuffer], file.name, {
      type: "application/pdf",
    });
    return { status: true, file: unlockedFile, msg: "OK" };
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if ((error as any).name === "PasswordException") {
        return { status: false, file: null, msg: "Password salah!!" };
      }
      return { status: false, file: null, msg: error.message };
    }
    return {
      status: true,
      file: null,
      msg: "gagal unlock PDF!!",
    };
  }
};
