import React, { useState } from "react";
import Avatar from "react-avatar";
import { Menu, Layout, Button } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined, SettingOutlined, UserSwitchOutlined } from "@ant-design/icons";
import to from "await-to-js";
import useBaseHook from "@src/hooks/BaseHook";
import auth from "@src/helpers/auth";
import ChangePassword from "@src/components/GeneralComponents/ChangePassword";
import { confirmDialog } from "@src/helpers/dialogs";
import authService from "@root/src/services/authService";

const { Header } = Layout;

const AdminHeader = (props: any) => {
  const { t, notify, redirect, getData, router } = useBaseHook();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const renderMenuItem = () => {
    const firstName = getData(auth(), "user.name", "User");
    const username = getData(auth(), "user.username", "User");

    return [
      {
        key: "username",
        label: <>
          <span className="crop-name">
            {t("common:hi", { username: firstName })}
          </span>
          <Avatar
            style={{ marginLeft: 8 }}
            size="32"
            name={firstName}
            round={true}
          />
        </>,
        children: [
          {
            key: "change-password",
            label: <Button
              onClick={() => {
                setShowChangePassword(true);
              }}
              type="link"
            >
              {t("buttons:changePassword")}
            </Button>,
            icon: <SettingOutlined />
          },
          {
            key: "signout",
            label: <Button
              type="link"
              onClick={() => {
                confirmDialog({
                  onOk: () => {
                    authService().withAuth().logout({ username });
                    redirect("frontend.admin.login");
                  },
                  title: t("buttons:signout"),
                  content: t("messages:message.signoutConfirm"),
                  okText: "Đồng ý",
                  cancelText: "Hủy",
                });
              }}
            >
              {t("buttons:signout")}
            </Button>,
            icon: <UserSwitchOutlined />
          }
        ]
      }
    ]
  }

  const renderRightContent = () => {
    return (
      <Menu key="user" mode="horizontal" items={renderMenuItem()}>
      </Menu>
    );
  };

  const onChangePassword = async (data: any): Promise<void> => {
    setShowChangePassword(false);
    let password = data.password;

    let [error, result]: [any, any] = await to(
      authService().withAuth().changePassword({ password })
    );

    if (error) return notify(t(`errors:${error.code}`), "", "error");
    notify(t("messages:message.recordUpdated"));

    return result;
  };

  const renderPasswordDialog = () => {
    return (
      <ChangePassword
        onChangePassword={onChangePassword}
        visible={showChangePassword}
        onCancel={() => {
          setShowChangePassword(false);
        }}
      />
    );
  };

  const { collapsed, onCollapseChange } = props;
  const menuIconProps = {
    className: "trigger",
    onClick: () => onCollapseChange(!collapsed),
  };

  let headerClass = "header";
  if (collapsed) headerClass += " collapsed";

  return (
    <React.Fragment>
      <Header className={headerClass}>
        {collapsed ? (
          <MenuUnfoldOutlined {...menuIconProps} />
        ) : (
          <MenuFoldOutlined {...menuIconProps} />
        )}
        <div className="right-container">{renderRightContent()}</div>
      </Header>
      {renderPasswordDialog()}
    </React.Fragment>
  );
};

export default AdminHeader;
