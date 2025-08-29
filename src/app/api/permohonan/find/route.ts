import { IFiles, IPermohonanKredit } from "@/components/IInterfaces";
import prisma from "@/components/Prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json(
      { data: null, msg: "Not Found", status: 404 },
      { status: 404 }
    );
  try {
    const data = await prisma.permohonanKredit.findFirst({
      where: { id: parseInt(id) },
      include: {
        Pemohon: true,
        User: true,
        Produk: true,
      },
    });
    if (!data) {
      return NextResponse.json(
        { data: null, msg: "Not Found", status: 404 },
        { status: 404 }
      );
    }

    const findRootFile = await prisma.rootFiles.findMany({
      orderBy: { order: "asc" },
    });
    const newData: IPermohonanKredit = { ...data, RootFiles: [] };

    for (const root of findRootFile) {
      const files: IFiles[] = <any>await prisma.files.findMany({
        where: {
          rootFilesId: root.id,
          permohonanKreditId: data.id,
        },
        include: { PermohonanAction: true },
      });
      newData.RootFiles.push({ ...root, Files: files });
    }

    return NextResponse.json(
      { data: newData, msg: "OK", status: 200 },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { data: null, msg: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
};
