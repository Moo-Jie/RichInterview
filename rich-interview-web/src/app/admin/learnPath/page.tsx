// 基于ant design 组件库：https://procomponents.ant.design/components/table
"use client";
import CreateModal from "./components/CreateModal";
import UpdateModal from "./components/UpdateModal";
import {
  deleteLearnPathUsingPost,
  listLearnPathVoByPageUsingPost,
} from "@/api/learnPathController";
import { DeleteOutlined, PlusOutlined, SwapOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { App, Button, Modal, Select, Table, Typography } from "antd";
import React, { useRef, useState } from "react";
import TagListComponent from "@/components/TagListComponent";
import MarkdownEditor from "@/components/MarkdownComponent/MarkdownEditor";

import "./index.css";

/**
 * 学习路线管理页面
 * @constructor
 */
const LearnPathAdminPage: React.FC = () => {
  // 组件状态管理
  // 新建窗口
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false); // 新建弹窗可见性状态
  // 编辑窗口
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false); // 编辑弹窗可见性状态
  // 多选行数据存储
  const [selectedRows, setSelectedRows] = useState<API.LearnPath[]>([]);
  const actionRef = useRef<ActionType>();
  // 当前操作行的数据缓存
  const [currentRow, setCurrentRow] = useState<API.LearnPath>();
  // 全局提示和对话框方法
  const { modal, message } = App.useApp();

  // 批量删除处理
  const handleBatchDelete = async () => {
    modal.confirm({
      /* 确认对话框配置 */
      title: "确认删除选中学习路线？",
      content: `已选择 ${selectedRows.length} 个学习路线`,
      onOk: async () => {
        const hide = message.loading("正在批量删除");
        try {
          await Promise.all(
            selectedRows.map((row) => deleteLearnPathUsingPost({ id: row.id })),
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
  const handleDelete = async (row: API.LearnPath) => {
    modal.confirm({
      /* 确认对话框配置 */
      title: "确认删除学习路线？",
      content: `即将删除学习路线：${row.title}`,
      onOk: async () => {
        const hide = message.loading("正在删除");
        try {
          await deleteLearnPathUsingPost({ id: row.id });
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
  const columns: ProColumns<API.LearnPath>[] = [
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
      title: "学习路线ID（路由跳转）",
      dataIndex: "id",
      width: 120,
      hideInForm: true,
      ellipsis: true,
    },
    {
      title: "路线名称",
      width: 150,
      dataIndex: "title",
      valueType: "text",
      ellipsis: true,
    },
    {
      title: "路线介绍",
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
            <MarkdownEditor {...fieldProps} placeholder="请输入学习路线内容" />
          );
        }
        return defaultRender(_);
      },
    },
    {
      title: "路线详情",
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
            <MarkdownEditor {...fieldProps} placeholder="请输入学习路线答案" />
          );
        }
        return defaultRender(_);
      },
    },
    {
      title: "标签",
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
      className="learnPath-admin-page" // 页面容器样式类名
      header={{
        // 页面标题和面包屑
        title: "学习路线管理",
        breadcrumb: {
          items: [{ title: "管理" }, { title: "学习路线管理" }],
        },
      }}
    >
      <ProTable<API.LearnPath>
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
            新建学习路线
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
        ]}
        /* 工具栏按钮组 */
        request={async (params, sort, filter) => {
          const sortField = Object.keys(sort)?.[0];
          const sortOrder = sort?.[sortField] ?? undefined;

          // 精确构建查询参数
          const queryParams: API.LearnPathQueryRequest = {
            // 分页参数
            current: params.current,
            pageSize: params.pageSize,
            // 字段条件映射
            id: params.id,
            title: params.title,
            notId: params.notId,
            content: params.content,
            answer: params.answer,

            searchText: params.searchText,
            userId: params.userId,
            // 排序参数
            sortField: sortField,
            sortOrder: sortOrder,
          };

          // @ts-ignore
          const { data, code } =
            await listLearnPathVoByPageUsingPost(queryParams);

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
export default LearnPathAdminPage;
