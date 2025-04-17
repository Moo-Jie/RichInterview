import { Viewer } from "@bytemd/react";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight";
import "bytemd/dist/index.css";
import "highlight.js/styles/vs.css";
import "./MarkdownViewer.css";
// 源：https://github.com/sindresorhus/github-markdown-css 引入GITHUB MD样式
import 'github-markdown-css/github-markdown-light.css';


interface Props {
  value?: string;
}

const plugins = [gfm(), highlight()];

/**
 * Md浏览器
 * 模板来源：https://github.com/bytedance/bytemd
 * @param props
 * @constructor
 */
const MarkdownViewer = (props: Props) => {
  const { value = "" } = props;

  return (
    <div className="md-viewer">
      <Viewer value={value} plugins={plugins} />
    </div>
  );
};

export default MarkdownViewer;
