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
  // 初始化语音合成器，在客户端渲染时执行，监听 text 变化
  // 文档：https://www.cnblogs.com/carver/articles/16890225.html
  useEffect(() => {
    // 检查浏览器是否支持语音合成
    // window.speechSynthesis 是浏览器的一个内置对象，用于控制语音合成。
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // 创建一个 SpeechSynthesis 对象，并将其存储在 synth 状态中。
      const synth = window.speechSynthesis;
      // 设置 synth 状态。
      setSynth(synth);
      // 获取所有的语音包
      const voices = synth.getVoices();
      // 查找中文语音
      const chineseVoice = voices.find((v) => v.lang === "zh-CN") || voices[0];
      // 初始化一个参数，设置要朗读的文本
      const u = new SpeechSynthesisUtterance(text);
      // 设置中文语音
      if (chineseVoice) {
        u.voice = chineseVoice;
        u.lang = "zh-CN";
      }
      // 设置语速
      u.rate = 1;
      // 应用参数，将其存储在 utterance 状态中。
      setUtterance(u);
      // 结束合成
      return () => {
        synth.cancel();
      };
    }
  }, [text]);

  // 切换朗读状态的函数
  // 文档：https://www.cnblogs.com/carver/articles/16890225.html
  const toggleSpeech = () => {
    // 检查 synth 和 utterance 是否存在
    if (!synth || !utterance) {
      message.error("当前浏览器版本不支持文本朗读");
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
    >
      {isSpeaking ? "停止朗读" : "朗读内容"}
    </Button>
  );
};

export default SpeechButton;
