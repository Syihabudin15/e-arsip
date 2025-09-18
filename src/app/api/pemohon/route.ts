import {
  IFiles,
  IPemohon,
  IPermohonanKredit,
  IRootFiles,
} from "@/components/IInterfaces";
import prisma from "@/components/Prisma";
import { logActivity } from "@/components/utils/Auth";
import { Pemohon } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const search: string | undefined = <any>(
    req.nextUrl.searchParams.get("search")
  );
  const jenisId: number = parseInt(
    req.nextUrl.searchParams.get("jenisId") || "0"
  );
  const page: number = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const pageSize: number = parseInt(
    req.nextUrl.searchParams.get("pageSize") || "50"
  );
  const skip = (page - 1) * pageSize;

  try {
    const find = await prisma.pemohon.findMany({
      where: {
        status: true,
        ...(search && {
          OR: [
            { fullname: { contains: search } },
            { NIK: { contains: search } },
            { noCIF: { contains: search } },
          ],
        }),
        ...(jenisId && { jenisPemohonId: jenisId }),
      },
      include: {
        PermohonanKredit: {
          where: { status: true },
          include: {
            Produk: true,
            User: true,
            Pemohon: true,
          },
        },
        JenisPemohon: true,
      },
      skip,
      take: pageSize,
    });
    const total = await prisma.pemohon.count({
      where: {
        status: true,
        ...(search && {
          OR: [
            { fullname: { contains: search } },
            { NIK: { contains: search } },
            { noCIF: { contains: search } },
          ],
        }),
        ...(jenisId && { jenisPemohonId: jenisId }),
      },
    });

    const fixData: IPemohon[] = [];
    for (const pemohon of find) {
      const newData: IPermohonanKredit[] = [];
      for (const permohonan of pemohon.PermohonanKredit) {
        const findRootFile = await prisma.rootFiles.findMany({
          orderBy: { order: "asc" },
          include: {
            Files: {
              where: { permohonanKreditId: permohonan.id },
            },
          },
        });
        newData.push({ ...permohonan, RootFiles: findRootFile });
      }
      fixData.push({ ...pemohon, PermohonanKredit: newData });
    }

    return NextResponse.json(
      { data: fixData, total, msg: "OK", status: 200 },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  const data: Pemohon = await req.json();

  try {
    // const find = await prisma.pemohon.findFirst({
    //   where: { noCIF: data.noCIF },
    // });
    // if (find) {
    //   await logActivity(
    //     req,
    //     "Tambah Data Pemohon",
    //     "POST",
    //     "pemohon",
    //     JSON.stringify(data),
    //     JSON.stringify({ status: 400, msg: "BAD REQUEST" }),
    //     `Gagal menambahkan data pemohon ${data.fullname} karena Nomor CIF sudah pernah digunakan sebelumnya`
    //   );
    //   return NextResponse.json(
    //     { status: 400, msg: "Nomor CIF sudah pernah digunakan sebelumnya" },
    //     { status: 400 }
    //   );
    // }
    const { id, ...savedData } = data;
    await prisma.pemohon.create({ data: savedData });
    await logActivity(
      req,
      "Tambah Data Pemohon",
      "POST",
      "pemohon",
      JSON.stringify(data),
      JSON.stringify({ status: 201, msg: "OK" }),
      `Berhasil tambah data pemohon ${data.fullname}`
    );
    return NextResponse.json(
      {
        status: 201,
        msg: `Data pemohon ${data.fullname} berhasil ditambahkan`,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
};

export const PUT = async (req: NextRequest) => {
  const data: any = await req.json();
  try {
    // const find = await prisma.pemohon.findFirst({
    //   where: { noCIF: data.noCIF, NIK: { not: data.NIK } },
    // });
    // if (find) {
    //   await logActivity(
    //     req,
    //     "Update Data Pemohon",
    //     "PUT",
    //     "pemohon",
    //     JSON.stringify(data),
    //     JSON.stringify({ status: 400, msg: "BAD REQUEST" }),
    //     `Gagal update data pemohon ${data.fullname} karena Nomor CIF sudah pernah digunakan sebelumnya`
    //   );
    //   return NextResponse.json(
    //     { status: 400, msg: "Nomor CIF sudah pernah digunakan sebelumnya" },
    //     { status: 400 }
    //   );
    // }
    const { id, PermohonanKredit, JenisPemohon, ...savedData } = data;
    await prisma.pemohon.update({ where: { id: data.id }, data: savedData });
    await logActivity(
      req,
      "Update Data Pemohon",
      "PUT",
      "pemohon",
      JSON.stringify(data),
      JSON.stringify({ status: 201, msg: "OK" }),
      `Berhasil update data pemohon ${data.fullname}`
    );
    return NextResponse.json(
      {
        status: 201,
        msg: `Update data pemohon ${data.fullname} berhasil`,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
};

export const DELETE = async (req: NextRequest) => {
  const data: any = await req.json();
  try {
    await prisma.pemohon.update({
      where: { id: data.id },
      data: { status: false },
    });
    await logActivity(
      req,
      "Hapus Data Pemohon",
      "DELETE",
      "pemohon",
      JSON.stringify(data),
      JSON.stringify({ status: 201, msg: "OK" }),
      `Berhasil hapus data pemohon ${data.fullname}`
    );
    return NextResponse.json(
      {
        status: 201,
        msg: `Berhasil hapus data pemohon ${data.fullname}`,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
};
