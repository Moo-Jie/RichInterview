import { UserVO } from "./api/user";

const events = {};

export const EventBus = {
  on(event: string, callback: { (userInfo: any): void; (userVO: any): void; (): void; }) {
    if (!events[event]) events[event] = [];
    events[event].push(callback);
  },

  off(event: string, callback: { (userVO: any): void; (): void; }) {
    if (!events[event]) return;
    events[event] = events[event].filter((cb: any) => cb !== callback);
  },

  emit(event: string, data: UserVO | null) {
    if (!events[event]) return;
    events[event].forEach((callback: (arg0: any) => any) => callback(data));
  }
};
