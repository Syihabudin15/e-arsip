import { IPermohonanKredit } from "@/components/IInterfaces";
import prisma from "@/components/Prisma";
import { logActivity } from "@/components/utils/Auth";
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
    const find = await prisma.permohonanKredit.findMany({
      where: {
        status: true,
        ...(search && {
          OR: [
            { accountNumber: { contains: search } },
            {
              Pemohon: {
                OR: [
                  { fullname: { contains: search } },
                  { NIK: { contains: search } },
                  { noCIF: { contains: search } },
                ],
              },
            },
          ],
        }),
        ...(jenisId !== 0 && { produkId: jenisId }),
      },
      include: {
        Produk: true,
        User: true,
        Pemohon: true,
      },
      skip,
      take: pageSize,
    });
    const total = await prisma.permohonanKredit.count({
      where: {
        status: true,
        ...(search && {
          OR: [
            { accountNumber: { contains: search } },
            {
              Pemohon: {
                OR: [
                  { fullname: { contains: search } },
                  { NIK: { contains: search } },
                  { noCIF: { contains: search } },
                ],
              },
            },
          ],
        }),
        ...(jenisId !== 0 && { produkId: jenisId }),
      },
    });

    const newData: IPermohonanKredit[] = [];

    for (const permohonan of find) {
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

    return NextResponse.json(
      { data: newData, total, msg: "OK", status: 200 },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  const data: IPermohonanKredit = await req.json();
  try {
    const { id, Produk, User, RootFiles, Pemohon, ...permohonan } = data;
    if (data.pemohonId === 0) {
      const savePemohon = await prisma.pemohon.create({
        data: {
          fullname: Pemohon.fullname,
          noCIF: Pemohon.noCIF,
          NIK: Pemohon.noCIF,
          jenisPemohonId: Pemohon.jenisPemohonId,
        },
      });
      permohonan.pemohonId = savePemohon.id;
    }
    await prisma.$transaction(async (tx) => {
      const pk = await tx.permohonanKredit.create({
        data: permohonan,
      });
      for (const root of RootFiles) {
        const files = root.Files.map((f) => ({
          ...f,
          permohonanKreditId: pk.id,
        }));
        await tx.files.createMany({ data: files });
      }
      return pk;
    });
    await logActivity(
      req,
      "Tambah Permohonan Kredit",
      "POST",
      "permohonanKredit",
      JSON.stringify(data),
      JSON.stringify({ status: 201, msg: "OK" }),
      "Berhasil Menambahkan Permohonan Kredit " + data.Pemohon.fullname
    );
    return NextResponse.json({ msg: "OK", status: 201 }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
};
export const PUT = async (req: NextRequest) => {
  const data: IPermohonanKredit = await req.json();
  try {
    const { id, Produk, User, RootFiles, Pemohon, ...permohonan } = data;
    await prisma.$transaction([
      prisma.permohonanKredit.update({
        where: { id: id },
        data: { ...permohonan, updatedAt: new Date() },
      }),
      prisma.files.deleteMany({
        where: { permohonanKreditId: id },
      }),
      ...RootFiles.map((rf) =>
        prisma.files.createMany({
          data: rf.Files.map((f: any) => {
            const { PermohonanAction, ...newF } = f;
            return { ...newF, permohonanKreditId: id };
          }),
        })
      ),
    ]);
    await logActivity(
      req,
      `${data.status ? "Update" : "Hapus"}  Permohonan Kredit`,
      data.status ? "PUT" : "DELETE",
      "permohonanKredit",
      JSON.stringify(data),
      JSON.stringify({ status: 201, msg: "OK" }),
      `Berhasil ${data.status ? "Update" : "Hapus"} Permohonan Kredit ${
        data.Pemohon.fullname
      }`
    );
    return NextResponse.json({ msg: "OK", status: 201 }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
};
