"use client";

import { useEffect, useState } from "react";
import { IFiles, IRootFiles, IRootFilesPA } from "@/components/IInterfaces";
import { FileOutlined, LoadingOutlined } from "@ant-design/icons";
import { App, Button, Checkbox, Modal, Spin } from "antd";
import { FormInput } from "@/components/utils/FormUtils";
import dynamic from "next/dynamic";
import {
  ENeedAction,
  Pemohon,
  PermohonanKredit,
  StatusAction,
} from "@prisma/client";
import { useUser } from "@/components/contexts/UserContext";
import moment from "moment";
const MyPDFViewer = dynamic(() =>
  import("@/components/utils/LayoutUtil").then((d) => d.MyPDFViewer)
);

interface IPerKredit extends PermohonanKredit {
  RootFiles: IRootFilesPA[];
  Pemohon: Pemohon;
}

export default function DeleteFiles({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IPerKredit>();
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState<string>();
  const [tempData, setTempData] = useState<IRootFiles[]>([]);
  const { modal } = App.useApp();
  const user = useUser();

  useEffect(() => {
    setLoading(true);
    (async () => {
      await fetch("/api/permohonan/find?id=" + id)
        .then((res) => res.json())
        .then((res) => {
          if (res.data) {
            setData(res.data);
          }
        });
    })();
    setLoading(false);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const files = tempData.flatMap((r) => r.Files).map((r) => ({ id: r.id }));
    const newData = {
      statusAction: StatusAction.PENDING,
      description: JSON.stringify([
        {
          time: moment().format("DD/MM/YYYY HH:mm"),
          user: user?.fullname,
          desc,
        },
      ]),
      action: ENeedAction.DELETE,
      status: true,
      Files: files,
      requesterId: user?.id || 0,
      permohonanKreditId: Number(id),
    };

    await fetch("/api/request", {
      method: "POST",
      body: JSON.stringify(newData),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 201) {
          modal.success({
            title: "BERHASIL",
            content: "Permohonan hapus file berhasil dikirimkan",
          });
          await fetch("/api/sendEmail", {
            method: "POST",
            body: JSON.stringify({
              subject: `Permohonan Hapus File Baru`,
              description: `${
                user?.fullname
              } berhasil mengajukan permohonan hapus file baru untuk data kredit ${
                data?.Pemohon.fullname
              } <br/><br/>${tempData
                .filter((t) => t.Files.length !== 0)
                .map(
                  (t) =>
                    `${t.name} (${t.Files.map((tf) => tf.name).join(
                      ", "
                    )})<br/>`
                )}`,
            }),
          });
          window && window.location.replace("/request/delete");
        } else {
          modal.error({ title: "ERROR", content: "Internal Server Error" });
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({ title: "ERROR", content: "Internal Server Error" });
      });
    setLoading(false);
  };

  if (!data) {
    return (
      <div>
        Memuat ... <LoadingOutlined />
      </div>
    );
  }
  return (
    <Spin spinning={loading}>
      <div className="p-2">
        <div className="text-lg py-4 font-bold border-b border-blue-500">
          <p>
            BERKAS BERKAS {data && data.Pemohon.fullname} (
            {data && data.Pemohon.NIK})
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-between">
          {data.RootFiles.map((d: any) => (
            <Items data={d} key={d.id} setSelected={setTempData} />
          ))}
        </div>
        <div className="flex justify-end p-2">
          <Button
            type="primary"
            onClick={() => setOpen(true)}
            disabled={tempData.filter((t) => t.Files.length !== 0).length === 0}
          >
            Submit
          </Button>
        </div>
      </div>
      <Modal
        open={open}
        loading={loading}
        onCancel={() => setOpen(false)}
        onOk={() => handleSubmit()}
        title="KONFIRMASI PENGHAPUSAN BERKAS"
      >
        <div className="my-4 flex flex-col gap-1">
          {tempData
            .filter((f) => f.Files.length !== 0)
            .map((f) => (
              <FormInput
                label={f.name}
                value={f.Files.map((fc) => fc.name).join(", ")}
                disable
                key={f.name}
              />
            ))}
          <div>
            <FormInput
              type="area"
              label="Keterangan"
              value={desc}
              onChange={(e: any) => setDesc(e)}
            />
          </div>
        </div>
      </Modal>
    </Spin>
  );
}

const Items = ({
  data,
  setSelected,
}: {
  data: IRootFilesPA;
  setSelected: Function;
}) => {
  const [tempData, setTempData] = useState<IRootFiles>({ ...data, Files: [] });
  const [selectedFile, setSelectedFile] = useState<IFiles>();

  useEffect(() => {
    setSelected((prev: IRootFiles[]) => {
      prev = prev.filter((p) => p.id !== tempData.id);
      prev.push(tempData);
      return prev;
    });
  }, [tempData]);

  return (
    <div className="w-full sm:w-[40vw] p-1 my-1">
      <div className="font-bold p-2 bg-gradient-to-br from-blue-500 to-green-500 text-gray-50 rounded">
        <p>{data.name.toUpperCase()}</p>
      </div>
      {data.Files.map((file) => (
        <div key={file.url} className="border-b border-gray-200 p-1">
          <Checkbox
            checked={tempData.Files.some((f) => f.url === file.url)}
            style={{ fontSize: 12 }}
            disabled={file.PermohonanAction.some(
              (pa) =>
                pa.action === ENeedAction.DELETE &&
                pa.statusAction === StatusAction.PENDING
            )}
            onChange={(e) => {
              if (e.target.checked) {
                setTempData({ ...tempData, Files: [...tempData.Files, file] });
              } else {
                setTempData({
                  ...tempData,
                  Files: tempData.Files.filter((p) => p.url !== file.url),
                });
              }
            }}
          >
            <div className="flex justify-between items-center">
              <p className="w-42">
                {file.name}{" "}
                {file.PermohonanAction.some(
                  (pa) =>
                    pa.action === ENeedAction.DELETE &&
                    pa.statusAction === StatusAction.PENDING
                ) ? (
                  <span className="italic opacity-80 text-xs">
                    (PENDING DELETE)
                  </span>
                ) : (
                  ""
                )}
              </p>
              <Button
                icon={<FileOutlined />}
                size="small"
                onClick={() => {
                  const { PermohonanKredit, ...fileSelected } = file;
                  setSelectedFile(fileSelected);
                }}
              ></Button>
            </div>
          </Checkbox>
          <Modal
            open={selectedFile ? true : false}
            onCancel={() => setSelectedFile(undefined)}
            footer={[]}
            width={window && window.innerWidth > 600 ? "80vw" : "95vw"}
            style={{ top: 20 }}
            title={"BERKAS " + selectedFile ? selectedFile?.name : ""}
          >
            <div className="h-[80vh]">
              <MyPDFViewer fileUrl={selectedFile ? selectedFile.url : ""} />
            </div>
          </Modal>
        </div>
      ))}
    </div>
  );
};
