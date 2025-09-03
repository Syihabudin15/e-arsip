"use client";

import {
  EditActivity,
  IDescription,
  IPermohonanKredit,
  IRootFiles,
  IUser,
} from "@/components/IInterfaces";
import { FilterOption, FormInput } from "@/components/utils/FormUtils";
import {
  DeleteOutlined,
  FolderOutlined,
  FormOutlined,
  LoadingOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { JenisPemohon, Produk } from "@prisma/client";
import {
  App,
  Button,
  Input,
  Modal,
  Table,
  TableProps,
  Tabs,
  Typography,
} from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { useAccess } from "@/components/utils/PermissionUtil";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useUser } from "@/components/contexts/UserContext";
import { ExportData } from "../logs/util";
const MyPDFViewer = dynamic(
  () => import("@/components/utils/LayoutUtil").then((d) => d.MyPDFViewer),
  {
    ssr: false,
    loading: () => <LoadingOutlined />,
  }
);
const { Paragraph } = Typography;

export default function TablePermohonanKredit() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState<string>();
  const [jenisId, setJenisId] = useState<number>();
  const [data, setData] = useState<IPermohonanKredit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [jeniss, setJeniss] = useState<Produk[]>([]);
  const { hasAccess } = useAccess("/permohonan-kredit");
  const user = useUser();
  const [selected, setSelected] = useState<IPermohonanKredit | undefined>(
    undefined
  );
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const getData = async () => {
    setLoading(true);
    await fetch(
      `/api/permohonan?page=${page}&pageSize=${pageSize}${
        search ? "&search=" + search : ""
      }${jenisId ? "&jenisId=" + jenisId : ""}`
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res.data.map((d: IPermohonanKredit) => ({ ...d, key: d.id })));
        setTotal(res.total);
      })
      .catch((err) => console.log(err));
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await getData();
      await fetch("/api/produk")
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200)
            setJeniss(res.data.map((d: JenisPemohon) => ({ ...d, key: d.id })));
        });
    })();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await getData();
    }, 200);
    return () => clearTimeout(timeout);
  }, [search, page, pageSize, jenisId]);

  const columns: TableProps<IPermohonanKredit>["columns"] = [
    {
      title: "NO",
      dataIndex: "no",
      key: "no",
      width: 50,
      className: "text-xs text-center",
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
      render(value, record, index) {
        return <>{(page - 1) * pageSize + (index + 1)}</>;
      },
      fixed: window && window.innerWidth > 600 ? "left" : false,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 50,
      className: "text-xs text-center",
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
      render(value, record, index) {
        return <>{record.id}</>;
      },
    },
    {
      title: "NO CIF",
      dataIndex: ["Pemohon", "noCIF"],
      key: "noCIF",
      className: "text-xs",
      width: 150,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
      fixed: window && window.innerWidth > 600 ? "left" : false,
    },
    {
      title: "NAMA PEMOHON",
      dataIndex: ["Pemohon", "fullname"],
      key: "fullname",
      className: "text-xs",
      width: 200,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
      fixed: window && window.innerWidth > 600 ? "left" : false,
    },
    {
      title: "NOMOR NIK",
      dataIndex: ["Pemohon", "NIK"],
      key: "nik",
      className: "text-xs",
      width: 150,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
    },
    {
      title: "PRODUK",
      dataIndex: ["Produk", "name"],
      key: "produk",
      className: "text-xs",
      width: 150,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
    },
    {
      title: "TUJUAN PENGGUNAAN",
      dataIndex: "purposeUse",
      key: "purposeUse",
      className: "text-xs",
      width: 200,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
    },
    {
      title: "FILES",
      dataIndex: "files",
      key: "files",
      className: "text-xs",
      width: 300,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
      render(value, record, index) {
        return (
          <>
            <Paragraph
              ellipsis={{
                rows: 2,
                expandable: "collapsible",
              }}
              style={{ fontSize: 11 }}
            >
              {record.RootFiles.map((rf) => (
                <>
                  {"{"}
                  {rf.name} ({rf.Files.map((f) => f.name).join(",")}){"};"}{" "}
                  <br />
                </>
              ))}
            </Paragraph>
          </>
        );
      },
    },
    {
      title: "LAST ACTIVITY",
      dataIndex: "activity",
      key: "activity",
      className: "text-xs",
      width: 300,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
      render(value, record, index) {
        const parse = record.activity
          ? (JSON.parse(record.activity) as EditActivity[])
          : [];
        return (
          <>
            <Paragraph
              ellipsis={{
                rows: 2,
                expandable: "collapsible",
              }}
              style={{ fontSize: 11 }}
            >
              {parse.map((p) => (
                <>
                  {"{"}
                  {p.time} | {p.desc}
                  {"};"} <br />
                  <br />
                </>
              ))}
            </Paragraph>
          </>
        );
      },
    },
    {
      title: "CREATED AT",
      dataIndex: "createdAt",
      key: "createdAt",
      className: "text-xs text-center",
      width: 100,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
      render(value, record, index) {
        return <>{moment(record.createdAt).format("DD/MM/YYYY")}</>;
      },
    },
    {
      title: "UPDATED AT",
      dataIndex: "updatedAt",
      key: "updatedAt",
      className: "text-xs text-center",
      width: 100,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
      render(value, record, index) {
        return <>{moment(record.updatedAt).format("DD/MM/YYYY")}</>;
      },
    },
    {
      title: "ACTION",
      dataIndex: "action",
      key: "action",
      className: "text-xs",
      width: 80,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
      render(value, record, index) {
        return (
          <div className="flex gap-2 justify-center" key={record.id}>
            {hasAccess("detail") && (
              <Button
                icon={<FolderOutlined />}
                type="primary"
                size="small"
                onClick={() => {
                  setSelected(record);
                  setOpenDetail(true);
                }}
              ></Button>
            )}
            {hasAccess("update") && (
              <Link href={"/permohonan-kredit/" + record.id}>
                <Button
                  icon={<FormOutlined />}
                  size="small"
                  type="primary"
                ></Button>
              </Link>
            )}
            {hasAccess("delete") && (
              <Link href={"/permohonan-kredit/delete/" + record.id}>
                <Button icon={<DeleteOutlined />} size="small" danger></Button>
              </Link>
            )}
            {hasAccess("delete") && (
              <Button
                icon={<DeleteOutlined />}
                size="small"
                type="primary"
                danger
                onClick={() => {
                  setSelected(record);
                  setOpenDelete(true);
                }}
                loading={loading}
              ></Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        title={() => (
          <div>
            <div className="border-b border-blue-500 py-2">
              <h1 className="font-bold text-xl">Permohonan Kredit</h1>
            </div>
            <div className="flex my-2 gap-2 justify-between overflow-auto">
              <div className="flex gap-2">
                {hasAccess("write") && (
                  <Link href={"/permohonan-kredit/create"}>
                    <Button
                      icon={<PlusCircleOutlined />}
                      type="primary"
                      size="small"
                    >
                      New
                    </Button>
                  </Link>
                )}
                <ExportData
                  filename="Permohonan Kredit"
                  textDisplay
                  columns={[
                    { header: "NO", key: "no", width: 6 },
                    { header: "ID PERMOHNAN", key: "id", width: 30 },
                    { header: "NOMOR CIF", key: "noCIF", width: 12 },
                    { header: "NAMA PEMOHON", key: "fullname", width: 30 },
                    { header: "NIK PEMOHON", key: "noNIK", width: 30 },
                    { header: "PRODUK", key: "produk", width: 30 },
                    {
                      header: "TUJUAN PENGGUNAAN",
                      key: "purposeUse",
                      width: 30,
                    },
                    { header: "FILES", key: "files", width: 50 },
                    { header: "KETERANGAN", key: "description", width: 30 },
                    { header: "LAST ACTIVITY", key: "activities", width: 50 },
                    { header: "MARKETING", key: "marketing", width: 20 },
                    { header: "CREATED_AT", key: "createdAt", width: 20 },
                  ]}
                  rows={data.map((d, i) => ({
                    no: i + 1,
                    id: d.id,
                    noCIF: d.Pemohon.noCIF,
                    fullname: d.Pemohon.fullname,
                    noNIK: d.Pemohon.NIK,
                    produk: d.Produk.name,
                    purposeUse: d.purposeUse,
                    files: d.RootFiles.flatMap((rf) => ({
                      name: rf.name,
                      files: rf.Files,
                    }))
                      .map(
                        (f) =>
                          `${f.name} (${f.files.map((f) => f.name).join(",")});`
                      )
                      .join(","),
                    description: d.description,
                    activities: d.activity,
                    marketing: d.User && d.User.fullname,
                    createdAt: moment(d.createdAt).format("DD/MM/YYYY"),
                  }))}
                />
                <FilterOption
                  items={jeniss.map((j) => ({ label: j.name, value: j.id }))}
                  value={jenisId}
                  onChange={(e: number) => setJenisId(e)}
                  width={150}
                />
              </div>
              <div className="w-42">
                <Input.Search
                  size="small"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        rowKey={"id"}
        columns={columns}
        size="small"
        bordered
        loading={loading}
        dataSource={data}
        scroll={{ x: "max-content", y: 370 }}
        pagination={{
          size: "small",
          total: total,
          pageSizeOptions: [50, 100, 500, 1000, 10000],
          defaultPageSize: pageSize,
          onChange(page, pageSize) {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
      />
      {selected && (
        <DeletePermohonan
          data={selected}
          getData={getData}
          user={user}
          open={openDelete}
          setOpen={setOpenDelete}
          key={selected.id}
        />
      )}
      {selected && (
        <DetailPermohonan
          data={selected}
          open={openDelete}
          setOpen={setOpenDetail}
          key={selected.id}
        />
      )}
    </div>
  );
}

const DeletePermohonan = ({
  data,
  getData,
  user,
  open,
  setOpen,
}: {
  data: IPermohonanKredit;
  getData: Function;
  user?: IUser;
  open: boolean;
  setOpen: Function;
}) => {
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp();

  const handleSubmit = async () => {
    setLoading(true);
    if ("key" in data) {
      delete data.key;
    }
    await fetch("/api/permohonan", {
      method: "PUT",
      body: JSON.stringify({ ...data, status: false, updatedAt: new Date() }),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 201 || res.status === 200) {
          modal.success({
            title: "BERHASIL",
            content: `Data ${data && data.Pemohon.fullname} berhasil dihapus`,
          });
          setOpen(false);
          getData();
          await fetch("/api/sendEmail", {
            method: "POST",
            body: JSON.stringify({
              subject: `Permohonan Kredit ${data.Pemohon.fullname} Dihapus`,
              description: `${user?.fullname} Berhasil menghapus data Permohonan Kredit ${data.Pemohon.fullname}`,
            }),
          });
          return;
        }
        modal.error({ title: "ERROR", content: res.msg });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        modal.error({ title: "ERROR", content: "Internal Server Error" });
      });
    setLoading(false);
  };
  return (
    <div>
      <Modal
        title={`HAPUS PERMOHONAN KREDIT ${data.Pemohon.fullname.toUpperCase()}`}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => handleSubmit()}
        loading={loading}
        okButtonProps={{ loading: loading }}
      >
        <div className="my-4">
          <p>Apakah anda yakin ingin menghapus Permohonan Kredit ini?</p>
        </div>
      </Modal>
    </div>
  );
};

export const DetailPermohonan = ({
  data,
  open,
  setOpen,
}: {
  data: IPermohonanKredit;
  open: boolean;
  setOpen: Function;
}) => {
  return (
    <div>
      <Modal
        title={`DETAIL ${data.Pemohon.fullname}`}
        open={open}
        footer={[]}
        onCancel={() => setOpen(false)}
        width={window && window.innerWidth > 600 ? "90vw" : "98vw"}
        style={{ top: 20 }}
      >
        <div className="flex flex-wrap gap-2 h-[80vh] overflow-y-scroll">
          <div className="w-full sm:flex-1 h-full overflow-auto">
            <DataPemohon data={data} />
          </div>
          <div className="w-full sm:flex-1 overflow-auto sm:border-l rounded">
            <Tabs
              items={data.RootFiles.map((d) => ({
                label: d.name,
                key: d.id.toString(),
                children: (
                  <div className="h-[70vh]">
                    {d.Files.length === 0 ? (
                      <div className="flex justify-center items-center">
                        Belum ada data diUpload
                      </div>
                    ) : (
                      <BerkasBerkas files={d} />
                    )}
                  </div>
                ),
              }))}
              type="card"
              className="h-full"
              size="small"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const DataPemohon = ({ data }: { data: IPermohonanKredit }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="p-2 rounded bg-gradient-to-br from-blue-500 to-purple-500 font-bold text-gray-50">
        <p>DATA PEMOHON</p>
      </div>
      <div className="flex flex-row items-center justify-between gap-2">
        <div>ID Permohonan</div>
        <div>
          <Input disabled value={data.id} style={{ color: "GrayText" }} />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between gap-2">
        <div>Nama Permohonan</div>
        <div>
          <Input
            disabled
            value={data.Pemohon.fullname}
            style={{ color: "GrayText" }}
          />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between gap-2">
        <div>NIK Permohonan</div>
        <div>
          <Input
            disabled
            value={data.Pemohon.NIK || ""}
            style={{ color: "GrayText" }}
          />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between gap-2">
        <div>NO Rekening</div>
        <div>
          <Input
            disabled
            value={data.accountNumber || ""}
            style={{ color: "GrayText" }}
          />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between gap-2">
        <div>Produk</div>
        <div>
          <Input
            disabled
            value={data.Produk.name || ""}
            style={{ color: "GrayText" }}
          />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between gap-2">
        <div>Tujuan Penggunaan</div>
        <div>
          <Input
            disabled
            value={data.purposeUse || ""}
            style={{ color: "GrayText" }}
          />
        </div>
      </div>
      <div className="p-2 rounded bg-gradient-to-br from-blue-500 to-purple-500 font-bold text-gray-50">
        <p>DATA MARKETING</p>
      </div>
      <div className="flex flex-row items-center justify-between gap-2">
        <div>Marketing</div>
        <div>
          <Input
            disabled
            value={data.User.fullname}
            style={{ color: "GrayText" }}
          />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between gap-2">
        <div>Email</div>
        <div>
          <Input
            disabled
            value={data.User.email}
            style={{ color: "GrayText" }}
          />
        </div>
      </div>
      <div className="p-2 rounded bg-gradient-to-br from-blue-500 to-purple-500 font-bold text-gray-50">
        <p>KETERANGAN KETERANGAN</p>
      </div>
      {data.description &&
        (JSON.parse(data.description) as IDescription[]).map(
          (d: IDescription, i: number) => (
            <FormInput
              type="area"
              disable
              label={`${d.user} (${d.time})`}
              value={d.desc}
              onChange={() => {}}
              key={i}
            />
          )
        )}
    </div>
  );
};

const BerkasBerkas = ({ files }: { files: IRootFiles }) => {
  const { access, hasAccess } = useAccess("/permohonan-kredit");
  const user = useUser();
  const [allFile, setAllFile] = useState<string>();

  useEffect(() => {
    (async () => {
      const result = await mergePDF(files.Files.map((f) => f.url));
      if (!result) return;
      setAllFile(result);
    })();
  }, [files]);
  return (
    <div className="h-full">
      <Tabs
        size="small"
        type="card"
        tabBarStyle={{
          ...(window && window.innerWidth > 600 && { width: 80 }),
        }}
        items={[
          {
            label: `Semua`,
            key: "allFile",
            children: (
              <>
                {allFile && (
                  <div className="h-[70vh]">
                    <MyPDFViewer
                      fileUrl={allFile}
                      download={hasAccess("download")}
                    />
                  </div>
                )}
              </>
            ),
          },
          ...(files &&
            files.Files.map((f) => ({
              label: f.name,
              key: f.name + Date.now(),
              children: (
                <div className="h-[70vh]">
                  <MyPDFViewer
                    fileUrl={f.url}
                    download={(() => {
                      if (hasAccess("download")) {
                        return true;
                      }
                      return false;
                    })()}
                  />
                </div>
              ),
            }))),
        ]}
        tabPosition={window && window.innerWidth > 600 ? "left" : "top"}
      />
    </div>
  );
};

async function fetchPDF(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
  return await res.arrayBuffer();
}
export const mergePDF = async (links: any[]) => {
  const mapping = links.filter((l) => l && l.trim() !== "");
  if (mapping.length === 0) return null;
  const mergedPdf = await PDFDocument.create();
  for (const url of mapping) {
    try {
      const pdfBytes = await fetchPDF(url);
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));
    } catch (err) {
      console.warn(`Skip file ${url}, bukan PDF valid`, err);
    }
  }

  const mergedBytes = await mergedPdf.save();
  const blob = new Blob([mergedBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
  const mergedUrl = URL.createObjectURL(blob);
  return mergedUrl;
};
