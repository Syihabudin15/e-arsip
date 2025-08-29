"use client";

import {
  App,
  Button,
  Drawer,
  Dropdown,
  Image,
  Layout,
  Menu,
  Space,
} from "antd";
import {
  CloudDownloadOutlined,
  DashboardFilled,
  DeleteColumnOutlined,
  FileTextFilled,
  FolderFilled,
  KeyOutlined,
  LoadingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  ProductOutlined,
  RobotOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useUser } from "../contexts/UserContext";
import { useState } from "react";
import dynamic from "next/dynamic";
import { IPermission } from "../IInterfaces";

export const UserBio = () => {
  const user = useUser();
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);

  const showNotif = (msg: string) => {
    notification.error({
      message: "Error",
      description: msg,
      placement: "bottomRight",
    });
  };
  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth", { method: "DELETE" })
      .then((res) => res.json())
      .then((res) => {
        if (res.status !== 200) {
          showNotif(res.msg);
          return;
        }
        window && window.location.replace("/");
      })
      .catch((err) => {
        console.log(err);
        showNotif("Internal Server Error");
      });
    setLoading(false);
  };

  return (
    <div className="hidden sm:block">
      {user && (
        <Dropdown
          menu={{
            items: [
              {
                key: "info",
                onClick: () => window && window.location.replace("/biodata"),
                label: (
                  <div>
                    <div className="flex gap-2 items-center">
                      <div>
                        <Image
                          src={
                            user && user.photo ? user.photo : "/rifi-logo.png"
                          }
                          width={30}
                          height={30}
                          alt="User Picture"
                        />
                      </div>
                      <div>
                        <div className="font-bold">
                          Hi! {user && user.fullname}
                        </div>
                        <div className="text-xs italic">
                          {user && user.role && user.role.roleName}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              { type: "divider" },
              {
                key: "logout",
                label: (
                  <div className="my-2 mx-1 flex justify-end">
                    <Button
                      size="small"
                      type="primary"
                      danger
                      onClick={() => handleLogout()}
                      loading={loading}
                    >
                      Logout
                    </Button>
                  </div>
                ),
              },
            ],
          }}
          placement="bottomRight"
        >
          <div className="text-gray-50">
            <Space style={{ cursor: "pointer", userSelect: "none" }}>
              <UserOutlined />
              <div>{user && user.fullname}</div>
            </Space>
          </div>
        </Dropdown>
      )}
    </div>
  );
};

export const menuItems = [
  {
    label: "Dashboard",
    icon: <DashboardFilled />,
    key: "/dashboard",
  },
  {
    label: "Jenis Pemohon",
    icon: <TeamOutlined />,
    key: "/jenis-pemohon",
  },
  {
    label: "Permohonan Kredit",
    icon: <FileTextFilled />,
    key: "/permohonan-kredit",
  },
  {
    label: "Dokumen",
    icon: <FolderFilled />,
    key: "/document",
  },
  {
    label: "P. Hapus File",
    icon: <DeleteColumnOutlined />,
    key: "/request/delete",
  },
  {
    label: "P. Download File",
    icon: <CloudDownloadOutlined />,
    key: "/request/downloads",
  },
  {
    label: "User Management",
    icon: <UserOutlined />,
    key: "/users",
  },
  {
    label: "Role Management",
    icon: <KeyOutlined />,
    key: "/roles",
  },
  {
    label: "Produk Management",
    icon: <ProductOutlined />,
    key: "/produk",
  },
  {
    label: "Logs Activitas",
    icon: <RobotOutlined />,
    key: "/logs",
  },
];

export const MenuMobile = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useUser();
  const { notification } = App.useApp();

  const showNotif = (msg: string) => {
    notification.error({
      message: "Error",
      description: msg,
      placement: "bottomRight",
    });
  };
  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth", { method: "DELETE" })
      .then((res) => res.json())
      .then((res) => {
        if (res.status !== 200) {
          showNotif(res.msg);
          return;
        }
        window && window.location.replace("/");
      })
      .catch((err) => {
        console.log(err);
        showNotif("Internal Server Error");
      });
    setLoading(false);
  };

  return (
    <>
      {user && (
        <div className="block sm:hidden p-1">
          <Button
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
          ></Button>
        </div>
      )}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        width={"80vw"}
        title="Main Menu"
      >
        <div>
          <div className="flex gap-4 items-center border-b border-gray-200 py-3">
            <div>
              <Image
                src={user && user.photo ? user.photo : "/rifi-logo.png"}
                width={30}
                height={30}
                alt="User Picture"
              />
            </div>
            <div>
              <div className="font-bold">Hi! {user && user.fullname}</div>
              <div className="text-xs italic">
                {user && user.role && user.role.roleName}
              </div>
            </div>
          </div>
          <div>
            <Menu
              items={(() => {
                if (user) {
                  const userMenu = JSON.parse(
                    user.role.permission
                  ) as IPermission[];
                  const fix = menuItems.filter((menu) =>
                    userMenu.some((um) => um.path === menu.key)
                  );
                  return fix;
                } else {
                  return [];
                }
              })()}
              onClick={(e) => window && window.location.replace(e.key)}
            />
          </div>
          <div className="my-2">
            <Button
              icon={<LogoutOutlined />}
              danger
              type="primary"
              block
              loading={loading}
              onClick={() => handleLogout()}
            >
              Logout
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
};
export const MenuWindows = () => {
  const [collapse, setCollapse] = useState(false);
  const user = useUser();
  return (
    <div className="hidden sm:block h-[92vh] bg-blue-500">
      <Layout>
        <Button
          onClick={() => setCollapse(!collapse)}
          type="primary"
          style={{ borderRadius: 0, background: "#3B82F6" }}
        >
          {collapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
        <Menu
          mode="inline"
          items={(() => {
            if (user) {
              const userMenu = JSON.parse(
                user.role.permission
              ) as IPermission[];
              const fix = menuItems.filter((menu) =>
                userMenu.some((um) => um.path === menu.key)
              );
              return fix;
            } else {
              return [];
            }
          })()}
          style={{
            background: "linear-gradient(to bottom right, #3B82F6, #A855F7)",
          }}
          theme="dark"
          inlineCollapsed={collapse}
          onClick={(e) => window && window.location.replace(e.key)}
        />
      </Layout>
    </div>
  );
};

export const LoginPage = dynamic(() => import("@/components/utils/LoginPage"), {
  ssr: false,
  loading: () => <LoadingOutlined />,
});

export const MyPDFViewer = dynamic(
  () => import("@/components/utils/PDFUtils").then((d) => d.MyPDFViewer),
  {
    ssr: false,
    loading: () => <LoadingOutlined />,
  }
);
