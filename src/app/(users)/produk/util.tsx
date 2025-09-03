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
import { Produk } from "@prisma/client";
import { App, Button, Input, Modal, Table, TableProps } from "antd";
import { HookAPI } from "antd/es/modal/useModal";
import moment from "moment";
import { useEffect, useState } from "react";

export default function TableProduk() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState<string>();
  const [data, setData] = useState<Produk[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { hasAccess } = useAccess("/produk");
  const user = useUser();
  const { modal } = App.useApp();
  const [selected, setSelected] = useState<Produk | undefined>(undefined);
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpsert, setOpenUpsert] = useState(false);

  const getData = async () => {
    setLoading(true);
    await fetch(
      `/api/produk?page=${page}&pageSize=${pageSize}${
        search ? "&search=" + search : ""
      }`
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
    })();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await getData();
    }, 200);
    return () => clearTimeout(timeout);
  }, [search, page, pageSize]);

  const columns: TableProps<Produk>["columns"] = [
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
      title: "KODE PRODUK",
      dataIndex: "code",
      key: "code",
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
      title: "NAMA PRODUK",
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
    },
    {
      title: "KETERANGAN",
      dataIndex: "description",
      key: "description",
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
            {hasAccess("update") && (
              <Button
                icon={<FormOutlined />}
                size="small"
                type="primary"
                onClick={() => {
                  setSelected(record);
                  setOpenUpsert(true);
                }}
              ></Button>
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
              <h1 className="font-bold text-xl">Produk Management</h1>
            </div>
            <div className="flex my-2 gap-2 justify-between">
              <div className="flex gap-2">
                {hasAccess("write") && (
                  <Button
                    icon={<PlusCircleOutlined />}
                    size="small"
                    type="primary"
                    onClick={() => {
                      setSelected(undefined);
                      setOpenUpsert(true);
                    }}
                  >
                    New
                  </Button>
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
        columns={columns}
        rowKey={"id"}
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
        <DeleteProduk
          getData={getData}
          modal={modal}
          data={selected}
          user={user as IUser}
          open={openDelete}
          setOpen={setOpenDelete}
        />
      )}
      <UpsertProduk
        getData={getData}
        hook={modal}
        user={user}
        open={openUpsert}
        setOpen={setOpenUpsert}
        key={selected && selected.id}
        record={selected}
      />
    </div>
  );
}

const DeleteProduk = ({
  data,
  getData,
  user,
  modal,
  open,
  setOpen,
}: {
  data: Produk;
  getData: Function;
  user: IUser;
  modal: HookAPI;
  open: boolean;
  setOpen: Function;
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    if ("key" in data) {
      delete data.key;
    }
    await fetch("/api/produk", {
      method: "DELETE",
      body: JSON.stringify({ ...data, status: false, updatedAt: new Date() }),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 201 || res.status === 200) {
          modal.success({
            title: "BERHASIL",
            content: `Hapus data Produk ${data.name} berhasil`,
          });
          getData();
          setOpen(false);
          await fetch("/api/sendEmail", {
            method: "POST",
            body: JSON.stringify({
              subject: `Hapus Data Produk ${data.name}`,
              description: `${user?.fullname} Berhasil melakukan menghapus data Produk ${data.name}`,
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
        title={`HAPUS PRODUK ${data.name} (${data.code})`}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => handleSubmit()}
        loading={loading}
        okButtonProps={{ loading: loading }}
      >
        <div className="my-4">
          <p>
            Apakah anda yakin ingin menghapus Produk ini {data.name} (
            {data.code})?
          </p>
        </div>
      </Modal>
    </div>
  );
};

const UpsertProduk = ({
  record,
  getData,
  hook,
  user,
  open,
  setOpen,
}: {
  record?: Produk;
  getData: Function;
  hook: HookAPI;
  user?: IUser;
  open: boolean;
  setOpen: Function;
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Produk>(record || defaultProduk);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/produk", {
      method: record ? "PUT" : "POST",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status !== 201) {
          hook.error({ title: "ERROR", content: res.msg });
        } else {
          hook.success({
            title: "BERHASIL",
            content: `Produk ${data.name} Berhasil ${
              record ? "Diupdate" : "Ditambahkan"
            }`,
          });
          setOpen(false);
          getData();
          fetch("/api/sendEmail", {
            method: "POST",
            body: JSON.stringify({
              subject: `Hapus Data Produk ${data.name}`,
              description: `${user?.fullname} Berhasil melakukan menghapus data Produk ${data.name}`,
            }),
          });
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
        title={`${record ? "UPDATE" : "TAMBAH"} DATA PRODUK ${
          record ? record.name : ""
        }`}
        loading={loading}
        okButtonProps={{
          loading: loading,
          disabled: !data.code || !data.name,
          onClick: () => handleSubmit(),
        }}
      >
        <div className="my-4 flex flex-col gap-1">
          <FormInput
            label="Kode Produk"
            value={data.code}
            onChange={(e: string) => setData({ ...data, code: e })}
          />
          <FormInput
            label="Nama Produk"
            value={data.name}
            onChange={(e: string) => setData({ ...data, name: e })}
          />
          <FormInput
            label="Keterangan"
            value={data.description}
            type="area"
            onChange={(e: string) => setData({ ...data, description: e })}
          />
        </div>
      </Modal>
    </div>
  );
};

const defaultProduk = {
  id: 0,
  code: "",
  name: "",
  description: "",
  status: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
