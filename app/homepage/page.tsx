"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Card, Layout, List, Spin, Typography, Skeleton, Divider } from "antd";
import { LineChart } from "@mantine/charts";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";
import {
  monthlySpending,
  sortByDate,
  Transaction,
  userExist,
} from "../functions/transaction_functions";
import MenuList from "../components/menuList";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function HomePage() {
  const { user, error, isLoading } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [historicalTransaction, setHistoricalTransaction] = useState<Transaction[]>([]);
  const [historicalSpending, setHistoricalSpending] = useState<
    { date: string; "Total spending": number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // New combined function to fetch and prepare all data
  async function fetchData() {
    if (!isLoading && user) {
      const response = await userExist(user!);
      if (response?.success) {
        const userData = await monthlySpending(user!);
        const transactions = userData.response.transactions;
        
        // Set recent transactions (sorted new-to-old)
        setHistoricalTransaction(sortByDate("new_to_old", transactions)!);
        
        // Prepare chart data for all transactions (sorted old-to-new)
        let cumulativeSum = 0;
        const chartData = sortByDate("old_to_new", transactions)?.map((transaction) => {
          cumulativeSum += transaction.cost || 0;
          return {
            date: dayjs(transaction.date).format("YYYY-MM-DD"),
            "Total spending": cumulativeSum,
          };
        });
        setHistoricalSpending(chartData || []);
      }
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading && user) {
      fetchData();
    }
  }, [isLoading, user]);

  if (isLoading || loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          backgroundColor: "#f4f4f4",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) return <p>Error: {error.message}</p>;

  return user ? (
    <Layout
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* Pass fetchData to MenuList so that it can refresh transactions */}
      <MenuList
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        user={user}
        refreshTransactions={fetchData}
      />

      {/* Main Content */}
      <Content
        style={{
          flex: 1,
          overflow: "auto",
          marginLeft: collapsed ? "80px" : "250px",
          padding: "40px",
          transition: "all 0.3s ease-in-out",
          backgroundColor: "#f9f9f9",
        }}
      >
        {/* Welcome Section */}
        <Title level={2} style={{ fontWeight: "600", marginBottom: "10px" }}>
          Welcome back,{" "}
          <Text style={{ color: "#ff6600" }}>{user.nickname}</Text>!
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Here’s a quick look at your latest spending.
        </Text>

        {/* Grid Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            marginTop: "30px",
          }}
        >
          {/* Transaction Overview Chart */}
          <Card
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
              padding: "24px",
            }}
          >
            <Title level={4} style={{ marginBottom: "10px", color: "#333" }}>
              Transaction Overview
            </Title>
            {historicalSpending.length > 0 ? (
              <LineChart
                h={300}
                data={historicalSpending}
                dataKey="date"
                series={[{ name: "Total spending" }]}
                curveType="linear"
                connectNulls
              />
            ) : (
              <Text type="secondary">No data available</Text>
            )}
          </Card>

          {/* Recent Transactions with Infinite Scroll */}
          <Card
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
              padding: "24px",
              height: "400px",
              overflow: "hidden",
            }}
          >
            <Title level={4} style={{ marginBottom: "10px", color: "#333" }}>
              Recent Transactions
            </Title>
            <div
              id="scrollableDiv"
              style={{
                height: "300px",
                overflowY: "auto",
                paddingRight: "10px",
              }}
            >
              <InfiniteScroll
                dataLength={historicalTransaction.length}
                next={fetchData}
                hasMore={historicalTransaction.length < 20}
                loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
                scrollableTarget="scrollableDiv"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={historicalTransaction}
                  renderItem={(item) => (
                    <Card
                      style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        marginBottom: "10px",
                      }}
                    >
                      <List.Item>
                        <List.Item.Meta
                          title={<Text strong>{item.name}</Text>}
                          description={
                            <Text type="secondary">
                              ${item.cost?.toFixed(2)}
                            </Text>
                          }
                        />
                      </List.Item>
                    </Card>
                  )}
                />
              </InfiniteScroll>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  ) : (
    <p>No user information available</p>
  );
}
