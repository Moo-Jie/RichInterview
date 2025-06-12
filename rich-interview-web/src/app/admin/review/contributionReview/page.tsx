"use client";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  approveQuestionReviewUsingPost,
  batchApproveQuestionReviewUsingPost,
  batchDeleteQuestionReviewUsingPost,
  batchRejectQuestionReviewUsingPost,
  deleteQuestionReviewUsingPost,
  listQuestionReviewByPageUsingPost,
  rejectQuestionReviewUsingPost,
} from "@/api/questionReviewController";
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from "@ant-design/pro-components";
import { App, Button, Space, Typography } from "antd";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownComponent/MarkdownEditor";
import TagListComponent from "@/components/TagListComponent";
import UpdateModal from "./components/UpdateModal";

const ContributionReviewPage: React.FC = () => {
  const { modal, message } = App.useApp();
  const router = useRouter();
  const actionRef = useRef<ActionType>();
  const [selectedRows, setSelectedRows] = useState<API.QuestionReview[]>([]);
  const [currentRow, setCurrentRow] = useState<API.QuestionReview>();
  // 完善题目内容弹窗
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  // 批量操作处理
  const handleBatchAction = async (api: Function, successMsg: string) => {
    const ids = selectedRows.map((row) => row.id!);
    modal.confirm({
      title: `确认${successMsg}？`,
      content: `已选择 ${ids.length} 个待审批项`,
      onOk: async () => {
        const hide = message.loading("处理中...");
        try {
          await api(ids);
          hide();
          message.success(`${successMsg}成功`);
          actionRef.current?.reloadAndRest?.();
          setSelectedRows([]);
        } catch (error: any) {
          hide();
          message.error(`${successMsg}失败：${error.message}`);
        }
      },
    });
  };

  // 单独审批通过方法
  const handleApprove = async (reviewId: number) => {
    modal.confirm({
      title: "确认通过审批？",
      content: "通过后题目将发布",
      onOk: async () => {
        const hide = message.loading("处理中...");
        try {
          await approveQuestionReviewUsingPost({ reviewId });
          hide();
          message.success(
            <>
              审批通过成功！
              <Button
                type="link"
                onClick={() => router.push("/admin/question")}
              >
                前往分配题库
              </Button>
            </>,
          );
          actionRef.current?.reload();
        } catch (error: any) {
          hide();
          message.error(`审批通过失败：${error.message}`);
        }
      },
    });
  };

  // 单独审批拒绝方法
  const handleReject = async (reviewId: number) => {
    modal.confirm({
      title: "确认拒绝审批？",
      content: "拒绝后该贡献将被标记为未通过",
      onOk: async () => {
        const hide = message.loading("处理中...");
        try {
          await rejectQuestionReviewUsingPost({ reviewId });
          hide();
          message.success("拒绝审批成功");
          actionRef.current?.reload();
        } catch (error: any) {
          hide();
          message.error(`拒绝审批失败：${error.message}`);
        }
      },
    });
  };

  const columns: ProColumns<API.QuestionReview>[] = [
    {
      title: "序号",
      width: 120,
      hideInForm: true, // 新建/编辑表单中隐藏
      search: false, // 禁用搜索
      sorter: true, // 开启后端排序
      render: (_, __, index) => {
        /* 分页序号生成逻辑 */
        const { current = 1, pageSize = 10 } =
          actionRef.current?.pageInfo || {};
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: "id",
      dataIndex: "id",
      width: 120,
      hideInForm: true,
      ellipsis: true,
    },
    {
      title: "题目名称",
      width: 150,
      dataIndex: "title",
      valueType: "text",
      ellipsis: true,
    },
    {
      title: "内容",
      dataIndex: "content",
      valueType: "text",
      hideInSearch: true,
      width: 200,
      render: (text) => (
        <Typography.Text ellipsis={{}} className="multi-line-ellipsis">
          {text}
        </Typography.Text>
      ),
      // @ts-ignore
      renderFormItem: (_, { type, defaultRender, fieldProps }) => {
        if (type === "form") {
          return (
            <MarkdownEditor {...fieldProps} placeholder="请输入题目内容" />
          );
        }
        return defaultRender(_);
      },
    },
    {
      title: "答案",
      dataIndex: "answer",
      valueType: "text",
      hideInSearch: true,
      width: 400,
      // 区分编辑和查看状态下的渲染逻辑
      render: (text) => (
        <Typography.Text ellipsis={{}} className="multi-line-ellipsis">
          {text}
        </Typography.Text>
      ),
      // @ts-ignore
      renderFormItem: (_, { type, defaultRender, fieldProps }) => {
        if (type === "form") {
          return (
            <MarkdownEditor {...fieldProps} placeholder="请输入题目答案" />
          );
        }
        return defaultRender(_);
      },
    },
    {
      title: "标签",
      tooltip: "本系统标签规范：首部为难度标签（简单/中等/困难）",
      dataIndex: "tags",
      width: 200,
      valueType: "select",
      hideInSearch: true,
      fieldProps: {
        mode: "tags",
        options: [
          { label: "简单", value: "简单" },
          { label: "中等", value: "中等" },
          { label: "困难", value: "困难" },
        ],
        tokenSeparators: [","],
      },
      align: "left",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "必须包含难度标签（简单/中等/困难）",
            validator: (_, value) =>
              value?.some((v: string) => ["简单", "中等", "困难"].includes(v))
                ? Promise.resolve()
                : Promise.reject(new Error("必须包含难度标签")),
          },
        ],
      },
      render: (_, record) => {
        const tagList = JSON.parse(record.tags || "[]");
        return <TagListComponent tagList={tagList} />;
      },
    },
    {
      title: "提交人 ID",
      dataIndex: "userId",
      width: 120,
      ellipsis: true,
    },
    {
      title: "提交时间",
      dataIndex: "createTime",
      valueType: "dateTime",
      hideInSearch: true,
      width: 180,
      ellipsis: true,
    },
    {
      title: "审批状态",
      dataIndex: "reviewStatus",
      width: 180,
      fixed: "left",
      sorter: true, // 排序功能
      defaultSortOrder: "ascend", // 默认排序
      valueEnum: {
        0: { text: "待审核", status: "Processing" },
        1: { text: "已通过", status: "Success" },
        2: { text: "未通过", status: "Error" },
      },
    },

    {
      title: "操作",
      width: 280,
      valueType: "option",
      fixed: "right", // 固定操作列
      render: (_, record) => [
        record.reviewStatus === 0 && (
          <Space key="actions">
            <Typography.Link onClick={() => handleApprove(record.id!)}>
              <CheckCircleOutlined /> 通过
            </Typography.Link>
            <Typography.Link
              type="danger"
              onClick={() => handleReject(record.id!)}
            >
              <CloseCircleOutlined /> 拒绝
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                setCurrentRow(record);
                setUpdateModalVisible(true);
              }}
            >
              <EditOutlined /> 完善
            </Typography.Link>
          </Space>
        ),
        <Typography.Link
          key="delete"
          type="danger"
          // @ts-ignore
          onClick={() =>
            handleBatchAction(
              //   @ts-ignore
              () => deleteQuestionReviewUsingPost(record.id),
              "删除",
            )
          }
        >
          <DeleteOutlined /> 删除
        </Typography.Link>,
      ],
    },
  ];

  return (
    <PageContainer
      title="题目贡献审批"
      header={{
        breadcrumb: {
          items: [{ title: "社区共建" }, { title: "贡献审批" }],
        },
      }}
    >
      <ProTable<API.QuestionReview>
        actionRef={actionRef}
        rowKey="id"
        scroll={{ x: 1200, y: "calc(100vh - 300px)" }}
        rowSelection={{
          selectedRowKeys: selectedRows.map((row) => row.id!),
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        toolBarRender={() => [
          <Button
            key="batchApprove"
            type="primary"
            disabled={!selectedRows.length}
            onClick={() =>
              handleBatchAction(batchApproveQuestionReviewUsingPost, "批量通过")
            }
          >
            <CheckCircleOutlined /> 批量通过
          </Button>,
          <Button
            key="batchReject"
            danger
            disabled={!selectedRows.length}
            onClick={() =>
              handleBatchAction(batchRejectQuestionReviewUsingPost, "批量拒绝")
            }
          >
            <CloseCircleOutlined /> 批量拒绝
          </Button>,
          <Button
            key="batchDelete"
            danger
            disabled={!selectedRows.length}
            onClick={() =>
              handleBatchAction(batchDeleteQuestionReviewUsingPost, "批量删除")
            }
          >
            <DeleteOutlined /> 批量删除
          </Button>,
        ]}
        request={async (params) => {
          // @ts-ignore
          const { data, code } = await listQuestionReviewByPageUsingPost({
            ...params,
            current: params.current,
            pageSize: params.pageSize,
            // 排序参数
            sortField: "reviewStatus",
            sortOrder: "ascend",
          });
          return {
            success: code === 0,
            // @ts-ignore
            data: data?.records || [],
            // @ts-ignore
            total: data?.total || 0,
          };
        }}
        columns={columns}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          defaultPageSize: 10,
        }}
      />
      {/* 完善题目内容弹框 */}
      <UpdateModal
        visible={updateModalVisible}
        oldData={currentRow}
        columns={columns.filter((column) =>
          ["title", "content", "answer", "tags"].includes(
            column.dataIndex as string,
          ),
        )}
        onSubmit={() => {
          setUpdateModalVisible(false);
          actionRef.current?.reload();
        }}
        onCancel={() => setUpdateModalVisible(false)}
      />
    </PageContainer>
  );
};

export default ContributionReviewPage;
