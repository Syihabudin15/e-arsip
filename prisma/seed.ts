import { IPermission } from "@/components/IInterfaces";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  const permision: IPermission[] = [
    { path: "/dashboard", access: ["read"] },
    {
      path: "/roles",
      access: ["read", "update", "write", "delete"],
    },
    {
      path: "/users",
      access: ["read", "update", "write", "delete"],
    },
    {
      path: "/jenis-pemohon",
      access: ["read", "update", "write", "delete"],
    },
    {
      path: "/permohonan-kredit",
      access: ["read", "update", "write", "delete", "detail", "download"],
    },
    {
      path: "/document",
      access: ["read", "update", "write", "delete", "detail", "download"],
    },
    {
      path: "/logs",
      access: ["read", "update", "write", "delete"],
    },
  ];

  const role = await prisma.role.upsert({
    where: { roleName: "ADMINISTRATOR" },
    update: {},
    create: {
      roleName: "ADMINISTRATOR",
      permission: JSON.stringify(permision),

      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const pass = await bcrypt.hash("syrel2025", 10);
  await prisma.user.upsert({
    where: { username: "syihabudin" },
    update: {},
    create: {
      fullname: "SYIHABUDIN TSANI",
      username: "syihabudin",
      password: pass,
      email: "syihabudin@gmail.com",
      photo: null,

      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleId: role.id,
    },
  });
  await prisma.user.upsert({
    where: { username: "oldy" },
    update: {},
    create: {
      fullname: "OLDYWJK",
      username: "oldy",
      password: pass,
      email: "oldy@gmail.com",
      photo: null,

      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleId: role.id,
    },
  });

  console.log("Seeding succeesfully...");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
