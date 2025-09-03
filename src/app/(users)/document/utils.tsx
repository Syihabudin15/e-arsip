"use client";

import { IPemohon, IPermohonanKredit } from "@/components/IInterfaces";
import { FilterOption, FormInput } from "@/components/utils/FormUtils";
import {
  DeleteOutlined,
  FolderOutlined,
  FormOutlined,
  LoadingOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { JenisPemohon, Pemohon } from "@prisma/client";
import { App, Button, Input, Modal, Table, TableProps } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";

import { useAccess } from "@/components/utils/PermissionUtil";
import dynamic from "next/dynamic";
import { HookAPI } from "antd/es/modal/useModal";

const DetailPermohonan = dynamic(
  () =>
    import("@/app/(users)/permohonan-kredit").then((d) => d.DetailPermohonan),
  {
    ssr: false,
    loading: () => <LoadingOutlined />,
  }
);

export default function TableDokumen() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState<string>();
  const [jenisId, setJenisId] = useState<number>();
  const [data, setData] = useState<IPemohon[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [jeniss, setJeniss] = useState<JenisPemohon[]>([]);
  const { hasAccess } = useAccess("/document");
  const { modal } = App.useApp();
  const [selected, setSelected] = useState<IPemohon | undefined>(undefined);
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpsert, setOpenUpsert] = useState(false);

  const getData = async () => {
    setLoading(true);
    await fetch(
      `/api/pemohon?page=${page}&pageSize=${pageSize}${
        search ? "&search=" + search : ""
      }${jenisId ? "&jenisId=" + jenisId : ""}`
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res.data);
        setTotal(res.total);
      })
      .catch((err) => console.log(err));
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await getData();
      await fetch("/api/jenis-pemohon")
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) setJeniss(res.data);
        });
    })();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      getData();
    }, 200);
    return () => clearTimeout(timeout);
  }, [search, page, pageSize, jenisId]);

  const columns: TableProps<IPemohon>["columns"] = [
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
      title: "NO CIF",
      dataIndex: "noCIF",
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
      title: "NAMA DEBITUR",
      dataIndex: "fullname",
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
    },
    {
      title: "NOMOR NIK",
      dataIndex: "NIK",
      key: "nik",
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
      title: "JENIS PEMOHON",
      dataIndex: ["JenisPemohon", "name"],
      key: "jenisPemohon",
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
      title: "JUMLAH PERMOHONAN",
      dataIndex: "PermohonanKredit",
      key: "jenisPemohon",
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
        return <>{record.PermohonanKredit.length}</>;
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
            {hasAccess("update") && (
              <Button
                size="small"
                icon={<FormOutlined />}
                onClick={() => {
                  setSelected(record);
                  setOpenUpsert(true);
                }}
                type="primary"
              ></Button>
            )}
            {hasAccess("delete") && (
              <Button
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => {
                  setSelected(record);
                  setOpenDelete(true);
                }}
                type="primary"
                danger
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
              <h1 className="font-bold text-xl">Dokumen</h1>
            </div>
            <div className="flex my-2 gap-2 justify-between overflow-auto">
              <div className="flex gap-2">
                {hasAccess("write") && (
                  <Button
                    size="small"
                    icon={<PlusCircleOutlined />}
                    onClick={() => {
                      setSelected(undefined);
                      setOpenUpsert(true);
                    }}
                    type="primary"
                  >
                    New
                  </Button>
                )}
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
        expandable={{
          expandedRowRender: (record) => (
            <TablePermohonan
              data={record.PermohonanKredit}
              hasAccess={hasAccess}
            />
          ),
          rowExpandable: (record) => record.PermohonanKredit.length !== 0,
        }}
      />
      {selected && (
        <DeletePemohon
          getData={getData}
          record={selected}
          jeniss={jeniss}
          hook={modal}
          open={openDelete}
          setOpen={setOpenDelete}
          key={selected.id}
        />
      )}
      <UpsertPemohon
        getData={getData}
        record={selected}
        jeniss={jeniss}
        hook={modal}
        key={selected && selected.id}
        open={openUpsert}
        setOpen={setOpenUpsert}
      />
    </div>
  );
}

const UpsertPemohon = ({
  record,
  getData,
  jeniss,
  hook,
  open,
  setOpen,
}: {
  record?: Pemohon;
  getData: Function;
  jeniss: JenisPemohon[];
  hook: HookAPI;
  open: boolean;
  setOpen: Function;
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Pemohon>(record || defaultPemohon);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/pemohon", {
      method: record ? "PUT" : "POST",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status !== 201) {
          hook.error({ title: "ERROR", content: res.msg });
        } else {
          hook.success({ title: "BERHASIL", content: res.msg });
          if (!record) {
            setData(defaultPemohon);
          }
          setOpen(false);
          getData();
        }
      })
      .catch((err) => {
        console.log(err);
        hook.error({ title: "ERROR", content: "Internal Server Error" });
      });
    setLoading(false);
  };

  return (
    <div>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={`${record ? "UPDATE" : "TAMBAH"} DATA PEMOHON ${
          record ? record.fullname : ""
        }`}
        loading={loading}
        okButtonProps={{
          loading: loading,
          disabled:
            !data.noCIF || !data.fullname || !data.jenisPemohonId || !data.NIK,
          onClick: () => handleSubmit(),
        }}
      >
        <div className="my-4 flex flex-col gap-1">
          <FormInput
            label="Nomor CIF"
            value={data.noCIF}
            type="number"
            onChange={(e: string) => setData({ ...data, noCIF: e })}
          />
          <FormInput
            label="Nama Lengkap"
            value={data.fullname}
            onChange={(e: string) => setData({ ...data, fullname: e })}
          />
          <FormInput
            label="NIK"
            value={data.NIK}
            onChange={(e: string) => setData({ ...data, NIK: e })}
          />
          <FormInput
            label="Jenis Pemohon"
            value={data.jenisPemohonId || undefined}
            onChange={(e: any) => setData({ ...data, jenisPemohonId: e })}
            type="option"
            options={jeniss.map((j) => ({ label: j.name, value: j.id }))}
          />
        </div>
      </Modal>
    </div>
  );
};

const DeletePemohon = ({
  record,
  getData,
  jeniss,
  hook,
  open,
  setOpen,
}: {
  record: Pemohon;
  getData: Function;
  jeniss: JenisPemohon[];
  hook: HookAPI;
  open: boolean;
  setOpen: Function;
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/pemohon", {
      method: "DELETE",
      body: JSON.stringify(record),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status !== 201) {
          hook.error({ title: "ERROR", content: res.msg });
        } else {
          hook.success({ title: "BERHASIL", content: res.msg });
          setOpen(false);
          getData();
        }
      })
      .catch((err) => {
        console.log(err);
        hook.error({ title: "ERROR", content: "Internal Server Error" });
      });
    setLoading(false);
  };

  return (
    <div>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={`HAPUS DATA PEMOHON ${record.fullname}`}
        loading={loading}
        okButtonProps={{
          loading: loading,
          onClick: () => handleSubmit(),
        }}
      >
        <div className="my-4 flex flex-col gap-1">
          <FormInput label="Nomor CIF" disable value={record.noCIF} />
          <FormInput label="Nama Lengkap" disable value={record.fullname} />
          <FormInput label="NIK" disable value={record.NIK} />
          <FormInput
            label="Jenis Pemohon"
            disable
            value={record.jenisPemohonId}
            type="option"
            options={jeniss.map((j) => ({ label: j.name, value: j.id }))}
          />
        </div>
      </Modal>
    </div>
  );
};

const defaultPemohon: Pemohon = {
  id: 0,
  fullname: "",
  NIK: "",
  noCIF: "",
  status: true,
  jenisPemohonId: 0,
};

const TablePermohonan = ({
  data,
  hasAccess,
}: {
  data: IPermohonanKredit[];
  hasAccess: Function;
}) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [selected, setSelected] = useState<IPermohonanKredit | undefined>(
    undefined
  );

  const columns: TableProps<IPermohonanKredit>["columns"] = [
    {
      title: "NAMA PRODUK",
      dataIndex: ["Produk", "name"],
      key: "produkName",
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
      title: "NO REKENING",
      dataIndex: "accountNumber",
      key: "accountNumber",
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
      title: "MARKETING",
      dataIndex: ["User", "fullname"],
      key: "marketing",
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
      title: "ACTION",
      dataIndex: "action",
      key: "action",
      className: "text-xs",
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
        return (
          <div className="flex justify-center">
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
          </div>
        );
      },
    },
  ];
  return (
    <div>
      <Table
        rowKey={"id"}
        columns={columns}
        size="small"
        bordered
        dataSource={data}
        pagination={false}
      />
      {selected && (
        <DetailPermohonan
          data={selected}
          open={openDetail}
          setOpen={setOpenDetail}
          key={selected.id}
        />
      )}
    </div>
  );
};
