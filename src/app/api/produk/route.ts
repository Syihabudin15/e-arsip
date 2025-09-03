import prisma from "@/components/Prisma";
import { logActivity } from "@/components/utils/Auth";
import { Produk } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const search: string | undefined = <any>(
    req.nextUrl.searchParams.get("search")
  );
  const page: number = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const pageSize: number = parseInt(
    req.nextUrl.searchParams.get("pageSize") || "50"
  );
  const skip = (page - 1) * pageSize;

  try {
    const find = await prisma.produk.findMany({
      where: {
        status: true,
        ...(search && {
          OR: [{ name: { contains: search } }, { code: { contains: search } }],
        }),
      },
      skip,
      take: pageSize,
    });
    const total = await prisma.produk.count({
      where: {
        status: true,
        ...(search && {
          OR: [{ name: { contains: search } }, { code: { contains: search } }],
        }),
      },
      skip,
      take: pageSize,
    });

    return NextResponse.json(
      { data: find, total, msg: "OK", status: 200 },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  const data: Produk = await req.json();
  try {
    const find = await prisma.produk.findFirst({
      where: { code: data.code },
    });
    if (find) {
      await logActivity(
        req,
        "Tambah Data Produk",
        "POST",
        "produk",
        JSON.stringify(data),
        JSON.stringify({ status: 400, msg: "BAD REQUEST" }),
        `Gagal menambahkan data Produk ${data.name} (${data.code}) karena Kode Produk sudah pernah digunakan sebelumnya`
      );
      return NextResponse.json(
        { status: 400, msg: "Kode Produk sudah pernah digunakan sebelumnya" },
        { status: 400 }
      );
    }
    const { id, ...savedData } = data;
    await prisma.produk.create({ data: savedData });
    await logActivity(
      req,
      "Tambah Data Produk",
      "POST",
      "produk",
      JSON.stringify(data),
      JSON.stringify({ status: 201, msg: "OK" }),
      `Berhasil tambah data produk ${data.name} (${data.code})`
    );
    return NextResponse.json(
      {
        status: 201,
        msg: `Data Produk ${data.name} (${data.code}) berhasil ditambahkan`,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
};

export const PUT = async (req: NextRequest) => {
  const data: Produk = await req.json();
  try {
    const find = await prisma.produk.findFirst({
      where: { code: data.code, createdAt: { not: data.createdAt } },
    });
    if (find) {
      await logActivity(
        req,
        "Update Data Produk",
        "PUT",
        "produk",
        JSON.stringify(data),
        JSON.stringify({ status: 400, msg: "BAD REQUEST" }),
        `Gagal update data produk ${data.name} (${data.code}) karena Kode Produk sudah pernah digunakan sebelumnya`
      );
      return NextResponse.json(
        { status: 400, msg: "Kode Produk sudah pernah digunakan sebelumnya" },
        { status: 400 }
      );
    }
    const { id, ...savedData } = data;
    await prisma.produk.update({ where: { id: data.id }, data: savedData });
    await logActivity(
      req,
      "Update Data Produk",
      "PUT",
      "produk",
      JSON.stringify(data),
      JSON.stringify({ status: 201, msg: "OK" }),
      `Berhasil update data produk ${data.name}`
    );
    return NextResponse.json(
      {
        status: 201,
        msg: `Update data produk ${data.name} berhasil`,
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
    await prisma.produk.update({
      where: { id: data.id },
      data: { status: false, updatedAt: new Date() },
    });
    await logActivity(
      req,
      "Hapus Data Produk",
      "DELETE",
      "produk",
      JSON.stringify(data),
      JSON.stringify({ status: 201, msg: "OK" }),
      `Berhasil hapus data produk ${data.name}`
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
