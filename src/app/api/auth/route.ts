import prisma from "@/components/Prisma";
import { getSession, signIn, signOut } from "@/components/utils/Auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export const POST = async (req: NextRequest) => {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json(
      { msg: "Mohon lengkapi username & password!", status: 404 },
      { status: 404 }
    );
  }
  try {
    const find = await prisma.user.findFirst({
      where: { username: username },
      include: {
        role: true,
      },
    });
    if (!find) {
      return NextResponse.json(
        { msg: "Username atau password salah!", status: 401 },
        { status: 401 }
      );
    }
    const comparePass = await bcrypt.compare(password, find.password);
    if (!comparePass) {
      return NextResponse.json(
        { msg: "Username atau password salah!", status: 401 },
        { status: 401 }
      );
    }
    await signIn(find);
    return NextResponse.json({ msg: "OK", status: 200 }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { msg: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { msg: "Unauthorize", status: 401 },
      { status: 401 }
    );
  }
  try {
    const user = await prisma.user.findFirst({
      where: { id: session.user.id },
      include: {
        role: true,
      },
    });
    if (!user) {
      await signOut();
      return NextResponse.json(
        { msg: "Unauthorize", status: 401 },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { data: user, status: 200, msg: "OK" },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { msg: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
};

export const DELETE = async () => {
  try {
    await signOut();
    return NextResponse.json({ msg: "OK", status: 200 }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { msg: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
};
