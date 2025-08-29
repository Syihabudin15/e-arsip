"use client";

import { useUser } from "@/components/contexts/UserContext";
import {
  EditActivity,
  IDescription,
  IFiles,
  IPermohonanAction,
  IPermohonanKredit,
  IUser,
} from "@/components/IInterfaces";
import { FormInput } from "@/components/utils/FormUtils";
import { MyPDFViewer } from "@/components/utils/LayoutUtil";
import { useAccess } from "@/components/utils/PermissionUtil";
import {
  FolderOutlined,
  FormOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { ENeedAction, StatusAction } from "@prisma/client";
import {
  App,
  Button,
  Input,
  Modal,
  Table,
  TableProps,
  Tabs,
  Tag,
  Typography,
} from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
const { Paragraph } = Typography;

export default function TableDownload() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState<string>();
  const [data, setData] = useState<IPermohonanAction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { hasAccess } = useAccess("/request/downloads");
  const [dataKredit, setDataKredit] = useState<IPermohonanKredit[]>([]);
  const user = useUser();

  const getData = async () => {
    setLoading(true);
    await fetch(
      `/api/request?page=${page}&pageSize=${pageSize}&action=DOWNLOAD${
        search ? "&search=" + search : ""
      }`
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setData(res.data);
        setTotal(res.total);
      })
      .catch((err) => console.log(err));
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await getData();
      await fetch(`/api/permohonan?page=1&pageSize=5000`)
        .then((res) => res.json())
        .then((res) => {
          setDataKredit(res.data);
        })
        .catch((err) => console.log(err));
    })();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await getData();
    }, 200);
    return () => clearTimeout(timeout);
  }, [search, page, pageSize]);

  const columns: TableProps<IPermohonanAction>["columns"] = [
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
      title: "PEMOHON DOWNLOAD FILE",
      dataIndex: ["Requester", "fullname"],
      key: "pemohonKredit",
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
      title: "NAMA FILE",
      dataIndex: "rootFilename",
      key: "rootFilename",
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
              {record.RootFiles.map((rf) => ({
                name: rf.name,
                files: rf.Files.map((rff) => rff.name).join(", "),
              })).map((r) => (
                <>
                  {r.name} ({r.files})<br />
                </>
              ))}
            </Paragraph>
          </>
        );
      },
    },
    {
      title: "DATA KREDIT",
      dataIndex: ["PermohonanKredit", "Pemohon", "fullname"],
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
      title: "STATUS",
      dataIndex: "statusAction",
      key: "statusAction",
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
      render(value, record, index) {
        return (
          <div className="flex justify-center">
            {record.statusAction === StatusAction.PENDING && (
              <Tag color="#ffa500">{record.statusAction}</Tag>
            )}
            {record.statusAction === StatusAction.APPROVED && (
              <Tag color="#5fb739">{record.statusAction}</Tag>
            )}
            {record.statusAction === StatusAction.REJECTED && (
              <Tag color="#f50">{record.statusAction}</Tag>
            )}
          </div>
        );
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
      render(value, record, index) {
        const desc: IDescription[] | null = record.description
          ? JSON.parse(record.description)
          : null;
        return (
          <>
            <Paragraph
              ellipsis={{
                rows: 1,
                expandable: "collapsible",
              }}
              style={{ fontSize: 11 }}
            >
              {desc &&
                desc.map((d) => (
                  <>
                    {"{"}
                    {d.user} ({d.time}): {d.desc}
                    {"}"}
                    <br />
                    <br />
                  </>
                ))}
            </Paragraph>
          </>
        );
      },
    },
    {
      title: "PEMROSES",
      dataIndex: ["Approver", "fullname"],
      key: "approver",
      className: "text-xs text-center",
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
            {(hasAccess("update") || hasAccess("detail")) && (
              <ProsesDownloadFile
                data={record}
                getData={getData}
                user={user || null}
                hasAccess={hasAccess}
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      title={() => (
        <div>
          <div className="border-b border-blue-500 py-2">
            <h1 className="font-bold text-xl">PERMOHONAN DOWNLOAD FILE</h1>
          </div>
          <div className="flex my-2 gap-2 justify-between">
            <div className="flex gap-2">
              {hasAccess("write") && (
                <CreateDownloadFile
                  data={dataKredit}
                  getData={getData}
                  user={user || null}
                />
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
  );
}

const ProsesDownloadFile = ({
  data,
  getData,
  user,
  hasAccess,
}: {
  data: IPermohonanAction;
  getData: Function;
  user: IUser | null;
  hasAccess: Function;
}) => {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState<string>();
  const [status, setStatus] = useState<StatusAction>();
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp();

  const handleSubmit = async () => {
    setLoading(true);
    if (desc) {
      const currDesc: IDescription[] = data.description
        ? JSON.parse(data.description)
        : [];
      currDesc.push({
        user: user?.fullname || "",
        time: moment().format("DD/MM/YYYY HH:mm"),
        desc,
      });
      data.description = JSON.stringify(currDesc);
    }
    data.statusAction = status || StatusAction.PENDING;
    data.approverId = user?.id || null;

    await fetch("/api/request", {
      method: "PUT",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status !== 201) {
          modal.error({ title: "ERROR", content: res.msg });
        } else {
          modal.success({
            title: "BERHASIL",
            content: `User ${data.Requester.fullname} ${
              data.statusAction === StatusAction.APPROVED
                ? "sekarang dapat mendownload berkas-berkas ini"
                : "Belum dapat mendownload berkas-berkas ini kare status " +
                  data.statusAction
            }`,
          });
          setOpen(false);
          getData();
          await fetch("/api/sendEmail", {
            method: "POST",
            body: JSON.stringify({
              subject: `Proses Permohonan Download File`,
              description: `${
                user?.fullname
              } Berhasil melakukan proses download file pada data permohonan ${
                data.PermohonanKredit.Pemohon.fullname
              } dengan status ${data.statusAction}. ${
                data.statusAction === StatusAction.APPROVED
                  ? `sekarang ${data.Requester.fullname} dapat mendownload berkas-berkas tersebut. <br/> Berikut detail dari data data yang telah disetujui untuk di download :`
                  : ""
              } <br/><br/> ${data.RootFiles.map((rf) => ({
                name: rf.name,
                files: rf.Files.map((rff) => rff.name).join(", "),
              })).map((r) => `${r.name} (${r.files})<br />`)}`,
            }),
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
    setLoading(false);
  };

  const handleHasDownload = async (currFile: any) => {
    if (!currFile) return;
    const tempAct = {
      time: moment().format("DD/MM/YYYY HH:mm"),
      desc: `${user?.fullname}: berhasil mendownload file ${currFile.name}`,
      user: user?.fullname,
    };

    await fetch("/api/request", {
      method: "PATCH",
      body: JSON.stringify({
        actionId: data.id,
        activities: tempAct,
        File: currFile,
      }),
    })
      .then((res) => res.json())
      .then(async () => {
        setOpen(false);
        getData();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <Button
        size="small"
        type="primary"
        disabled={
          hasAccess("detail") && data.statusAction !== StatusAction.APPROVED
        }
        icon={
          data.statusAction === StatusAction.APPROVED ? (
            <FolderOutlined />
          ) : (
            <FormOutlined />
          )
        }
        onClick={() => setOpen(true)}
      ></Button>
      <Modal
        title={"PROSES PERMOHONAN"}
        open={open}
        onCancel={() => setOpen(false)}
        width={window.innerWidth > 600 ? "90vw" : "95vw"}
        style={{ top: 20 }}
        footer={[]}
        loading={loading}
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="w-full sm:flex-1">
            <Tabs
              size="small"
              type="card"
              items={[
                ...data.RootFiles.flatMap((f) => f.Files).map((f) => ({
                  label: f.name,
                  key: f.name + Date.now(),
                  children: (
                    <div
                      className="h-[72vh]"
                      onClick={() => console.log({ f })}
                    >
                      <MyPDFViewer
                        fileUrl={f.url}
                        download={(() => {
                          const filter = f.allowDownload
                            .split(",")
                            .map(Number)
                            .includes(user?.id || 0);
                          if (hasAccess("download") || filter) {
                            return true;
                          }
                          return false;
                        })()}
                        onDownload={() => handleHasDownload(f)}
                      />
                    </div>
                  ),
                })),
              ]}
              tabPosition={"top"}
            />
          </div>
          <div className="w-full sm:flex-1">
            <div className="p-2 font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-gray-50">
              <p>INFORMASI PERMOHONAN</p>
            </div>
            <div className="flex flex-col gap-1 h-[72vh] overflow-auto">
              <FormInput
                label="PEMOHON"
                value={data.Requester.fullname}
                disable
              />
              <FormInput
                label="DATA KREDIT"
                value={data.PermohonanKredit.Pemohon.fullname}
                disable
              />
              {data.RootFiles.map((rf) => (
                <FormInput
                  label={rf.name}
                  value={rf.Files.map((f) => f.name).join(",")}
                  disable
                  key={rf.id}
                />
              ))}
              {data.description &&
                JSON.parse(data.description).map(
                  (
                    d: { user: string; time: string; desc: string },
                    i: number
                  ) => (
                    <FormInput
                      label={`${d.user} (${d.time})`}
                      type="area"
                      value={d.desc}
                      disable
                      key={i}
                    />
                  )
                )}
              {data.statusAction === StatusAction.PENDING &&
                hasAccess("update") && (
                  <>
                    <div className="p-2 font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-gray-50">
                      <p>PROSES PERMOHONAN</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <FormInput
                        label="Status"
                        value={status}
                        onChange={(e: any) => setStatus(e)}
                        type="option"
                        options={[
                          {
                            label: StatusAction.PENDING,
                            value: StatusAction.PENDING,
                          },
                          {
                            label: StatusAction.APPROVED,
                            value: StatusAction.APPROVED,
                          },
                          {
                            label: StatusAction.REJECTED,
                            value: StatusAction.REJECTED,
                          },
                        ]}
                        required
                      />
                      <FormInput
                        label="Keterangan"
                        value={desc}
                        onChange={(e: any) => setDesc(e)}
                        type="area"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="primary"
                          loading={loading}
                          disabled={!status}
                          onClick={() => handleSubmit()}
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const CreateDownloadFile = ({
  data,
  getData,
  user,
}: {
  data: IPermohonanKredit[];
  getData: Function;
  user: IUser | null;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<IPermohonanKredit>();
  const [filesSelected, setFilesSelected] = useState<IFiles[]>([]);
  const [desc, setDesc] = useState<string>();
  const { modal } = App.useApp();

  const handleSubmit = async () => {
    setLoading(true);
    const newData = {
      statusAction: StatusAction.PENDING,
      description: JSON.stringify([
        {
          user: user?.fullname,
          time: moment().format("DD/MM/YYYY HH:mm"),
          desc,
        },
      ]),
      action: ENeedAction.DOWNLOAD,

      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      requesterId: user?.id || 0,
      approverId: null,
      permohonanKreditId: selected ? selected.id : 0,
      Files: filesSelected,
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
            content: "Permohonan download file berhasil dikirimkan",
          });
          await fetch("/api/sendEmail", {
            method: "POST",
            body: JSON.stringify({
              subject: `Permohonan Download File Baru`,
              description: `${
                user?.fullname
              } berhasil mengajukan permohonan download file baru untuk data kredit ${
                selected?.Pemohon.fullname
              } <br/><br/> ${filesSelected.map((f) => f.name).join(",")}`,
            }),
          });
          setOpen(false);
          await getData();
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

  return (
    <div>
      <Button
        icon={<PlusCircleOutlined />}
        size="small"
        type="primary"
        onClick={() => setOpen(true)}
      >
        New
      </Button>
      <Modal
        open={open}
        title="BUAT PERMOHONAN DOWNLOAD FILE"
        onCancel={() => setOpen(false)}
        loading={loading}
        style={{ top: 30 }}
        okButtonProps={{ disabled: filesSelected.length === 0 }}
        onOk={() => handleSubmit()}
      >
        <div className="flex flex-col gap-1">
          <FormInput
            label="Data Kredit"
            type="option"
            value={selected?.id}
            onChange={(e: any) => {
              const find = data.filter((f) => f.id === e);
              if (find.length === 0) return alert("Invalid Data Kredit");
              setSelected(find[0]);
            }}
            options={data.map((d) => ({
              label: d.Pemohon.fullname,
              value: d.id,
            }))}
          />
          {selected && (
            <FormInput
              label="Files"
              type="option"
              value={filesSelected.map((f) => f.url)}
              onChange={(e: any) => {
                setFilesSelected(
                  e.map(
                    (m: string) =>
                      selected.RootFiles.flatMap((rf) => rf.Files).filter(
                        (f) => f.url == m
                      )[0]
                  )
                );
              }}
              options={selected.RootFiles.flatMap((rf) => rf.Files).map(
                (f) => ({
                  label: `${f.name}`,
                  value: f.url,
                  disabled: f.allowDownload
                    .split(",")
                    .map(Number)
                    .includes(user ? user?.id : 0),
                })
              )}
              optionsMode="multiple"
            />
          )}
          <FormInput
            label="Keterangan"
            type="area"
            value={desc}
            onChange={(e: any) => setDesc(e)}
          />
        </div>
      </Modal>
    </div>
  );
};
