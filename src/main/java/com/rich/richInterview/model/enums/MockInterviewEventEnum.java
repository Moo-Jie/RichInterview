package com.rich.richInterview.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 模拟面试事件类型枚举
 * <p>
 * 对应 MockInterviewEventRequest 中的 event 字段
 */
public enum MockInterviewEventEnum {
    START("start"),
    CHAT("chat"),
    END("end");

    private final String eventValue;

    MockInterviewEventEnum(String eventValue) {
        this.eventValue = eventValue;
    }

    /**
     * 获取枚举对应的字符串值（用于JSON序列化）
     *
     * @return 事件类型字符串
     */
    @JsonValue
    public String getEventValue() {
        return eventValue;
    }

    /**
     * JSON反序列化方法（将字符串转换为枚举类型）
     *
     * @param value 字符串值
     * @return 对应的枚举实例
     * @throws IllegalArgumentException 如果传入无效值
     */
    @JsonCreator
    public static MockInterviewEventEnum fromEventValue(String value) {
        for (MockInterviewEventEnum type : values()) {
            if (type.eventValue.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("无效的事件类型: " + value);
    }

    /**
     * 检查事件类型是否需要消息内容
     *
     * @return 是否需要message字段
     */
    public boolean requiresMessage() {
        return this == CHAT;
    }
}