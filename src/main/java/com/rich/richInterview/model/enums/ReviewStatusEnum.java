package com.rich.richInterview.model.enums;

/**
 * 审核状态枚举
 * 对应数据库字段：reviewStatus int DEFAULT 0 NOT NULL COMMENT '状态：0-待审核, 1-通过, 2-拒绝'
 */
public enum ReviewStatusEnum {
    WAITING(0, "待审核"),
    PASS(1, "通过"),
    REJECT(2, "拒绝");

    private final int code;
    private final String desc;

    /**
     * 私有构造方法
     * @param code 状态码
     * @param desc 状态描述
     */
    private ReviewStatusEnum(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    /**
     * 获取状态码（数据库存储值）
     * @return 状态码
     */
    public int getCode() {
        return code;
    }

    /**
     * 获取状态描述
     * @return 描述文本
     */
    public String getDesc() {
        return desc;
    }

    /**
     * 通过状态码获取枚举实例
     * @param code 状态码
     * @return 对应的枚举实例
     * @throws IllegalArgumentException 如果传入无效状态码
     */
    public static ReviewStatusEnum fromCode(int code) {
        for (ReviewStatusEnum status : values()) {
            if (status.code == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("无效的审核状态码: " + code);
    }
}