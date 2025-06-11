package com.rich.richInterview.model.enums;

import lombok.Getter;

/**
 * 模拟面试状态枚举
 * 对应数据库表字段：status int DEFAULT 0 NOT NULL COMMENT '状态（0-待开始、1-进行中、2-已结束）'
 */
@Getter
public enum MockInterviewStatusEnum {
    WAITING(0, "待开始"),
    IN_PROGRESS(1, "进行中"),
    FINISHED(2, "已结束");

    /**
     *  状态代码
     *
     * @return 状态代码（int）
     */
    private final int code;

    /**
     *  状态名称
     *
     * @return 状态名称（String）
     */
    private final String name;

    /**
     * 私有构造函数，确保枚举实例的不可变性
     *
     * @param code 状态代码（int 类型）
     * @param name 状态名称（String 类型）
     */
    private MockInterviewStatusEnum(int code, String name) {
        this.code = code;
        this.name = name;
    }

    /**
     * 根据状态代码获取枚举实例
     *
     * @param code 状态代码（int）
     * @return 对应的枚举实例
     * @throws IllegalArgumentException 如果代码无效
     */
    public static MockInterviewStatusEnum fromCode(int code) {
        for (MockInterviewStatusEnum status : values()) {
            if (status.code == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("模拟面试状态码无效: " + code);
    }
}