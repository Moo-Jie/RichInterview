package com.rich.richInterview.constant;

import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.exception.BusinessException;

/**
 * 增量字段枚举类
 * @author DuRuiChi
 * @create 2025/5/22
 **/
public enum IncrementField {
    VIEW_NUM("viewNum"),
    STAR_NUM("starNum"),
    FORWARD_NUM("forwardNum"),
    COLLECT_NUM("collectNum"),
    COMMENT_NUM("commentNum");

    private final String fieldName;

    IncrementField(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getFieldName() {
        return fieldName;
    }

    /**
     * 添加根据字段名获取枚举
     * @param fieldName
     * @return com.rich.richInterview.constant.IncrementField
     * @author DuRuiChi
     * @create 2025/5/22
     **/
    public static IncrementField fromFieldName(String fieldName) {
        for (IncrementField value : values()) {
            if (value.fieldName.equals(fieldName)) {
                return value;
            }
        }
        throw new BusinessException(ErrorCode.PARAMS_ERROR, "无效的字段类型: " + fieldName);
    }

    /**
     * 验证字段名是否合法
     * @param fieldName
     * @return void
     * @author DuRuiChi
     * @create 2025/5/25
     **/
    public static void validateField(String fieldName) {
        for (IncrementField value : values()) {
            if (value.fieldName.equals(fieldName)) {
                return;
            }
        }
        throw new BusinessException(ErrorCode.PARAMS_ERROR, "非法的递增字段类型");
    }
}