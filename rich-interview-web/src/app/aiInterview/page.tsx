"use client";
import {useEffect, useState} from "react";
import {App, Button, Form, Input, Modal, Space, Table, Tag, Typography,} from "antd";
import {
    addMockInterviewUsingPost,
    deleteMockInterviewUsingPost,
    listMyMockInterviewByPageUsingPost,
} from "@/api/mockInterviewController";
import dayjs from "dayjs";
import {DashboardOutlined, RobotOutlined, RocketOutlined,} from "@ant-design/icons";
import "./index.css";
import {useRouter} from "next/navigation";
import MockInterview = API.MockInterview;

type StatusMap = {
  [key: number]: { text: string; color: string };
};

export default function AIMockInterviewPage() {
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const router = useRouter();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  // 加载面试记录
  const loadInterviews = async (current = pagination.current, pageSize = pagination.pageSize) => {
    try {
      const res = await listMyMockInterviewByPageUsingPost({
        pageSize,
        current,
      });
      // @ts-ignore
      if (res != null) {
        // @ts-ignore
        setInterviews(res.data?.records || []);
        // 更新分页总数
        setPagination(prev => ({
          ...prev,
          // @ts-ignore
          total: res.data?.total || 0
        }));
      }
    } catch (error) {
      message.error("加载面试记录失败");
    }
  };

  // 添加分页变化处理函数
  const handlePaginationChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    loadInterviews(newPagination.current, newPagination.pageSize);
  };

  // 删除面试记录
  const handleDelete = (id: number) => {
    setDeletingId(id);
    setConfirmModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await deleteMockInterviewUsingPost({ id: deletingId });
      if (res != null) {
        message.success("删除成功");
        await loadInterviews();
      }
    } catch (error) {
      message.error("删除失败");
    } finally {
      setConfirmModalVisible(false);
      setDeletingId(null);
    }
  };

  // 创建新面试
  const handleCreate = async (values: any) => {
    try {
      const res = await addMockInterviewUsingPost(values);
      if (res != null && res.data) {
        message.success("创建成功");
        router.push(`/aiInterview/${res.data}`)
      }
    } catch (error) {
      message.error("创建失败");
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const columns = [
    {
      title: "面试岗位",
      dataIndex: "jobPosition",
      key: "jobPosition",
      className: "job-position-column",
      render: (text: string) => <span className="job-position">{text}</span>,
    },
    {
      title: "面试难度",
      dataIndex: "difficulty",
      key: "difficulty",
      render: (text: string) => {
        let color = "";
        if (text === "初级") color = "green";
        else if (text === "中级") color = "blue";
        else color = "red";

        return (
          <Tag color={color} className="difficulty-tag">
            {text}
          </Tag>
        );
      },
    },
    {
      title: "面试状态",
      dataIndex: "status",
      key: "status",
      render: (status: number) => {
        const statusMap: StatusMap = {
          0: { text: "待开始", color: "blue" },
          1: { text: "进行中", color: "orange" },
          2: { text: "已结束", color: "green" },
        };
        return (
          <Tag color={statusMap[status].color} className="status-tag">
            <span className={`status-badge status-${status}`}>
              {statusMap[status].text}
            </span>
          </Tag>
        );
      },
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      render: (text: string) => (
        <span className="time-text">
          {dayjs(text).format("YYYY-MM-DD HH:mm")}
        </span>
      ),
    },
    {
      title: "操作",
      key: "action",
      className: "action-column",
      render: (_: any, record: MockInterview) => (
        <Space>
          <Button
            type="primary"
            onClick={() => router.push(`/aiInterview/${record.id}`)}
            className="def-btn"
            target="_blank"
          >
            进入面试
          </Button>
          <Button
            danger
            onClick={() => handleDelete(record.id!)}
            className="def-btn"
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="ai-interview-page">
      <div className="header-section">
        <h1>
          AI 模拟面试 <RobotOutlined className="ai-icon" />
        </h1>
        <p className="subtitle">
          智能 AI 面试官帮助你在任何时间、任何地点进行模拟面试，精准评估你的表现
        </p>
      </div>

      <div className="feature-highlights">
        <div className="feature-card">
          <div className="icon-box">
            <DashboardOutlined />
          </div>
          <h3>自适应评估</h3>
          <p>结合面试难度与工作经历动态给出面试题目</p>
        </div>
        <div className="feature-card">
          <div className="icon-box">
            <RocketOutlined />
          </div>
          <h3>实时分析</h3>
          <p>面试结束后总结你的回答评分和改进建议</p>
        </div>
        <div className="feature-card">
          <div className="icon-box">
            <RobotOutlined />
          </div>
          <h3>多岗位支持</h3>
          <p>覆盖技术、产品、市场等多种岗位面试场景</p>
        </div>
      </div>

      <div className="content-card">
        <div className="action-section">
          <Button
            type="primary"
            onClick={() => setCreateModalVisible(true)}
            className="aiiw-copy-button"
            icon={<RocketOutlined />}
          >
            点击开始面试
          </Button>
        </div>

        {/* 新增标题 */}
        <Typography.Title
          level={4}
          className="table-title"
          style={{ marginBottom: 16 }}
        >
          面试记录
        </Typography.Title>

        <Table
            columns={columns}
            dataSource={interviews}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20'],
              showTotal: (total) => `共 ${total} 条`,
              onChange: handlePaginationChange
            }}
            className="interview-table"
            rowClassName="interview-table-row"
        />

        <Modal
          title="确认删除"
          open={confirmModalVisible}
          onOk={handleConfirmDelete}
          onCancel={() => setConfirmModalVisible(false)}
          className="confirm-modal"
          okText="确认删除"
          cancelText="取消"
        >
          <p>确定要删除这条面试记录吗？此操作不可撤销。</p>
        </Modal>

        <Modal
          title="创建新的模拟面试"
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onOk={() => form.submit()}
          className="create-modal"
          okText="开始面试"
          cancelText="取消"
        >
          <Form form={form} onFinish={handleCreate} layout="vertical">
            <Form.Item
              label="目标职位"
              name="jobPosition"
              rules={[{ required: true, message: "请输入职位名称" }]}
            >
              <Input placeholder="例如：Java高级工程师" />
            </Form.Item>
            <Form.Item
              label="工作经验"
              name="workExperience"
              rules={[{ required: true, message: "请输入工作经验" }]}
            >
              <Input placeholder="例如：3-5年" />
            </Form.Item>
            <Form.Item
              label="难度级别"
              name="difficulty"
              rules={[{ required: true, message: "请选择难度" }]}
            >
              <Input placeholder="例如：初级、中级或高级" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
