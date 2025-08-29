import {
  JenisPemohon,
  PermohonanKredit,
  Role,
  User,
  PermohonanAction,
  RootFiles,
  Files,
  Pemohon,
  Produk,
} from "@prisma/client";

export interface IUser extends User {
  role: Role;
}

export interface IPermission {
  path: string;
  access: string[];
}

export interface IFormInput {
  label: string;
  value: any;
  onChange?: Function;
  required?: boolean;
  placeholder?: any;
  type?: "area" | "number" | "date" | "password" | "option";
  width?: number | string;
  align?: "row" | "col";
  disable?: boolean;
  hide?: boolean;
  options?: { label: any; value: any }[];
  optionsMode?: "tags" | "multiple";
  optionsLength?: number;
  onSearch?: Function;
}
export interface IFiles extends Files {
  PermohonanAction: PermohonanAction[];
  RootFiles: RootFiles;
}
export interface IRootFiles extends RootFiles {
  Files: Files[];
}

export interface IPemohon extends Pemohon {
  PermohonanKredit: IPermohonanKredit[];
  JenisPemohon: JenisPemohon;
}

export interface IPermohonanKredit extends PermohonanKredit {
  RootFiles: IRootFiles[];
  Produk: Produk;
  User: User;
  Pemohon: Pemohon;
}
interface FilesPA extends Files {
  PermohonanKredit: PermohonanKredit;
  PermohonanAction: PermohonanAction[];
  RootFiles: RootFiles;
}
export interface IRootFilesPA extends RootFiles {
  Files: FilesPA[];
}
export interface IPermohonanAction extends PermohonanAction {
  RootFiles: IRootFilesPA[];
  Requester: User;
  Approver: User | null;
  PermohonanKredit: IPerAction;
}
export interface IPerAction extends PermohonanKredit {
  Pemohon: Pemohon;
}
export interface IMenu {
  path: string;
  name: string;
  access: string[];
}

export interface WithAccessOptions {
  path: string; // path yang mau dicek
  required?: string[]; // izin yang diperlukan, default: []
  redirectTo?: string; // kemana redirect kalau tidak punya akses
}

export interface EditActivity {
  desc: string;
  time: string;
}
export interface IDescription {
  time: string;
  user: string;
  desc: string;
}

export interface IExcelColumn {
  header: string;
  key: string;
  width?: number;
}
export interface IExcelData {
  [key: string]: any;
}
