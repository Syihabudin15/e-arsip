import { Metadata } from "next";
import { TableProduk } from ".";

export const metadata: Metadata = { title: "Produk Management" };

export default function Page() {
  return (
    <div>
      <TableProduk />
    </div>
  );
}
