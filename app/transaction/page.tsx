"use client";
import { LineChart } from "@mantine/charts";
import { Layout, Typography, Card, Input, List, Spin, Skeleton, Divider, Row, Col, Modal, Form, InputNumber, DatePicker } from "antd";
import { useEffect, useState, useMemo } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";
import MenuList from "../components/menuList";
import { monthlySpending, sortByDate, Transaction, uploadEditedTranscation } from "../functions/transaction_functions";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function TransactionPage() {
  const { user, isLoading } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [historicalSpending, setHistoricalSpending] = useState<{ date: string; "Total spending": number }[]>([]);
  const [historicalTransaction, setHistoricalTransaction] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [form] = Form.useForm();

  async function getData() {
    if (!isLoading && user) {
      const userData = await monthlySpending(user!);
      setHistoricalTransaction(sortByDate("new_to_old", userData.response?.transactions)!);
      prepareChartData(userData.response?.transactions);
    }
  }

  function prepareChartData(transactions: Transaction[]) {
    if (transactions) {
      let cumulativeSum = 0;
      const chartData = transactions
        .sort((a, b) => a.date!.valueOf() - b.date!.valueOf())
        .map((transaction) => {
          cumulativeSum += transaction.cost || 0;
          return { date: dayjs(transaction.date).format("YYYY-MM-DD"), "Total spending": cumulativeSum };
        });
      setHistoricalSpending(chartData);
    }
    setLoading(false);
  }

  const filteredTransactions = useMemo(() => {
    return historicalTransaction.filter((item) => item.name.toLowerCase().includes(filterText.toLowerCase()));
  }, [historicalTransaction, filterText]);

  useEffect(() => {
    if (!isLoading && user) {
      getData();
    }
  }, [isLoading, user]);

  if (loading) {
    return (
      <Layout style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f0f2f5" }}>
        <Spin size="large" />
        <Text style={{ marginTop: "1rem", fontSize: "1.2rem", color: "#555" }}>Fetching Data...</Text>
      </Layout>
    );
  }

  // Open edit modal
  const openEditModal = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    form.setFieldsValue({
      name: transaction.name,
      cost: transaction.cost,
      date: dayjs(transaction.date),
      description: transaction.description,
    });
    setIsEditModalOpen(true);
  };

  // Handle edit form submission
  const handleEditTransaction = async () => {
    try {
      const values = await form.validateFields();
      values.date = dayjs(values.date).format("YYYY-MM-DD");

      if (currentTransaction) {
        const response = await uploadEditedTranscation(values, user!, currentTransaction._id!);
        if (response.success) {
          setIsEditModalOpen(false);
          form.resetFields();
          getData(); // Refresh transaction list
        }
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f9f9f9", display: "flex", transition: "all 0.3s ease-in-out" }}>
      
      {/* Sidebar */}
      <MenuList collapsed={collapsed} setCollapsed={setCollapsed} user={user!} refreshTransactions={getData} />

      <Layout style={{ padding: "24px", flex: 1, marginLeft: collapsed ? "80px" : "250px", transition: "all 0.3s ease-in-out" }}>
        
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>Transaction Dashboard</Title>
        </Header>

        <Content>
          <Row gutter={[24, 24]}>
            
            {/* Transaction Overview (Chart) */}
            <Col xs={24} md={12}>
              <Card
                title="Transaction Overview"
                bordered={false}
                style={{ borderRadius: "8px", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" }}
              >
                {historicalSpending.length > 0 ? (
                  <LineChart
                    h={300}
                    data={historicalSpending}
                    dataKey="date"
                    series={[{ name: "Total spending", color: "indigo.6" }]}
                    curveType="linear"
                    connectNulls
                  />
                ) : (
                  <Text type="secondary">No data available</Text>
                )}
              </Card>
            </Col>

            {/* Recent Transactions */}
            <Col xs={24} md={12}>
              <Card
                title="Recent Transactions"
                bordered={false}
                style={{ borderRadius: "8px", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" }}
              >
                {/* Search Bar */}
                <Input
                  placeholder="Search transactions..."
                  value={filterText}
                  onChange={(event) => setFilterText(event.target.value)}
                  size="large"
                  style={{ marginBottom: "12px", borderRadius: "6px" }}
                />

                {/* Infinite Scroll List */}
                <div id="scrollableDiv" style={{ height: "300px", overflowY: "auto", paddingRight: "10px" }}>
                  <InfiniteScroll
                    dataLength={filteredTransactions.length}
                    next={getData}
                    hasMore={filteredTransactions.length < 5}
                    loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                    endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
                    scrollableTarget="scrollableDiv"
                  >
                    <List
                      itemLayout="horizontal"
                      dataSource={filteredTransactions}
                      renderItem={(item) => (
                        <Card
                          hoverable
                          style={{ borderRadius: "8px", marginBottom: "10px", boxShadow: "0px 2px 6px rgba(0,0,0,0.08)" }}
                        >
                          <List.Item actions={[<a key="edit" onClick={() => openEditModal(item)}>Edit</a>]}>
                            <List.Item.Meta
                              title={<Text strong>{item.name}</Text>}
                              description={<Text type="secondary">${item.cost!.toFixed(2)}</Text>}
                            />
                          </List.Item>
                        </Card>
                      )}
                    />
                  </InfiniteScroll>
                </div>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>

      {/* Edit Transaction Modal */}
      <Modal
        title="Edit Transaction"
        open={isEditModalOpen}
        onOk={handleEditTransaction}
        onCancel={() => setIsEditModalOpen(false)}
        style={{ borderRadius: "10px" }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Cost" name="cost" rules={[{ required: true }]}>
            <InputNumber prefix="$" />
          </Form.Item>
          <Form.Item label="Date" name="date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
