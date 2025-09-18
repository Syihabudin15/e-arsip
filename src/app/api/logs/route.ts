import prisma from "@/components/Prisma";
import { Logs } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const search: string | undefined = <any>(
    req.nextUrl.searchParams.get("search")
  );
  const userId: number | undefined = parseInt(
    req.nextUrl.searchParams.get("userId") || "0"
  );
  const table: string | undefined = <any>req.nextUrl.searchParams.get("table");
  const method: string | undefined = <any>(
    req.nextUrl.searchParams.get("method")
  );
  const name: string | undefined = <any>req.nextUrl.searchParams.get("name");
  const page: number = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const pageSize: number = parseInt(
    req.nextUrl.searchParams.get("pageSize") || "50"
  );
  const skip = (page - 1) * pageSize;

  try {
    const find = await prisma.logs.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search } },
            { User: { fullname: { contains: search } } },
            { table: { contains: search } },
            { serverIP: { contains: search } },
          ],
        }),
        ...(userId && { userId: userId }),
        ...(table && { table: table }),
        ...(method && { method: method }),
        ...(name && { name: { contains: name } }),
      },
      skip,
      take: pageSize,
      include: { User: true },
      orderBy: { createdAt: "desc" },
    });
    const total = await prisma.logs.count({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search } },
            { User: { fullname: { contains: search } } },
            { table: { contains: search } },
            { serverIP: { contains: search } },
          ],
        }),
        ...(userId && { userId: userId }),
        ...(table && { table: table }),
        ...(method && { method: method }),
        ...(name && { name: { contains: name } }),
      },
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
  const data: Logs = await req.json();
  try {
    const { id, ...saved } = data;
    await prisma.logs.create({ data: saved });

    return NextResponse.json({ status: 200 }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
};
