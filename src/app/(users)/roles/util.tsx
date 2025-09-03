"use client";

import { useUser } from "@/components/contexts/UserContext";
import { IPermission, IUser } from "@/components/IInterfaces";
import { useAccess } from "@/components/utils/PermissionUtil";
import {
  DeleteOutlined,
  FormOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Role } from "@prisma/client";
import { App, Button, Input, Modal, Table, TableProps, Typography } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
const { Paragraph } = Typography;

export default function TableRole() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState<string>();
  const [data, setData] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { hasAccess } = useAccess("/roles");
  const user = useUser();
  const [selected, setSelected] = useState<Role>();
  const [open, setOpen] = useState(false);

  const getData = async () => {
    setLoading(true);
    await fetch(
      `/api/role?page=${page}&pageSize=${pageSize}${
        search ? "&search=" + search : ""
      }`
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res.data.map((d: Role) => ({ ...d, key: d.id })));
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

  const columns: TableProps<Role>["columns"] = [
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
      title: "ROLE NAME",
      dataIndex: "roleName",
      key: "roleName",
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
        return <>{record.roleName}</>;
      },
    },
    {
      title: "PERMISSION",
      dataIndex: "permission",
      key: "permission",
      className: "text-xs",
      width: 250,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
          },
        };
      },
      render(value, record, index) {
        const displayText = JSON.parse(record.permission) as IPermission[];
        return (
          <>
            <Paragraph
              ellipsis={{
                rows: 1,
                expandable: "collapsible",
              }}
              style={{ fontSize: 11 }}
            >
              {displayText.map((p) => (
                <>
                  {p.path}: [{p.access.join(",")}]<br />
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
            {user && (
              <>
                {hasAccess("delete") && (
                  <Button
                    icon={<DeleteOutlined />}
                    type="primary"
                    danger
                    onClick={() => {
                      setSelected(record);
                      setOpen(true);
                    }}
                    size="small"
                  ></Button>
                )}
              </>
            )}
            {hasAccess("update") && (
              <Button
                size="small"
                type="primary"
                icon={<FormOutlined />}
                onClick={() =>
                  window && window.location.replace("/roles/" + record.id)
                }
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
              <h1 className="font-bold text-xl">Roles Management</h1>
            </div>
            <div className="flex my-2 gap-2 justify-between">
              <div className="flex gap-2">
                {hasAccess("write") && (
                  <Button
                    icon={<PlusCircleOutlined />}
                    size="small"
                    type="primary"
                    onClick={() =>
                      window && window.location.replace("/roles/create")
                    }
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
      {selected && user && (
        <DeleteRole
          data={selected}
          getData={getData}
          user={user}
          open={open}
          setOpen={setOpen}
          key={selected.id}
        />
      )}
    </div>
  );
}

const DeleteRole = ({
  data,
  getData,
  user,
  open,
  setOpen,
}: {
  data: Role;
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
    await fetch("/api/role", {
      method: data ? "PUT" : "POST",
      body: JSON.stringify({ ...data, status: false, updatedAt: new Date() }),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 201 || res.status === 200) {
          modal.success({
            title: "BERHASIL",
            content: `Data berhasil dihapus`,
          });
          getData();
          setOpen(false);
          await fetch("/api/sendEmail", {
            method: "POST",
            body: JSON.stringify({
              subject: `Hapus Data Role ${data.roleName}`,
              description: `${user?.fullname} Berhasil melakukan menghapus data Role ${data.roleName}`,
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
        title={`HAPUS ROLE ${data.roleName}`}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => handleSubmit()}
        loading={loading}
        okButtonProps={{ loading: loading }}
      >
        <div className="my-4">
          <p>Apakah anda yakin ingin menghapus Role ini?</p>
        </div>
      </Modal>
    </div>
  );
};
