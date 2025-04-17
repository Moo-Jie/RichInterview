import { Editor } from "@bytemd/react";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight";
import "bytemd/dist/index.css";
import "highlight.js/styles/vs.css";
import "./MarkdownEditor.css";
// 源：https://github.com/sindresorhus/github-markdown-css  引入GITHUB MD样式
import 'github-markdown-css/github-markdown-light.css';


interface Props {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}

const plugins = [gfm(), highlight()];

/**
 * Md文件编辑器
 * 模板来源：https://github.com/bytedance/bytemd
 * @param props
 * @constructor
 */
const MarkdownEditor = (props: Props) => {
  const { value = "", onChange, placeholder } = props;

  return (
    <div className="md-editor">
      <Editor
        value={value}
        placeholder={placeholder}
        mode="split"
        plugins={plugins}
        onChange={onChange}
      />
    </div>
  );
};

export default MarkdownEditor;
