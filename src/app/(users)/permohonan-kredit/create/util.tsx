import { useUser } from "@/components/contexts/UserContext";
import {
  EditActivity,
  IDescription,
  IFiles,
  IPermohonanKredit,
} from "@/components/IInterfaces";
import { FormInput, FormUpload } from "@/components/utils/FormUtils";
import { JenisPemohon, Pemohon, Produk, RootFiles, User } from "@prisma/client";
import { App, Button, Select, Spin } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";

export default function CreatePermohonanKredit({
  record,
}: {
  record?: IPermohonanKredit;
}) {
  const [pemohons, setPemohons] = useState<Pemohon[]>([]);
  const [jeniss, setJeniss] = useState<JenisPemohon[]>([]);
  const [produks, setProduks] = useState<Produk[]>([]);
  const [userss, setUserss] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempDesc, setTempDesc] = useState<string>();
  const [activity, setActivity] = useState<string[]>([]);
  const [disableEdit, setDisableEdit] = useState(false);
  const user = useUser();
  const [data, setData] = useState<IPermohonanKredit>(
    record || defaultPermohonan
  );
  const { modal } = App.useApp();

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetch("/api/pemohon")
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setPemohons(res.data);
          }
        });
      await fetch("/api/jenis-pemohon")
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setJeniss(res.data);
          }
        });
      await fetch("/api/produk")
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setProduks(res.data);
          }
        });
      await fetch("/api/user")
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setUserss(res.data);
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
    if (!data.produkId || !data.userId || !data.pemohonId)
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
            content: `Data Permohon Kredit ${data.Pemohon.fullname} berhasil ${
              record ? "di Update" : "Ditambahkan"
            }`,
          });
          await fetch("/api/sendEmail", {
            method: "POST",
            body: JSON.stringify({
              subject: `${record ? "Update" : ""} Permohonan Kredit ${
                !record ? "Baru" : ""
              } ${data.Pemohon.fullname}`,
              description: `${user?.fullname} Berhasil ${
                record ? "update" : "menambahkan"
              } data Permohonan Kredit ${!record ? "baru" : ""} ${
                data.Pemohon.fullname
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
  const handleSearch = async (e: string) => {
    await fetch(`/api/pemohon?search=${e}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 200) {
          setPemohons(res.data);
        }
      })
      .catch((err) => console.log(err));
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
            type="option"
            optionsMode="tags"
            value={data.pemohonId ? [String(data.pemohonId)] : undefined}
            optionsLength={1}
            onSearch={(e: string) => handleSearch(e)}
            onChange={(e: any) => {
              const find = pemohons.filter((p) => p.id === Number(e[0]));
              if (find.length !== 0) {
                setDisableEdit(true);
                setData({
                  ...data,
                  pemohonId: find[0].id,
                  Pemohon: {
                    ...find[0],
                  },
                });
              } else {
                setDisableEdit(false);
                if (e.length === 0) {
                  setData({
                    ...data,
                    Pemohon: defaultPermohonan.Pemohon,
                    pemohonId: 0,
                  });
                } else {
                  setData({
                    ...data,
                    Pemohon: {
                      ...data.Pemohon,
                      fullname: e[0],
                    },
                  });
                }
              }
              const txt = `${record ? "Edit" : "Tambah"} Nama Pemohon (${
                record ? record.Pemohon.fullname : ""
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
            options={pemohons.map((p) => ({
              label: `${p.fullname} | ${p.NIK} (${p.noCIF})`,
              value: String(p.id),
            }))}
          />
          <FormInput
            label="Nomor CIF"
            required
            value={data.Pemohon.noCIF}
            type="number"
            onChange={(e: string) => {
              setData({
                ...data,
                Pemohon: {
                  ...data.Pemohon,
                  noCIF: String(e),
                },
              });
              const txt = `${record ? "Edit" : "Tambah"} No CIF (${
                record ? record.Pemohon.noCIF : ""
              } ${record ? "to" : ""} ${e})`;
              setActivity((prev) => {
                prev = prev
                  ? prev.filter(
                      (p) => !p.includes(`${record ? "Edit" : "Tambah"} No CIF`)
                    )
                  : [];
                prev.push(txt);
                return prev;
              });
            }}
            align="col"
            width={"48%"}
            disable={record ? true : disableEdit}
          />
          <FormInput
            label="Nomor NIK"
            value={data.Pemohon.NIK}
            required
            type="number"
            onChange={(e: string) => {
              setData({
                ...data,
                Pemohon: {
                  ...data.Pemohon,
                  NIK: String(e),
                },
              });
              const txt = `${record ? "Edit" : "Tambah"} No NIK (${
                record ? record.Pemohon.noCIF : ""
              } ${record ? "to" : ""} ${e})`;
              setActivity((prev) => {
                prev = prev
                  ? prev.filter(
                      (p) => !p.includes(`${record ? "Edit" : "Tambah"} No NIK`)
                    )
                  : [];
                prev.push(txt);
                return prev;
              });
            }}
            align="col"
            width={"48%"}
            disable={record ? true : disableEdit}
          />
          <FormInput
            label="Nomor CIF"
            value={data.Pemohon.noCIF}
            required
            type="number"
            onChange={(e: string) => {
              setData({
                ...data,
                Pemohon: {
                  ...data.Pemohon,
                  noCIF: String(e),
                },
              });
              const txt = `${record ? "Edit" : "Tambah"} No CIF (${
                record ? record.Pemohon.noCIF : ""
              } ${record ? "to" : ""} ${e})`;
              setActivity((prev) => {
                prev = prev
                  ? prev.filter(
                      (p) => !p.includes(`${record ? "Edit" : "Tambah"} No CIF`)
                    )
                  : [];
                prev.push(txt);
                return prev;
              });
            }}
            align="col"
            width={"48%"}
            disable={record ? true : disableEdit}
          />
          <FormInput
            label="Jenis Pemohon"
            value={data.Pemohon.jenisPemohonId || undefined}
            required
            type="option"
            options={jeniss.map((j) => ({ label: j.name, value: j.id }))}
            onChange={(e: any) => {
              setData({
                ...data,
                Pemohon: {
                  ...data.Pemohon,
                  jenisPemohonId: e,
                },
              });
              const txt = `${record ? "Edit" : "Tambah"} Jenis Pemohon (${
                record ? record.Pemohon.jenisPemohonId : ""
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
            align="col"
            width={"48%"}
            disable={record ? true : disableEdit}
          />
          <FormInput
            label="Produk"
            value={data.produkId || undefined}
            required
            type="option"
            options={produks.map((p) => ({
              label: `${p.name} (${p.code})`,
              value: p.id,
            }))}
            onChange={(e: any) => {
              setData({
                ...data,
                produkId: e,
              });
              const txt = `${record ? "Edit" : "Tambah"} Produk (${
                record ? record.produkId : ""
              } ${record ? "to" : ""} ${e})`;
              setActivity((prev) => {
                prev = prev
                  ? prev.filter(
                      (p) => !p.includes(`${record ? "Edit" : "Tambah"} Produk`)
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
          />

          <FormInput
            align="col"
            width={"48%"}
            label="Marketing"
            type="option"
            options={userss.map((u) => ({ label: u.fullname, value: u.id }))}
            value={data.userId}
            disable={
              user &&
              ["MARKETING", "ACCOUNT OFFICER"].includes(user.role.roleName)
            }
            onChange={(e: any) => {
              const find = userss.filter((u) => u.id === e);
              if (find.length === 0) return alert("Data Marketing tidak valid");

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
            required
          />

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
                window && window.location.replace("/permohonan-kredit")
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
  Pemohon: {
    id: 0,
    fullname: "",
    noCIF: "",
    NIK: "",
    jenisPemohonId: 0,
    status: true,
  },
  pemohonId: 0,
  id: 0,
  purposeUse: "",

  status: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  accountNumber: "",
  description: "",
  activity: "",
  userId: 0,
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
  produkId: 0,
  Produk: {
    id: 0,
    code: "",
    name: "",
    description: "",
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};
