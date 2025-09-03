// import cloudinary from "@/components/Cloudinary";
import { logActivity } from "@/components/utils/Auth";
import { NextRequest, NextResponse } from "next/server";

/*
Resource type:
image -> Image
video -> video
raw   -> pdf
*/

import { getContainerClient } from "@/components/Azure";

const folderName = process.env.NEXT_PUBLIC_APP_FOLDER!;
const containerClient = getContainerClient();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb", // default 1mb
    },
  },
};

// export const POST = async (req: NextRequest) => {
//   const { file, folder, resourcetype, fileType, publicId } = await req.json();
//   if (!file || !folder || !fileType)
//     return NextResponse.json(
//       { data: null, status: 400, msg: "File/Folder/fileType tidak diisi" },
//       { status: 400 }
//     );
//   try {
//     const result = await cloudinary.uploader.upload(
//       `data:${fileType};base64,${file}`,
//       {
//         folder: folder,
//         resource_type: resourcetype,
//         public_id: publicId,
//       }
//     );
//     if (!result.secure_url) {
//       await logActivity(
//         req,
//         "Gagal Upload",
//         "POST",
//         "document",
//         JSON.stringify({ fileName: folder, fileType, resourcetype, publicId }),
//         JSON.stringify({ status: 400, msg: "Bad Request" }),
//         "Gagal Upload file " + publicId
//       );
//       return NextResponse.json(
//         { data: null, status: 400, msg: "Gagal upload file" },
//         { status: 400 }
//       );
//     }
//     await logActivity(
//       req,
//       "Upload Berhasil",
//       "POST",
//       "document",
//       JSON.stringify({ fileName: folder, fileType, resourcetype, publicId }),
//       JSON.stringify({ status: 201, msg: "OK" }),
//       "Berhasil Upload file " + publicId
//     );
//     return NextResponse.json(
//       { data: result.secure_url, status: 200, msg: "OK" },
//       { status: 200 }
//     );
//   } catch (err) {
//     console.log(err);
//     return NextResponse.json(
//       { data: null, status: 500, msg: "Internal server error" },
//       { status: 500 }
//     );
//   }
// };

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
    // await cloudinary.uploader.destroy(publicId, {
    //   resource_type: resourcetype,
    // });

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
