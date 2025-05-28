"use client";
import { App, Avatar, Card, Col, Modal, Row } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import { useState } from "react";
import { updateMyUserUsingPost } from "@/api/userController";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import CalendarChart from "@/components/CalendarChartComponent";
import RecentStudy from "@/components/RecentStudyComponent";
import UpdateUserAvatarModal from "@/components/UpdatePictureComponent";
import { setUserLogin } from "@/store/userLogin";
import "./index.css";

/**
 * 用户管理页面
 * @constructor
 */
export default function UserCenterPage() {
  const { message } = App.useApp();

  /**
   * 更新个人信息
   * @param fields
   */
  const handleUpdateMy = async (fields: API.UserUpdateMyRequest) => {
    const hide = message.loading("正在更新");
    try {
      await updateMyUserUsingPost(fields);
      hide();
      message.success("更新成功");
      return true;
    } catch (error: any) {
      hide();
      message.error("更新失败，" + error.message);
      return false;
    }
  };

  // 更新头像
  const [updateAvatarVisible, setUpdateAvatarVisible] = useState(false);
  const dispatch = useDispatch();

  // 获取登录用户信息
  const loginUser = useSelector((state: RootState) => state.userLogin);
  const user = loginUser;
  // 控制菜单栏的 Tab 高亮
  const [activeTabKey, setActiveTabKey] = useState<string>("record");
  const [editVisible, setEditVisible] = useState(false);

  // 编辑个人信息表单列
  const editColumns: ProColumns<API.UserUpdateMyRequest>[] = [
    {
      title: "用户名",
      dataIndex: "userName",
      formItemProps: {
        rules: [{ required: true }],
      },
    },
    {
      title: "用户头像",
      dataIndex: "userAvatar",
      valueType: "avatar",
      hideInForm: true,
    },
    {
      title: "个人简介",
      dataIndex: "userProfile",
      valueType: "textarea",
    },
  ];

  return (
    <div id="userCenterPage" className="max-width-content">
      {/*个人信息标签*/}
      <Row gutter={[0, 24]}>
        <Col xs={24}>
          <Card
            style={{ textAlign: "center" }}
            extra={<a onClick={() => setEditVisible(true)}>编辑资料</a>}
          >
            <Avatar
              src={user.userAvatar}
              shape="square"
              size={200}
              alt={"头像:" + user.userName}
              onClick={() => setUpdateAvatarVisible(true)}
              className="user-avatar"
            />
            <div className="avatar-margin" />
            <Card.Meta
              title={
                <Title level={4} className="username">
                  {user.userName}
                </Title>
              }
              description={
                <Paragraph type="secondary" className="user-profile">
                  {user.userProfile}
                </Paragraph>
              }
            />
          </Card>

          <Card style={{ textAlign: "center" }}>
            <div className="avatar-margin" />
            <Card.Meta
              title={
                <Title level={4} className="username">
                  其他信息
                </Title>
              }
              description={
                <Paragraph type="secondary" className="user-profile">
                  <h5>
                    身份：{user.userRole === user ? "普通用户" : "管理员"}
                  </h5>
                  <h5>注册时间：{user.createTime}</h5>
                  <h5>最后操作时间：{user.updateTime}</h5>
                  <Card
                    style={{
                      maxWidth: 600,
                      margin: "0 auto",
                      width: "100%",
                    }}
                  >
                    <RecentStudy />
                  </Card>
                </Paragraph>
              }
            />
          </Card>
        </Col>

        <Col xs={24}>
          {/* TODO 刷题记录表格、详细信息卡片*/}
          <Card
            className="content-card"
            tabList={[
              {
                key: "record",
                label: "刷题记录",
              },
              {
                key: "updateUserMsg",
                label: "编辑资料",
              },
              {
                key: "userMsg",
                label: "其他信息",
              },
            ]}
            activeTabKey={activeTabKey}
            onTabChange={(key: string) => {
              setActiveTabKey(key);
            }}
          >
            {activeTabKey === "record" && (
              <>
                <CalendarChart />
              </>
            )}
            {activeTabKey === "updateUserMsg" && (
              <ProTable
                type="form"
                columns={editColumns}
                form={{
                  initialValues: user,
                }}
                onSubmit={async (values) => {
                  const success = await handleUpdateMy(
                    values as API.UserUpdateMyRequest,
                  );
                  if (success) {
                    setEditVisible(false);
                    // 这里可以添加刷新用户数据的逻辑
                  }
                }}
              />
            )}
            {activeTabKey === "userMsg" && <>暂无</>}
          </Card>
        </Col>
      </Row>

      {/*编辑个人信息弹窗*/}
      <Modal
        destroyOnClose
        title={"编辑资料"}
        open={editVisible}
        footer={null}
        onCancel={() => setEditVisible(false)}
      >
        <ProTable
          type="form"
          columns={editColumns}
          form={{
            initialValues: user,
          }}
          onSubmit={async (values) => {
            const success = await handleUpdateMy(
              values as API.UserUpdateMyRequest,
            );
            if (success) {
              setEditVisible(false);
              // 这里可以添加刷新用户数据的逻辑
            }
          }}
        />
      </Modal>

      {/*更新头像弹窗*/}
      <UpdateUserAvatarModal
        visible={updateAvatarVisible}
        onCancel={() => setUpdateAvatarVisible(false)}
        onSubmit={(updatedUser) => {
          dispatch(setUserLogin({ ...user, ...updatedUser }));
          setUpdateAvatarVisible(false);
        }}
        oldData={user}
      />
    </div>
  );
}
