import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {DEFAULT_USER} from "@/constant/ConstantUserMsg";

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
