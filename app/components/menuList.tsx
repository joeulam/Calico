"use client";
import React, { useState } from "react";
import {
  AppstoreOutlined,
  HomeOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Menu, Layout, Button, Modal, Form, Input, InputNumber, DatePicker, Spin } from "antd";
import { useRouter, usePathname } from "next/navigation";
import dayjs from "dayjs";
import { uploadTranscation } from "../functions/transaction_functions";
import { UserProfile } from "@auth0/nextjs-auth0/client";

const { Sider } = Layout;

const MenuList: React.FC<{ 
  collapsed: boolean; 
  setCollapsed: (collapsed: boolean) => void; 
  user?: UserProfile; 
  refreshTransactions: () => void; 
}> = ({ collapsed, setCollapsed, user, refreshTransactions }) => {

  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleNavigation = (path: string) => router.push(path);
  const getSelectedKey = () => {
    if (pathname?.includes("/transaction")) return "transaction";
    if (pathname?.includes("/settings")) return "settings";
    return "dashboard"; // Default selection
  };

  // Open/Close Modal
  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      values.date = dayjs(values.date).format("YYYY-MM-DD"); // Format date
      const response = await uploadTranscation(values, user!); // Pass user data
      if (response.success) {
        setIsModalOpen(false);
        form.resetFields();
        refreshTransactions(); // Refresh transaction list after adding
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={250}
        style={{
          background: "#ffffff",
          borderRight: "1px solid #ddd",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          minHeight: "100vh",
          transition: "width 0.3s ease-in-out",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        {/* Sidebar Toggle Button */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: collapsed ? "center" : "flex-end",
            padding: "12px 16px",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "18px" }}
          />
        </div>

        {/* Centered Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            padding: "10px 0",
          }}
        >
          <img
            src={collapsed ? "/calicov2.png" : "/calicoWDiscription.png"}
            alt="Logo"
            style={{
              width: collapsed ? "50px" : "120px",
              height: "auto",
              cursor: "pointer",
              transition: "width 0.3s ease-in-out",
            }}
            onClick={() => handleNavigation("/homepage")}
          />
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          theme="light"
          style={{
            fontSize: "16px",
            background: "#ffffff",
            border: "none",
            flexGrow: 1,
            width: "100%",
            overflow: "hidden",
          }}
          items={[
            { key: "dashboard", label: "Dashboard", icon: <HomeOutlined />, onClick: () => handleNavigation("/homepage") },
            { key: "transaction", label: "Transactions", icon: <AppstoreOutlined />, onClick: () => handleNavigation("/transaction") },
            { key: "settings", label: "Settings", icon: <SettingOutlined />, onClick: () => handleNavigation("/settings") },
          ]}
        />

        {/* Add Transaction Button */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size={collapsed ? "large" : "middle"}
            style={{
              width: collapsed ? "50px" : "90%",
              transition: "width 0.3s ease-in-out",
              borderRadius: "8px",
              backgroundColor: "#ff6600",
              color: "#fff",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={showModal}
          >
            {!collapsed && "Add Transaction"}
          </Button>
        </div>
      </Sider>

      {/* Add Transaction Modal */}
      <Modal
        title="New Transaction"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{ borderRadius: "10px" }}
      >
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form form={form} name="add-transaction" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} autoComplete="off">
            <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter a name!" }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Cost" name="cost" rules={[{ required: true, message: "Please enter the cost!" }]}>
              <InputNumber prefix="$" placeholder="0" precision={2} controls />
            </Form.Item>

            <Form.Item label="Date" name="date" rules={[{ required: true, message: "Please select a date!" }]}>
              <DatePicker />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default MenuList;
