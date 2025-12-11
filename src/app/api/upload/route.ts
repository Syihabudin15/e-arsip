import { logActivity } from "@/components/utils/Auth";
import { NextRequest, NextResponse } from "next/server";
import { getContainerClient } from "@/components/Azure";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const folderName = process.env.AZURE_STORAGE_CONTAINER_FOLDER || "earsip";
const containerClient = getContainerClient();

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  try {
    if (!file)
      return NextResponse.json(
        { message: "No file provided", status: 400 },
        { status: 400 }
      );
    const blockBlobClient = containerClient.getBlockBlobClient(
      `${folderName}/${file.name}`
    );

    const arrayBuffer = await file.arrayBuffer();
    await blockBlobClient.uploadData(arrayBuffer);

    return NextResponse.json(
      {
        message: "File berhasil diupload",
        secure_url: blockBlobClient.url,
        status: 201,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { data: null, status: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  const { publicId, resourcetype } = await req.json();
  if (!publicId || !resourcetype)
    return NextResponse.json(
      {
        data: null,
        status: 400,
        msg: "Url / Resource Type tidak terdeteksi",
      },
      { status: 400 }
    );
  try {
    const urlParts = publicId.split("/").slice(4); // ["testing", "file.pdf"]
    const blobName = decodeURIComponent(urlParts.join("/")); // "testing/file.pdf"
    const blockBlobClient = containerClient.getBlockBlobClient(blobName!);
    await blockBlobClient.deleteIfExists();

    await logActivity(
      req,
      "Hapus File",
      "DELETE",
      "document",
      JSON.stringify({ resourcetype, publicId }),
      JSON.stringify({ status: 200, msg: "OK" }),
      "Berhasil hapus file " + publicId
    );
    return NextResponse.json(
      { data: null, status: 200, msg: "Berhasil hapus file" },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { data: null, status: 500, msg: "Internal server error" },
      { status: 500 }
    );
  }
};
