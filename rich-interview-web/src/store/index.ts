import {configureStore} from "@reduxjs/toolkit";
import userLogin from "@/store/userLogin";

/**
 * 全局状态加载
 */
const store = configureStore({
  reducer: {
    // TODO 待添加状态切片
    userLogin,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
