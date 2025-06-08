package com.rich.richInterview.model.dto.user;

import lombok.Data;

import java.io.Serializable;

/**
 * 用户更新个人信息请求
 *
 */
@Data
public class UserUpdateMyRequest implements Serializable {

    /**
     * 用户昵称
     */
    private String userName;

    /**
     * 用户头像
     */
    private String userAvatar;

    /**
     * 简介
     */
    private String userProfile;

    /**
     * 密码
     */
    private String userPassword;

    /**
     * 检查密码
     */
    private String checkPassword;

    /**
     * 手机号
     */
    private String phoneNumber;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 年级
     */
    private String grade;

    /**
     * 工作经验
     */
    private String workExperience;

    /**
     * 擅长方向
     */
    private String expertiseDirection;

    /**
     * 最近刷题ID
     */
    private Long previousQuestionID;

    private static final long serialVersionUID = 1L;
}