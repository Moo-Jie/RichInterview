// 基于ant design 组件库：https://procomponents.ant.design/components/table
"use client";
import CreateModal from "./components/CreateModal";
import UpdateModal from "./components/UpdateModal";
import {deleteUserUsingPost, listUserByPageUsingPost,} from "@/api/userController";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import type {ActionType, ProColumns} from "@ant-design/pro-components";
import {PageContainer, ProTable} from "@ant-design/pro-components";
import {App, Button, Table, Typography} from "antd";
import React, {useRef, useState} from "react";
import "./index.css";
import UpdateUserAvatarModal from "@/components/UpdatePictureComponent";

const UserAdminPage: React.FC = () => {
  // 组件状态管理
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false); // 新建弹窗可见性状态
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false); // 编辑弹窗可见性状态
  const [selectedRows, setSelectedRows] = useState<API.User[]>([]); // 多选行数据存储
  const actionRef = useRef<ActionType>(); // 表格操作引用（刷新/重置等）
  const [currentRow, setCurrentRow] = useState<API.User>(); // 当前操作行数据缓存
  const { modal, message } = App.useApp(); // 全局提示和对话框方法
  const [updatePictureVisible, setUpdatePictureVisible] = useState(false);

  // 批量删除处理
  const handleBatchDelete = async () => {
    modal.confirm({
      /* 确认对话框配置 */
      title: "确认删除选中用户？",
      content: `已选择 ${selectedRows.length} 个用户`,
      onOk: async () => {
        const hide = message.loading("正在批量删除");
        try {
          await Promise.all(
            selectedRows.map((row) => deleteUserUsingPost({ id: row.id })),
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
  const handleDelete = async (row: API.User) => {
    modal.confirm({
      /* 确认对话框配置 */
      title: "确认删除用户？",
      content: `即将删除用户：${row.userName}`,
      onOk: async () => {
        const hide = message.loading("正在删除");
        try {
          await deleteUserUsingPost({ id: row.id });
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
  const columns: ProColumns<API.User>[] = [
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
      title: "用户id",
      dataIndex: "id",
      width: 120,
      hideInForm: true,
      ellipsis: true,
    },
    {
      title: "用户账号",
      dataIndex: "userAccount",
      width: 150,
      hideInSearch: true,
      ellipsis: true,
      formItemProps: {
        rules: [{ required: true }],
      },
    },
    {
      title: "用户名称",
      dataIndex: "userName",
      width: 150,
      ellipsis: true,
    },
    {
      title: "用户头像",
      dataIndex: "userAvatar",
      valueType: "image",
      width: 120,
      tooltip: "点击即可上传图片",
      hideInSearch: true,
      render: (
        _,
        record, // 新增点击事件
      ) => (
        <img
          src={record.userAvatar}
          style={{ width: 60, height: 60, cursor: "pointer" }}
          onClick={() => {
            setCurrentRow(record);
            setUpdatePictureVisible(true);
          }}
        />
      ),
    },
    {
      title: "用户角色",
      dataIndex: "userRole",
      width: 120,
      valueEnum: {
        user: { text: "普通用户", status: "Default" },
        admin: { text: "管理员", status: "Success" },
        VIP: { text: "VIP用户", status: "Processing" },
      },
      filters: true,
    },
    {
      title: "用户简介",
      dataIndex: "userProfile",
      width: 150,
      ellipsis: true,
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

  // 过滤掉图片列的配置（用于创建/编辑表单）
  const filteredColumns = columns.filter(
    (col) => col.dataIndex !== "userAvatar",
  );

  return (
    <PageContainer
      className="user-admin-page" // 页面容器样式类名
      header={{
        // 页面标题和面包屑
        title: "用户管理",
        breadcrumb: {
          items: [{ title: "管理" }, { title: "用户管理" }],
        },
      }}
      style={{   paddingBottom: 110 }}
    >
      <ProTable<API.User>
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
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建用户
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
        ]} /* 工具栏按钮组 */
        request={async (params, sort, filter) => {
          const sortField = Object.keys(sort)?.[0];
          const sortOrder = sort?.[sortField] ?? undefined;

          // 精确构建查询参数
          const queryParams: API.UserQueryRequest = {
            // 分页参数
            current: params.current,
            pageSize: params.pageSize,
            // 字段条件映射
            id: params.id,
            userName: params.userName,
            userRole: params.userRole,
            userProfile: params.userProfile,
            // 排序参数
            sortField: sortField,
            sortOrder: sortOrder,
          };

          // @ts-ignore
          const { data, code } = await listUserByPageUsingPost(queryParams);

          return {
            success: code === 0,
            data: data?.records || [],
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
        columns={filteredColumns}
        onSubmit={() => {
          setCreateModalVisible(false);
          actionRef.current?.reload();
        }}
        onCancel={() => setCreateModalVisible(false)}
      />
      <UpdateModal
        visible={updateModalVisible}
        columns={filteredColumns}
        oldData={currentRow}
        onSubmit={() => {
          setUpdateModalVisible(false);
          setCurrentRow(undefined);
          actionRef.current?.reload();
        }}
        onCancel={() => setUpdateModalVisible(false)}
      />
      <UpdateUserAvatarModal
        visible={updatePictureVisible}
        oldData={currentRow}
        onSubmit={() => {
          setUpdatePictureVisible(false);
          actionRef.current?.reload(); // 刷新表格
        }}
        onCancel={() => setUpdatePictureVisible(false)}
      />
    </PageContainer>
  );
};

export default UserAdminPage;
