package com.rich.richInterview.model;

/**
 * 函数式接口：支持抛出受检异常的Supplier。
 * 便于使用lambda或匿名内部类传入任意执行逻辑（含受检异常）。
 *
 * @author DuRuiChi
 * @since 2025-11-02
 */
@FunctionalInterface
public interface ThrowingSupplier<T> {
    T get() throws Exception;
}