import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import AccessEnumeration from "@/access/accessEnumeration";

/**
 * 初始化登录用户信息
 */
const DEFAULT_USER: API.LoginUserVO = {
  userName: "游客",
  userProfile: "暂无",
  userAvatar: "/assets/pictures/userNotLogin.png",
  userRole: AccessEnumeration.NOT_LOGIN,
};

/**
 * 登录用户全局状态切片
 */
export const userLoginSlice = createSlice({
  name: "userLogin",
  initialState: DEFAULT_USER,
  reducers: {
    setUserLogin: (state, action: PayloadAction<API.LoginUserVO>) => {
      return {
        // TODO 待更新状态
        ...action.payload,
      };
    },
  },
});

// 修改状态
export const { setUserLogin } = userLoginSlice.actions;

export default userLoginSlice.reducer;
