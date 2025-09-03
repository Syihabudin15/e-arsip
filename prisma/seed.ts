import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash("Tsani182", 10);
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
      roleId: 1,
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
      roleId: 1,
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
