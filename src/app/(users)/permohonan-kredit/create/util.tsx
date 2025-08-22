import { useUser } from "@/components/contexts/UserContext";
import {
  EditActivity,
  IDescription,
  IFiles,
  IPermohonanKredit,
} from "@/components/IInterfaces";
import { FormInput, FormUpload } from "@/components/utils/FormUtils";
import { Files, JenisPemohon, RootFiles, User } from "@prisma/client";
import { App, Button, Select, Spin } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";

export default function CreatePermohonanKredit({
  record,
}: {
  record?: IPermohonanKredit;
}) {
  const [jeniss, setJenis] = useState<JenisPemohon[]>([]);
  const [userss, setUserss] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempDesc, setTempDesc] = useState<string>();
  const [activity, setActivity] = useState<string[]>([]);
  const user = useUser();
  const [data, setData] = useState<IPermohonanKredit>(
    record || defaultPermohonan
  );
  const { modal } = App.useApp();

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetch("/api/jenis-pemohon")
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setJenis(res.data.map((d: JenisPemohon) => ({ ...d, key: d.id })));
          }
        });
      await fetch("/api/user")
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setUserss(res.data.map((d: User) => ({ ...d, key: d.id })));
          }
        });
      if (!record) {
        await fetch("/api/rootfiles")
          .then((res) => res.json())
          .then((res) => {
            if (res.status === 200) {
              setData({
                ...data,
                userId: user ? user.id : defaultPermohonan.userId,
                User: user ? user : defaultPermohonan.User,
                RootFiles: res.data.map((r: RootFiles) => ({
                  ...r,
                  Files: [],
                })),
              });
            }
          });
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSubmit = async () => {
    if (!data.JenisPemohon.name || !data.User.fullname)
      return alert("Mohon lengkapi data terlebih dahulu");
    setLoading(true);
    if ("key" in data) {
      delete data.key;
    }
    if (activity.length !== 0) {
      const temp = data.activity
        ? (JSON.parse(data.activity) as EditActivity[])
        : [];
      temp.push({
        time: moment().format("DD/MM/YYYY HH:mm"),
        desc: `${user?.fullname}: ${activity.join(",")}`,
      });
      data.activity = JSON.stringify(temp);
    }
    if (tempDesc) {
      const temp = data.description
        ? (JSON.parse(data.description) as IDescription[])
        : [];
      temp.push({
        time: moment().format("DD/MM/YYYY HH:mm"),
        desc: tempDesc,
        user: user?.fullname || "",
      });
      data.description = JSON.stringify(temp);
    }
    await fetch("/api/permohonan", {
      method: record ? "PUT" : "POST",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 201) {
          modal.success({
            title: "BERHASIL",
            content: `Data berhasil ${record ? "di Update" : "Ditambahkan"}`,
          });
          await fetch("/api/sendEmail", {
            method: "POST",
            body: JSON.stringify({
              subject: `${record ? "Update" : ""} Permohonan Kredit ${
                !record ? "Baru" : ""
              } ${data.fullname}`,
              description: `${user?.fullname} Berhasil ${
                record ? "update" : "menambahkan"
              } data Permohonan Kredit ${!record ? "baru" : ""} ${
                data.fullname
              }<br/> ${activity && activity.join(",")}`,
            }),
          });
          setTempDesc(undefined);
          setActivity([]);
        } else {
          modal.error({
            title: "ERROR",
            content: res.msg,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({
          title: "ERROR",
          content: "Internal Server Error",
        });
      });
    setLoading(false);
  };

  return (
    <Spin spinning={loading}>
      <div
        className={`flex flex-col sm:flex-row gap-5  p-1 items-start h-[92vh] overflow-y-auto`}
      >
        <div className={`flex-1 flex  gap-2 justify-between flex-wrap`}>
          <div className="w-full bg-gradient-to-br from-purple-500 to-blue-500 text-gray-50 p-2 rounded font-bold">
            <p>DATA PEMOHON</p>
          </div>
          <FormInput
            label="Nama Pemohon"
            value={data.fullname}
            onChange={(e: string) => {
              setData({ ...data, fullname: e });
              const txt = `${record ? "Edit" : "Tambah"} Nama Pemohon (${
                record ? record.fullname : ""
              } ${record ? "to" : ""} ${e})`;
              setActivity((prev) => {
                prev = prev
                  ? prev.filter(
                      (p) =>
                        !p.includes(
                          `${record ? "Edit" : "Tambah"} Nama Pemohon`
                        )
                    )
                  : [];
                prev.push(txt);
                return prev;
              });
            }}
            align="col"
            width={"48%"}
            required
          />
          <FormInput
            label="Nomor NIK"
            value={data.NIK}
            type="number"
            onChange={(e: string) => {
              setData({ ...data, NIK: String(e) });
              const txt = `${record ? "Edit" : "Tambah"} NIK (${
                record ? record.NIK : ""
              } ${record ? "to" : ""} ${e})`;
              setActivity((prev) => {
                prev = prev
                  ? prev.filter(
                      (p) => !p.includes(`${record ? "Edit" : "Tambah"} NIK`)
                    )
                  : [];
                prev.push(txt);
                return prev;
              });
            }}
            align="col"
            width={"48%"}
          />
          <FormInput
            label="Nomor Rekening"
            value={data.accountNumber}
            type="number"
            onChange={(e: string) => {
              setData({
                ...data,
                accountNumber: String(e),
              });
              const txt = `${record ? "Edit" : "Tambah"} No Rekening (${
                record ? record.accountNumber : ""
              } ${record ? "to" : ""} ${e})`;
              setActivity((prev) => {
                prev = prev
                  ? prev.filter(
                      (p) =>
                        !p.includes(`${record ? "Edit" : "Tambah"} No Rekening`)
                    )
                  : [];
                prev.push(txt);
                return prev;
              });
            }}
            align="col"
            width={"48%"}
            // hide={user && user.role.roleName === "MARKETING" ? true : false}
          />
          <div style={{ width: "48%" }}>
            <div className="p-1">
              <span className="text-red-500 w-3">*</span> Jenis Pemohon
            </div>
            <Select
              options={jeniss.map((j) => ({ label: j.name, value: j.id }))}
              value={data.jenisPemohonId || undefined}
              style={{ width: "100%" }}
              onChange={(e) => {
                setData({
                  ...data,
                  jenisPemohonId: e,
                  JenisPemohon: jeniss.filter((j) => j.id === e)[0],
                });
                const txt = `${record ? "Edit" : "Tambah"} Jenis Pemohon (${
                  record ? record.jenisPemohonId : ""
                } ${record ? "to" : ""} ${e})`;
                setActivity((prev) => {
                  prev = prev
                    ? prev.filter(
                        (p) =>
                          !p.includes(
                            `${record ? "Edit" : "Tambah"} Jenis Pemohon`
                          )
                      )
                    : [];
                  prev.push(txt);
                  return prev;
                });
              }}
            />
          </div>
          <div style={{ width: "48%" }}>
            <div className="p-1">
              <span className="text-red-500 w-3">*</span> Marketing
            </div>
            <Select
              options={userss.map((u) => ({ label: u.fullname, value: u.id }))}
              style={{ width: "100%" }}
              value={data.userId}
              disabled={
                user &&
                ["MARKETING", "ACCOUNT OFFICER"].includes(user.role.roleName)
              }
              onChange={(e) => {
                const find = userss.filter((u) => u.id === e);
                if (find.length === 0)
                  return alert("Data Marketing tidak valid");

                setData({
                  ...data,
                  userId: e,
                  User: find[0],
                });
                const txt = `${record ? "Edit" : "Tambah"} Marketing (${
                  record ? record.userId : ""
                } ${record ? "to" : ""} ${e})`;
                setActivity((prev) => {
                  prev = prev
                    ? prev.filter(
                        (p) =>
                          !p.includes(`${record ? "Edit" : "Tambah"} Marketing`)
                      )
                    : [];
                  prev.push(txt);
                  return prev;
                });
              }}
            />
          </div>
          <div style={{ width: "48%" }}>
            <div className="p-1">
              <span className="text-red-500 w-3">*</span> Tujuan Penggunaan
            </div>
            <Select
              options={[
                { label: "Modal Kerja", value: "Modal Kerja" },
                { label: "Investasi", value: "Investasi" },
                { label: "Konsumsi", value: "Konsumsi" },
              ]}
              value={data.purposeUse || undefined}
              style={{ width: "100%" }}
              onChange={(e) => {
                setData({
                  ...data,
                  purposeUse: e,
                });
                const txt = `${record ? "Edit" : "Tambah"} Tujuan Penggunaan (${
                  record ? record.purposeUse : ""
                } ${record ? "to" : ""} ${e})`;
                setActivity((prev) => {
                  prev = prev
                    ? prev.filter(
                        (p) =>
                          !p.includes(
                            `${record ? "Edit" : "Tambah"} Tujuan Penggunaan`
                          )
                      )
                    : [];
                  prev.push(txt);
                  return prev;
                });
              }}
            />
          </div>
          <div className="w-full bg-gradient-to-br from-purple-500 to-blue-500 text-gray-50 p-2 rounded font-bold">
            <p>KETERANGAN</p>
          </div>
          {data.description &&
            (JSON.parse(data.description) as IDescription[]).map(
              (d: IDescription, i: number) => (
                <FormInput
                  type="area"
                  label={`${d.user} (${d.time})`}
                  value={d.desc}
                  onChange={(e: string) => {
                    const prevDesc = JSON.parse(
                      data.description || "[]"
                    ) as IDescription[];
                    prevDesc[i].desc = e;
                    setData({
                      ...data,
                      description: JSON.stringify(prevDesc), // simpan kembali ke string
                    });
                    const txt = `Edit Keterangan [index(${i})]`;
                    setActivity((prev) => {
                      prev = prev
                        ? prev.filter(
                            (p) =>
                              !p.includes(
                                `${
                                  record ? "Edit" : "Tambah"
                                } Keterangan [index(${i})]`
                              )
                          )
                        : [];
                      prev.push(txt);
                      return prev;
                    });
                  }}
                  align="col"
                  width={"48%"}
                  key={i}
                />
              )
            )}
          <FormInput
            type="area"
            label="Tambah Keterangan"
            value={tempDesc}
            onChange={(e: string) => {
              setTempDesc(e);
              const txt = `Tambah Keterangan (${e})`;
              setActivity((prev) => {
                prev = prev
                  ? prev.filter((p) => !p.includes("Tambah Keterangan"))
                  : [];
                prev.push(txt);
                return prev;
              });
            }}
            align="col"
            width={"48%"}
          />
        </div>
        <div className={`flex-1`}>
          <div className="w-full bg-gradient-to-br from-purple-500 to-green-500 text-gray-50 p-2 rounded font-bold">
            <p>BERKAS - BERKAS</p>
          </div>
          <div>
            {data.RootFiles.map((d) => (
              <FormUpload
                key={d.id}
                data={d}
                setChange={(e: IFiles[]) =>
                  setData((prev) => {
                    prev.RootFiles.map((p) => {
                      if (p.name === d.name) {
                        p.Files = e;
                      }
                      return p;
                    });
                    return prev;
                  })
                }
                setActivity={setActivity}
              />
            ))}
          </div>
          <div className="flex justify-end mt-5 mb-2 gap-4">
            <Button
              loading={loading}
              onClick={() =>
                window &&
                window.location.replace(
                  record ? "/document" : "/permohonan-kredit"
                )
              }
              danger
            >
              Back
            </Button>
            <Button
              type="primary"
              loading={loading}
              onClick={() => handleSubmit()}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </Spin>
  );
}

const defaultPermohonan: IPermohonanKredit = {
  id: 0,
  fullname: "",
  NIK: "",
  purposeUse: "",

  status: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  jenisPemohonId: 0,
  accountNumber: "",
  description: "",
  activity: "",
  userId: 0,
  JenisPemohon: {
    id: 0,
    name: "",
    keterangan: "",

    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  User: {
    id: 0,
    fullname: "",
    username: "",
    password: "",
    email: "",
    photo: "",

    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roleId: 0,
  },
  RootFiles: [],
};
