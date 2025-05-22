// 基于ant design 组件库：https://procomponents.ant.design/components/table
"use client";

import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import React, { useRef, useState } from "react";
import TagListComponent from "@/components/TagListComponent";
import Link from "next/link";
import { searchQuestionVoByPageUsingPost } from "@/api/questionController";
import { TablePaginationConfig } from "antd";
import { useSearchParams } from "next/navigation";
import "./index.css";
import { listQuestionBankVoByPageUsingPost } from "@/api/questionBankController";

interface Props {
  // 服务端渲染时，默认数据
  defaultQuestionList?: API.QuestionVO[];
  defaultTotal?: number;
  // 默认搜索条件
  defaultSearchParams?: API.QuestionQueryRequest;
}

/**
 * 题目表单集成组件
 * @constructor
 */
const QuestionTablePage: React.FC = (tableProps: Props) => {
  const actionRef = useRef<ActionType>();
  // 获取查询参数
  const searchParams = useSearchParams();
  // 读取搜索参数
  const searchParam = searchParams?.get("searchParam");
  // 用于存储题库选项
  const [bankOptions, setBankOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const {
    defaultQuestionList,
    defaultTotal,
    defaultSearchParams = {},
  } = tableProps;
  // 题目列表
  const [questionList, setQuestionList] = useState<API.QuestionVO[]>(
    defaultQuestionList || [],
  );
  // 题目总数
  const [total, setTotal] = useState<number>(defaultTotal || 0);
  // 用于判断是否首次加载, 初始化搜索条件
  const [init, setInit] = useState<boolean>(true);

  // 表格列配置
  const columns: ProColumns<API.QuestionVO>[] = [
    {
      title: "序号",
      width: 120,
      hideInForm: true,
      search: false,
      render: (_, __, index) => {
        /* 分页序号生成逻辑 */
        const { current = 1, pageSize = 10 } =
          actionRef.current?.pageInfo || {};
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: "搜索",
      dataIndex: "searchText",
      valueType: "text",
      hideInTable: true,
    },
    {
      title: "题目名称",
      width: 150,
      dataIndex: "title",
      valueType: "text",
      ellipsis: true,
      render: (_, record) => {
        return <Link href={`/question/${record.id}`}>{record.title}</Link>;
      },
    },
    {
      title: "所属题库",
      dataIndex: "questionBankId",
      valueType: "select",
      width: 180,
      fieldProps: {
        showSearch: true,
        // 预加载题库选项
        options: bankOptions,
        placeholder: "请选择所属题库",
        // 自定义搜索逻辑
        // @ts-ignore
        filterOption: (input, option) =>
          //
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
      },
      // 异步请求题库列表并存储到 bankOptions 状态
      request: async () => {
        const { data } = await listQuestionBankVoByPageUsingPost({
          pageSize: 1000,
        });
        // 存储题库列表
        // 把每一个 bank 的 id 和 title 映射成一个对象，然后返回一个 options 数组
        // @ts-ignore
        const options = (data?.records || []).map((bank) => ({
          label: bank.title || "未命名题库",
          value: bank.id,
        }));
        // 同步到 bankOptions 状态
        setBankOptions(options);
        return options;
      },
      // 自定义表格渲染逻辑
      render: (_, record) => {
        // 根据ID查找对应题库
        const bank = bankOptions.find((b) => b.value === record.questionBankId);
        // 显示题库名称，当没查到时显示ID
        return bank?.label || record.questionBankId;
      },
    },
    {
      title: "标签",
      dataIndex: "tagList",
      width: 200,
      valueType: "select",
      hideInSearch: true,
      fieldProps: {
        mode: "tagList",
      },
      align: "left",
      render: (_, record) => {
        return <TagListComponent tagList={record.tagList} />;
      },
    },
  ];

  return (
    <PageContainer
      header={{
        // 页面标题和面包屑
        title: "全部题目",
        breadcrumb: {
          items: [{ title: "主页" }, { title: "全部题目" }],
        },
      }}
    >
      <ProTable<API.QuestionVO>
        rowKey="id"
        actionRef={actionRef}
        size="large"
        search={{
          labelWidth: "auto",
        }}
        // 默认搜索条件设置
        form={{
          initialValues: {
            ...defaultSearchParams,
            // 同步 URL 参数到表单
            searchText: searchParam || "",
          },
        }}
        dataSource={questionList}
        pagination={
          {
            pageSize: 10,
            showTotal: (total) => `总共 ${total} 条`,
            showSizeChanger: false,
            total,
          } as TablePaginationConfig
        }
        // @ts-ignore
        request={async (params, sort, filter) => {
          const finalParams = {
            ...params,
            // 通过 URL 参数覆盖默认值
            searchText: searchParam || params.searchText,
          };
          // 首次请求
          if (init) {
            setInit(false);
          }

          const sortField = Object.keys(sort)?.[0] || "createTime";
          const sortOrder = sort?.[sortField] || "descend";
          // @ts-ignore
          const { data, code } = await searchQuestionVoByPageUsingPost({
            ...params,
            sortField: "_score",
            sortOrder,
            ...filter,
          } as API.QuestionQueryRequest);

          // 更新结果
          // @ts-ignore
          const newData = data?.records || [];
          // @ts-ignore
          const newTotal = data?.total || 0;
          // 更新状态
          setQuestionList(newData);
          setTotal(newTotal);

          return {
            success: code === 0,
            data: newData,
            total: newTotal,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};
export default QuestionTablePage;
