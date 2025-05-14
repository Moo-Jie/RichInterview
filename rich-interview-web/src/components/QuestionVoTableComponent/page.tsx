// 基于ant design 组件库：https://procomponents.ant.design/components/table
"use client";

import type {ActionType, ProColumns} from "@ant-design/pro-components";
import {PageContainer, ProTable} from "@ant-design/pro-components";
import React, {useRef, useState} from "react";
import TagListComponent from "@/components/TagListComponent";
import Link from "next/link";
import {searchQuestionVoByPageUsingPost} from "@/api/questionController";
import {TablePaginationConfig} from "antd";
import {useSearchParams} from "next/navigation";
import "./index.css";


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
  const searchParams = useSearchParams();  // 获取查询参数
  const searchParam = searchParams?.get('searchParam');        // 读取搜索参数
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
      title: "所属题库ID",
      dataIndex: "questionBankId",
      width: 120,
      ellipsis: true,
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
            searchText: searchParam || '',
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
            // 如果已有数据，无需再次查询
            if (defaultQuestionList && defaultTotal) {
              return;
            }
          }

          const sortField = Object.keys(sort)?.[0] || "createTime";
          const sortOrder = sort?.[sortField] || "descend";
          // @ts-ignore
          const { data, code } = await searchQuestionVoByPageUsingPost({
            ...params,
            sortField : '_score',
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
