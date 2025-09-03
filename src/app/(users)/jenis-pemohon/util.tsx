"use client";

import { useUser } from "@/components/contexts/UserContext";
import { IUser } from "@/components/IInterfaces";
import { FormInput } from "@/components/utils/FormUtils";
import { useAccess } from "@/components/utils/PermissionUtil";
import {
  DeleteOutlined,
  FormOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { JenisPemohon } from "@prisma/client";
import { App, Button, Input, Modal, Table, TableProps, Typography } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
const { Paragraph } = Typography;

export default function TableJenisPemohon() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState<string>();
  const [data, setData] = useState<JenisPemohon[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { hasAccess } = useAccess("/jenis-pemohon");
  const user = useUser();
  const [selected, setSelected] = useState<JenisPemohon | undefined>(undefined);
  const [openUpsert, setOpenUpsert] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const getData = async () => {
    setLoading(true);
    await fetch(
      `/api/jenis-pemohon?page=${page}&pageSize=${pageSize}${
        search ? "&search=" + search : ""
      }`
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res.data.map((d: JenisPemohon) => ({ ...d, key: d.id })));
        setTotal(res.total);
      })
      .catch((err) => console.log(err));
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await getData();
    })();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await getData();
    }, 200);
    return () => clearTimeout(timeout);
  }, [search, page, pageSize]);

  const columns: TableProps<JenisPemohon>["columns"] = [
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
    },
    {
      title: "JENIS PEMOHON",
      dataIndex: "name",
      key: "name",
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
      render(value, record, index) {
        return <>{record.name}</>;
      },
    },
    {
      title: "KETERANGAN",
      dataIndex: "keterangan",
      key: "keterangan",
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
      render(value, record, index) {
        return (
          <>
            <Paragraph
              ellipsis={{
                rows: 1,
                expandable: "collapsible",
              }}
              style={{ fontSize: 12 }}
            >
              {record.keterangan}
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
            {user && (
              <>
                {hasAccess("update") && (
                  <Button
                    icon={<FormOutlined />}
                    type="primary"
                    size="small"
                    onClick={() => {
                      setSelected(record);
                      setOpenUpsert(true);
                    }}
                  ></Button>
                )}
              </>
            )}
            {user && (
              <>
                {hasAccess("delete") && (
                  <Button
                    icon={<DeleteOutlined />}
                    type="primary"
                    size="small"
                    onClick={() => {
                      setSelected(record);
                      setOpenDelete(true);
                    }}
                    danger
                  ></Button>
                )}
              </>
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
              <h1 className="font-bold text-xl">Jenis Pemohon</h1>
            </div>
            <div className="flex my-2 gap-2 justify-between">
              <div className="flex gap-2">
                {user && (
                  <>
                    {hasAccess("write") && (
                      <Button
                        icon={<PlusCircleOutlined />}
                        type="primary"
                        size="small"
                        onClick={() => {
                          setSelected(undefined);
                          setOpenUpsert(true);
                        }}
                      >
                        New
                      </Button>
                    )}
                  </>
                )}
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
      {user && (
        <UpsertJenisPemohon
          data={selected}
          getData={getData}
          user={user}
          key={selected ? selected.id : "new"}
          open={openUpsert}
          setOpen={setOpenUpsert}
        />
      )}
      {selected && user && (
        <DeleteJenisPemohon
          data={selected}
          getData={getData}
          user={user}
          open={openDelete}
          setOpen={setOpenDelete}
          key={selected && selected.id}
        />
      )}
    </div>
  );
}

const UpsertJenisPemohon = ({
  data,
  getData,
  user,
  open,
  setOpen,
}: {
  data?: JenisPemohon;
  getData: Function;
  user: IUser;
  open: boolean;
  setOpen: Function;
}) => {
  const [tempData, setTempData] = useState(data || defaultJenisPemohon);
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp();

  const handleSubmit = async () => {
    setLoading(true);
    if ("key" in tempData) {
      delete tempData.key;
    }
    await fetch("/api/jenis-pemohon", {
      method: data ? "PUT" : "POST",
      body: JSON.stringify({ ...tempData, updatedAt: new Date() }),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 201 || res.status === 200) {
          modal.success({
            title: "BERHASIL",
            content: `Data ${data ? data.name : tempData.name} berhasil ${
              data ? "di Update" : "Ditambahkan"
            }`,
          });
          getData();
          setOpen(false);
          await fetch("/api/sendEmail", {
            method: "POST",
            body: JSON.stringify({
              subject: `${data ? "Update" : "Penambahan"} Data Jenis Pemohon`,
              description: `${user?.fullname} Berhasil ${
                data ? "Update" : "menambahkan"
              } data Permohonan Kredit ${!data ? "Baru" : ""} ${tempData.name}`,
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
        title={`${
          data
            ? "UPDATE " + data.name.toUpperCase()
            : "TAMBAH JENIS PEMOHON BARU"
        }`}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => handleSubmit()}
        loading={loading}
        okButtonProps={{ loading: loading, disabled: !tempData.name }}
      >
        <div className="flex flex-col gap-2 my-4">
          <FormInput
            label="Jenis Pemohon"
            value={tempData.name}
            onChange={(e: any) => setTempData({ ...tempData, name: e })}
            required
          />
          <FormInput
            label="Keterangan"
            value={tempData.keterangan}
            onChange={(e: any) => setTempData({ ...tempData, keterangan: e })}
          />
        </div>
      </Modal>
    </div>
  );
};

const DeleteJenisPemohon = ({
  data,
  getData,
  user,
  open,
  setOpen,
}: {
  data: JenisPemohon;
  getData: Function;
  user: IUser;
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
    await fetch("/api/jenis-pemohon", {
      method: data ? "PUT" : "POST",
      body: JSON.stringify({ ...data, status: false, updatedAt: new Date() }),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 201 || res.status === 200) {
          modal.success({
            title: "BERHASIL",
            content: `Data ${data && data.name} berhasil dihapus`,
          });
          getData();
          setOpen(false);
          await fetch("/api/sendEmail", {
            method: "POST",
            body: JSON.stringify({
              subject: `Jenis Pomohon Berhasil Dihapus`,
              description: `${user?.fullname} Berhasil menghapus data Jenis Pemohon ${data.name}`,
            }),
          });
          return;
        }
        modal.error({ title: "ERROR", content: res.msg });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        Modal.error({ title: "ERROR", content: "Internal Server Error" });
      });
    setLoading(false);
  };
  return (
    <div>
      <Modal
        title={`HAPUS JENI PEMOHON ${data.name.toUpperCase()}`}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => handleSubmit()}
        loading={loading}
        okButtonProps={{ loading: loading }}
      >
        <div className="my-4">
          <p>Apakah anda yakin ingin menghapus Jenis Pemohon ini?</p>
        </div>
      </Modal>
    </div>
  );
};

const defaultJenisPemohon: JenisPemohon = {
  id: 1,
  name: "",
  keterangan: "",
  status: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
