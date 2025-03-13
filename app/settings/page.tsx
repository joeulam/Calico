"use client";
import { Layout, Typography, Card } from "antd";
import { useState } from "react";
import MenuList from "../components/menuList";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SettingsPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh", display: "flex", transition: "all 0.3s ease-in-out" }}>
      
      {/* Sidebar - MenuList */}
      <MenuList collapsed={collapsed} setCollapsed={setCollapsed} user={undefined} refreshTransactions={() => {}} />

      {/* Main Content */}
      <Content
        style={{
          flex: 1,
          marginLeft: collapsed ? "80px" : "250px",
          padding: "40px",
          transition: "all 0.3s ease-in-out",
          backgroundColor: "#f9f9f9",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          style={{
            width: "500px",
            padding: "24px",
            borderRadius: "10px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#fff",
          }}
        >
          <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
            Settings
          </Title>
          <Text type="secondary" style={{ fontSize: "16px", display: "block", textAlign: "center" }}>
            Customize your preferences here.
          </Text>
        </Card>
      </Content>
    </Layout>
  );
}
