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
    <div className="flex justify-around items-center w-full h-[92vh] relative">
      {/* <img
          src={"/2.jpg"}
          alt="bg-login-bank-rifi"
          style={{ height: "100%", width: "100%" }}
        /> */}
      <video
        src="/earsip-login-bg.mp4"
        className="absolute inset-0 h-full w-full object-cover filter brightness-75 contrast-110 saturate-125 "
        muted
        autoPlay
        loop
      />
      <div className="text-gray-50 z-20 hidden sm:flex flex-col gap-3 text-center">
        <div className="font-bold text-2xl flex flex-col gap-2">
          <p className="text-3xl" style={{ textShadow: "2px 2px 8px blue" }}>
            BPR RIMA
          </p>
          <p>BANK PEREKONOMIAN RAKYAT</p>
          <p>RIFI MALIGI</p>
        </div>
        <div className="flex gap-3 justify-center italic mt-3">
          <div className="flex-1 border rounded p-1">
            <p>Realiable</p>
            <p>Remarckable</p>
          </div>
          <div className="flex-1 border rounded p-1">
            <p>Integrity</p>
            <p>Improve</p>
          </div>
          <div className="flex-1 border rounded p-1">
            <p>Manage</p>
            <p>Meaningful</p>
          </div>
          <div className="flex-1 border rounded p-1">
            <p>Action</p>
            <p>Adaptation</p>
          </div>
        </div>
      </div>
      <div className="p-5 h-[60vh] sm:h-[70vh] w-[90vw] sm:w-[30vw] flex flex-col items-center justify-center rounded bg-slate-50 z-10">
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
