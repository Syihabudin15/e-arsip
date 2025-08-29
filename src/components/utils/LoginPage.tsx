"use client";
import {
  LoginOutlined,
  SecurityScanOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();

  const handleSubmit = async (e: { username: string; password: string }) => {
    if (!e || !e.username || !e.password) {
      return setErr("Mohon lengkapi username & password");
    }
    setLoading(true);
    await fetch("/api/auth", {
      method: "POST",
      body: JSON.stringify(e),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 200) {
          window && window.location.replace("/dashboard");
        } else {
          setErr(res.msg);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setErr("Internal Server Error");
      });
    setLoading(false);
  };

  return (
    <div
      className="flex justify-center sm:justify-end items-center w-full h-[92vh] bg-gradient-to-br from-blue-500 to-red-400"
      style={{
        // backgroundImage: "url(/login-bg3.png)",
        backgroundImage: "url(/2.jpg)",
        ...(window && window.innerWidth > 600
          ? {
              backgroundSize: 990,
            }
          : {
              backgroundSize: "cover",
            }),
      }}
    >
      <div className="h-full w-full hidden sm:flex justify-center items-center">
        {/* <Image
          src={"/login-bg.jpeg"}
          alt="Login background"
          width={920}
          height={900}
        /> */}
        {/* <img src={"/login-bg.jpeg"} className="rounded-2xl" /> */}
      </div>
      <div className="bg-slate-50 p-5 h-[60vh] sm:h-full w-[90vw] sm:w-[38vw] flex flex-col items-center justify-center rounded">
        <Image
          src={"/rifi-login.jpeg"}
          alt="App Logo"
          width={200}
          height={200}
        />
        <div className="my-5 w-full">
          <Form
            layout="vertical"
            onChange={() => setErr(undefined)}
            onFinish={handleSubmit}
          >
            <Form.Item label="Username" required name={"username"}>
              <Input prefix={<UserOutlined />} required />
            </Form.Item>
            <Form.Item label="Password" required name={"password"}>
              <Input.Password prefix={<SecurityScanOutlined />} required />
            </Form.Item>
            {err && (
              <div className="italic text-red-500">
                <p>{err}</p>
              </div>
            )}
            <div>
              <Button
                block
                type="primary"
                icon={<LoginOutlined />}
                htmlType="submit"
                loading={loading}
              >
                Login
              </Button>
            </div>
          </Form>
          <div className="mt-4 italic text-center">
            <p>Version 1.1</p>
            <p>
              Registered Free to <span className="font-bold">Bank Rifi</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
