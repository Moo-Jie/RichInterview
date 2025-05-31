// 基于ant design 组件库：https://procomponents.ant.design/components/table
"use client";
import CreateModal from "./components/CreateModal";
import UpdateModal from "./components/UpdateModal";
import {deleteQuestionUsingPost, listQuestionVoByPageUsingPost,} from "@/api/questionController";
import {DeleteOutlined, PlusOutlined, SwapOutlined} from "@ant-design/icons";
import type {ActionType, ProColumns} from "@ant-design/pro-components";
import {PageContainer, ProTable} from "@ant-design/pro-components";
import {App, Button, Modal, Select, Table, Typography} from "antd";
import React, {useRef, useState} from "react";
import TagListComponent from "@/components/TagListComponent";
import MarkdownEditor from "@/components/MarkdownComponent/MarkdownEditor";
import {listQuestionBankVoByPageUsingPost} from "@/api/questionBankController";
import {batchAddOrUpdateQuestionsToBankUsingPost} from "@/api/questionBankQuestionController";

import "./index.css";

/**
 * 题目管理页面
 * @constructor
 */
const QuestionAdminPage: React.FC = () => {
  // 组件状态管理
  // 新建窗口
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false); // 新建弹窗可见性状态
  // 编辑窗口
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false); // 编辑弹窗可见性状态
  // 更新所属题库窗口
  const [updateBankModalVisible, setUpdateBankModalVisible] =
    useState<boolean>(false);
  // 向题库批量添加题目窗口
  const [
    batchAddQuestionsToBankModalVisible,
    setBatchAddQuestionsToBankModalVisible,
  ] = useState<boolean>(false);
  // 从题库批量删除题目窗口
  const [
    batchRemoveQuestionsFromBankModalVisible,
    setBatchRemoveQuestionsFromBankModalVisible,
  ] = useState<boolean>(false);
  // 多选行数据存储
  const [selectedRows, setSelectedRows] = useState<API.Question[]>([]);
  const actionRef = useRef<ActionType>();
  // 当前操作行的数据缓存
  const [currentRow, setCurrentRow] = useState<API.Question>();
  // 全局提示和对话框方法
  const { modal, message } = App.useApp();
  // 题库列表
  const [bankOptions, setBankOptions] = useState<
    { label: string; value: number }[]
  >([]);
  // 调整题目所属题库状态
  const [batchUpdateBankVisible, setBatchUpdateBankVisible] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<number>();

  // 批量调整题目所属题库
  const handleBatchUpdateBank = async () => {
    if (!selectedBankId) {
      message.warning("请先选择目标题库");
      return;
    }

    modal.confirm({
      title: "确认批量更新所属题库？",
      content: `即将将 ${selectedRows.length} 个题目转移到所选题库`,
      onOk: async () => {
        const hide = message.loading("正在批量更新");
        try {
          await batchAddOrUpdateQuestionsToBankUsingPost({
            questionBankId: selectedBankId,
            // @ts-ignore
            questionIdList: selectedRows.map((row) => row.id),
          });
          hide();
          message.success("批量更新成功");
          actionRef.current?.reload();
          setSelectedRows([]);
          setBatchUpdateBankVisible(false);
        } catch (error: any) {
          hide();
          message.error("更新失败，" + error.message);
        }
      },
    });
  };

  // 批量删除处理
  const handleBatchDelete = async () => {
    modal.confirm({
      /* 确认对话框配置 */
      title: "确认删除选中题目？",
      content: `已选择 ${selectedRows.length} 个题目`,
      onOk: async () => {
        const hide = message.loading("正在批量删除");
        try {
          await Promise.all(
            selectedRows.map((row) => deleteQuestionUsingPost({ id: row.id })),
          );
          hide();
          message.success("批量删除成功");
          actionRef.current?.reloadAndRest?.();
          setSelectedRows([]);
        } catch (error: any) {
          hide();
          message.error("删除失败，" + error.message);
        }
      },
    });
  };

  // 单个删除处理
  const handleDelete = async (row: API.Question) => {
    modal.confirm({
      /* 确认对话框配置 */
      title: "确认删除题目？",
      content: `即将删除题目：${row.title}`,
      onOk: async () => {
        const hide = message.loading("正在删除");
        try {
          await deleteQuestionUsingPost({ id: row.id });
          hide();
          message.success("删除成功");
          actionRef.current?.reload();
        } catch (error: any) {
          hide();
          message.error("删除失败，" + error.message);
        }
      },
    });
  };
  // 表格列配置
  const columns: ProColumns<API.Question>[] = [
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
      title: "题目id",
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
      title: "所属题库",
      dataIndex: "questionBankId",
      width: 200,
      valueType: "select",
      fieldProps: {
        showSearch: true,
        options: bankOptions,
        placeholder: "请选择所属题库",
        // @ts-ignore
        filterOption: (input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
      },
      render: (_, record) => {
        const bank = bankOptions.find((b) => b.value === record.questionBankId);
        return bank ? bank.label : record.questionBankId;
      },
      renderFormItem: (_, { defaultRender }) => defaultRender(_),
      request: async (key) => {
        const { data } = await listQuestionBankVoByPageUsingPost({
          pageSize: 100,
          current: 1,
        });
        // @ts-ignore
        const options = (data?.records || []).map((bank) => ({
          label: bank.title || "",
          value: bank.id || 0,
        }));
        setBankOptions(options);
        // @ts-ignore
        return options.filter((opt) =>
          opt.label.toLowerCase().includes((key.keyword || "").toLowerCase()),
        );
      },
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
      tooltip: "本系统标签规范：首部为难度标签",
      dataIndex: "tags",
      width: 200,
      valueType: "select",
      hideInSearch: true,
      fieldProps: {
        mode: "tags",
      },
      align: "left",
      render: (_, record) => {
        const tagList = JSON.parse(record.tags || "[]");
        return <TagListComponent tagList={tagList} />;
      },
    },

    {
      title: "创建时间",
      dataIndex: "createTime",
      valueType: "dateTime",
      hideInForm: true,
      hideInSearch: true,
      width: 180,
      sorter: true,
      search: {
        transform: (value) => ({ createTimeRange: value }),
      },
    },
    {
      title: "用户操作时间",
      dataIndex: "editTime",
      valueType: "dateTime",
      hideInForm: true,
      hideInSearch: true,
      width: 180,
      sorter: true,
      search: {
        transform: (value) => ({ createTimeRange: value }),
      },
    },
    {
      title: "数据更新时间",
      dataIndex: "updateTime",
      valueType: "dateTime",
      hideInForm: true,
      hideInSearch: true,
      width: 180,
      sorter: true,
      search: {
        transform: (value) => ({ updateTimeRange: value }),
      },
    },
    {
      title: "操作",
      valueType: "option", // 操作列类型
      width: 120,
      fixed: "left", // 固定操作列
      render: (_, record) => [
        /* 操作按钮组 */
        <Typography.Link
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            setUpdateModalVisible(true);
          }}
        >
          编辑
        </Typography.Link>,
        <Typography.Link
          key="delete"
          type="danger"
          onClick={() => handleDelete(record)}
        >
          删除
        </Typography.Link>,
      ],
    },
  ];

  return (
    <PageContainer
      className="question-admin-page" // 页面容器样式类名
      header={{
        // 页面标题和面包屑
        title: "题目管理",
        breadcrumb: {
          items: [{ title: "管理" }, { title: "题目管理" }],
        },
      }}
      style={{   paddingBottom: 110 }}
    >
      <ProTable<API.Question>
        actionRef={actionRef}
        rowKey="id" // 行数据唯一标识
        cardBordered // 卡片边框样式
        scroll={{
          x: 1200,
          y: "calc(100vh - 100px)", // 优化表格高度
        }} // 滚动区域设置
        rowSelection={{
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
          onChange: (_, rows) => setSelectedRows(rows),
        }} /* 行选择配置 */
        search={{
          labelWidth: "auto",
          // @ts-ignore
          span: { xs: 24, sm: 12, md: 8, lg: 8, xl: 6 }, // 调整搜索栏布局
          optionRender: (searchConfig, props, dom) => [
            ...dom,
            <Button
              key="clear"
              onClick={() => {
                searchConfig.form?.resetFields();
              }}
            >
              清空索引
            </Button>,
          ],
        }}
        // 工具栏按钮
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建题目
          </Button>,
          selectedRows?.length > 0 && (
            <Button
              key="batchDelete"
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
            >
              批量删除
            </Button>
          ),
          selectedRows?.length > 0 && (
            <Button
              key="batchUpdateBank"
              icon={<SwapOutlined />}
              onClick={() => setBatchUpdateBankVisible(true)}
            >
              批量指定所属题库
            </Button>
          ),
        ]}
        /* 工具栏按钮组 */
        request={async (params, sort, filter) => {
          const sortField = Object.keys(sort)?.[0];
          const sortOrder = sort?.[sortField] ?? undefined;

          // 精确构建查询参数
          const queryParams: API.QuestionQueryRequest = {
            // 分页参数
            current: params.current,
            pageSize: params.pageSize,
            // 字段条件映射
            id: params.id,
            title: params.title,
            notId: params.notId,
            content: params.content,
            questionBankId: params.questionBankId,
            answer: params.answer,

            searchText: params.searchText,
            userId: params.userId,
            // 排序参数
            sortField: sortField,
            sortOrder: sortOrder,
          };
          // @ts-ignore
          const { data, code } =
            await listQuestionVoByPageUsingPost(queryParams);

          return {
            success: code === 0,
            // @ts-ignore
            data: data?.records || [],
            // @ts-ignore
            total: Number(data?.total) || 0,
          };
        }} /* 数据请求逻辑 */
        columns={columns}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20],
          defaultPageSize: 5,
          position: ["bottomRight"], // 分页对齐方式
        }} /* 分页器配置 */
        locale={{
          // @ts-ignore
          tableForm: {
            search: "查询",
            reset: "重置",
          },
        }} // 本地化文本
      />
      <Modal
        title="批量指定所属题库"
        open={batchUpdateBankVisible}
        onCancel={() => setBatchUpdateBankVisible(false)}
        onOk={handleBatchUpdateBank}
      >
        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="选择目标题库"
          options={bankOptions}
          onChange={(value) => setSelectedBankId(value)}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
      </Modal>
      <CreateModal
        visible={createModalVisible}
        columns={columns}
        onSubmit={() => {
          setCreateModalVisible(false);
          actionRef.current?.reload();
        }}
        onCancel={() => setCreateModalVisible(false)}
      />
      <UpdateModal
        visible={updateModalVisible}
        columns={columns}
        oldData={currentRow}
        onSubmit={() => {
          setUpdateModalVisible(false);
          setCurrentRow(undefined);
          actionRef.current?.reload();
        }}
        onCancel={() => setUpdateModalVisible(false)}
      />
    </PageContainer>
  );
};
export default QuestionAdminPage;
