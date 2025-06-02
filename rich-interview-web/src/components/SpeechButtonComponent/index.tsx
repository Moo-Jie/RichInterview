"use client";
import { App, Button } from "antd";
import { SoundOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";

interface Props {
  text: string;
  className?: string;
}

/**
 * 语音合成按钮
 * 文档：https://www.cnblogs.com/carver/articles/16890225.html
 * @param text
 * @param className
 * @constructor
 */
const SpeechButton = ({ text, className }: Props) => {
  // isSpeaking 按钮是否正在朗读的状态
  const [isSpeaking, setIsSpeaking] = useState(false);
  // 从 SpeechSynthesis、SpeechSynthesisUtterance 中获取 synth、utterance 状态，用于语音合成
  // synth 是 SpeechSynthesis 对象，用于朗读状态的初始化以及后续控制
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  // utterance 是 SpeechSynthesisUtterance 对象，用于相关设置，如设置要朗读的文本、语速等
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null,
  );
  const { message } = App.useApp();

  /**
   * 初始化语音合成器，在客户端渲染时执行，监听 text 变化
   * 文档：https://www.cnblogs.com/carver/articles/16890225.html
   */
  useEffect(() => {
    // 检查浏览器是否支持语音合成
    // window.speechSynthesis 是浏览器的一个内置对象，用于控制语音合成。
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // 创建一个 SpeechSynthesis 对象，并将其存储在 synth 状态中。
      const synth = window.speechSynthesis;

      // 设置 synth 状态。
      setSynth(synth);

      /**
       *  初始化语音包
       */
      const loadVoices = () => {
        // 获取浏览器支持的语音包
        const voices = synth.getVoices();
        // 查找中文语音包，优先使用 Google 中文语音包，其次使用其他中文语音包，还不行使用第一个语音包
        const chineseVoice =
          voices.find((v) => v.lang === "zh-CN" && v.name.includes("Google")) ||
          voices.find((v) => v.lang.startsWith("zh")) ||
          voices[0];

        // 文本停顿处理，将文本中的标点符号替换为逗号
        const processedText = text.replace(
          // TODO 待补充
          /([_#。&|`'—！~？…；*/、-])/g,
          "$1，",
        );

        // 创建一个用于设置语音合成器的参数,并设置要朗读的文本
        const u = new SpeechSynthesisUtterance(processedText);

        // 设置中文语音、语速、音量等参数
        if (chineseVoice) {
          u.voice = chineseVoice;
          u.lang = "zh-CN";
          u.rate = 0.9;
          u.pitch = 1.1;
          u.volume = 1;
        }

        // 播放结束的回调函数，自动更新状态为未朗读
        u.onend = () => {
          setIsSpeaking(false);
        };

        // 应用参数
        setUtterance(u);
      };

      // 开始监听配置变更，获取语音包
      synth.onvoiceschanged = loadVoices;
      // 如果语音包已经加载，则直接调用 loadVoices 函数，获取语音包
      loadVoices();

      // 取消朗读
      return () => {
        // 取消朗读
        synth.cancel();
        // 移除监听
        synth.onvoiceschanged = null;
      };
    }
  }, [text]);

  /**
   * 切换朗读状态的函数
   * 文档：https://www.cnblogs.com/carver/articles/16890225.html
   */
  const toggleSpeech = () => {
    // 检查 synth 和 utterance 是否存在
    if (!synth || !utterance) {
      message.error("组件初始化失败，当前浏览器版本不支持文本朗读");
      return;
    }

    // 区分未朗读、暂停朗读、正在朗读三种状态
    if (isSpeaking) {
      // 如果正在朗读，则暂停朗读
      synth.pause();
    } else {
      // 如果不在朗读，开始朗读
      if (synth.paused) {
        // 如果暂停朗读，则恢复朗读
        synth.resume();
      } else {
        // 如果正在朗读，则停止朗读
        synth.speak(utterance);
      }
    }
    // 切换朗读状态
    setIsSpeaking(!isSpeaking);
  };

  return (
    <Button
      icon={<SoundOutlined />}
      // 调用 toggleSpeech 函数，切换朗读状态
      onClick={toggleSpeech}
      className={className}
      disabled={!synth}
      type={isSpeaking ? "primary" : "default"}
    >
      {isSpeaking ? "停止朗读" : "朗读内容"}
    </Button>
  );
};

export default SpeechButton;
