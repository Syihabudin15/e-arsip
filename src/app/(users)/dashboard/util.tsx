"use client";
import { Card, Col, Row, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import { Column, ColumnConfig, Line } from "@ant-design/plots";
import moment from "moment";
import { LoadingOutlined } from "@ant-design/icons";
const { Paragraph } = Typography;
export default function DashboardMaster() {
  const [data, setData] = useState<any>();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((res) => setData(res));
  }, []);

  if (!data)
    return (
      <div>
        Loading...
        <LoadingOutlined />
      </div>
    );

  const { cards, charts, tables } = data;

  const columnsPermohonan = [
    {
      title: "MARKETING",
      dataIndex: ["User", "fullname"],
      key: "marketingName",
      className: "text-xs",
      width: 200,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center" as React.CSSProperties["textAlign"],
            fontSize: 12,
          },
        };
      },
    },
    {
      title: "NO CIF",
      dataIndex: ["Pemohon", "noCIF"],
      key: "noCIF",
      className: "text-xs",
      width: 150,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center" as React.CSSProperties["textAlign"],
            fontSize: 12,
          },
        };
      },
    },
    {
      title: "NAMA LENGKAP",
      dataIndex: ["Pemohon", "fullname"],
      key: "fullname",
      className: "text-xs",
      width: 200,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center" as React.CSSProperties["textAlign"],
            fontSize: 12,
          },
        };
      },
    },
    {
      title: "NIK",
      dataIndex: ["Pemohon", "NIK"],
      key: "NIK",
      className: "text-xs",
      width: 150,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center" as React.CSSProperties["textAlign"],
            fontSize: 12,
          },
        };
      },
    },
    {
      title: "JENIS PEMOHON",
      dataIndex: ["Pemohon", "JenisPemohon", "name"],
      key: "jenis",
      className: "text-xs",
      width: 150,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center" as React.CSSProperties["textAlign"],
            fontSize: 12,
          },
        };
      },
    },
    {
      title: "TANGGAL",
      dataIndex: "createdAt",
      className: "text-xs",
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center" as React.CSSProperties["textAlign"],
            fontSize: 12,
          },
        };
      },
      render: (v: string) => moment(v).format("DD/MM/YYYY HH:mm"),
    },
  ];

  const columnsLogs = [
    {
      title: "USER",
      dataIndex: ["User", "fullname"],
      key: "user",
      className: "text-xs",
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center" as React.CSSProperties["textAlign"],
            fontSize: 12,
          },
        };
      },
    },
    {
      title: "METHOD",
      dataIndex: "method",
      key: "method",
      className: "text-xs",
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center" as React.CSSProperties["textAlign"],
            fontSize: 12,
          },
        };
      },
    },
    {
      title: "TABLE",
      dataIndex: "table",
      key: "table",
      className: "text-xs",
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center" as React.CSSProperties["textAlign"],
            fontSize: 12,
          },
        };
      },
    },
    {
      title: "DETAIL",
      dataIndex: "detail",
      key: "detail",
      className: "text-xs",
      width: 200,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center" as React.CSSProperties["textAlign"],
            fontSize: 12,
          },
        };
      },
      render: (v: string) => (
        <>
          <Paragraph
            ellipsis={{
              rows: 1,
              expandable: "collapsible",
            }}
            style={{ fontSize: 12 }}
          >
            {v}
          </Paragraph>
        </>
      ),
    },
    {
      title: "Tanggal",
      dataIndex: "createdAt",
      className: "text-xs",
      render: (v: string) => moment(v).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div className="p-2 h-[92vh] overflow-auto">
      {/* Cards */}
      <Row gutter={[16, 16]} wrap>
        <Col span={6} xs={12} md={8} lg={6}>
          <Card
            title="Total Users"
            styles={{
              header: {
                background: "linear-gradient(135deg, #3b82f6, #9333ea)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
              },
            }}
          >
            <p className="font-bold text-xl">{cards.totalUsers}</p>
          </Card>
        </Col>
        <Col span={6} xs={12} md={8} lg={6}>
          <Card
            title="Total Roles"
            styles={{
              header: {
                background: "linear-gradient(135deg, #3b82f6, #9333ea)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
              },
            }}
          >
            <p className="font-bold text-xl">{cards.totalRoles}</p>
          </Card>
        </Col>
        <Col span={6} xs={12} md={8} lg={6}>
          <Card
            title="Total Files"
            styles={{
              header: {
                background: "linear-gradient(135deg, #3b82f6, #9333ea)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
              },
            }}
          >
            <p className="font-bold text-xl">{cards.totalDocuments}</p>
          </Card>
        </Col>
        <Col span={6} xs={12} md={8} lg={6}>
          <Card
            title="Permohonan Hari Ini"
            styles={{
              header: {
                background: "linear-gradient(135deg, #3b82f6, #9333ea)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
              },
            }}
          >
            <p className="font-bold text-xl">{cards.totalPermohonanHariIni}</p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="my-4">
        <Col span={12} xs={24} lg={12}>
          <Card
            title="Aktivitas Logs 7 Hari"
            styles={{
              header: {
                background: "linear-gradient(135deg, #3b82f6, #9333ea)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
              },
            }}
          >
            <Line data={charts.logsPerDay} xField="createdAt" yField="_count" />
          </Card>
        </Col>
        <Col span={12} xs={24} lg={12}>
          <Card
            title="Pengajuan Kredit 6 Bulan"
            styles={{
              header: {
                background: "linear-gradient(135deg, #3b82f6, #9333ea)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
              },
            }}
          >
            <Column
              data={charts.pengajuanPerBulan}
              xField={"createdAt"}
              yField={"_count"}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="my-4">
        <Col span={12} xs={24}>
          <Card
            title="Permohonan Terbaru"
            styles={{
              header: {
                background: "linear-gradient(135deg, #3b82f6, #9333ea)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
              },
            }}
          >
            <Table
              dataSource={tables.lastPermohonan.map((d: any) => ({
                ...d,
                key: d.id,
              }))}
              columns={columnsPermohonan}
              size="small"
              pagination={false}
              scroll={{ x: "max-content", y: 300 }}
              bordered
            />
          </Card>
        </Col>
        <Col span={12} xs={24}>
          <Card
            title="Aktivitas User Terbaru"
            styles={{
              header: {
                background: "linear-gradient(135deg, #3b82f6, #9333ea)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
              },
            }}
          >
            <Table
              dataSource={tables.lastLogs.map((d: any) => ({
                ...d,
                key: d.id,
              }))}
              columns={columnsLogs}
              size="small"
              pagination={false}
              scroll={{ x: "max-content", y: 300 }}
              bordered
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
