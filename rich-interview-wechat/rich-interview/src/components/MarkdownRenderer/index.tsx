import { Component } from 'react';
import { View } from '@tarojs/components';
import './index.scss';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface MarkdownRendererState {
  parsedContent: any;
}

export default class MarkdownRenderer extends Component<MarkdownRendererProps, MarkdownRendererState> {

  constructor(props: MarkdownRendererProps) {
    super(props);
    this.state = {
      parsedContent: null
    };
  }

  componentDidMount() {
    this.parseMarkdown();
  }

  componentDidUpdate(prevProps: MarkdownRendererProps) {
    if (prevProps.content !== this.props.content) {
      this.parseMarkdown();
    }
  }

  parseMarkdown = () => {
    const { content } = this.props;
    if (!content) return;

    try {
      // 暂时使用简单解析，避免towxml兼容性问题
      this.setState({ parsedContent: null });
    } catch (error) {
      console.error('Markdown 解析失败:', error);
      this.setState({ parsedContent: null });
    }
  };

  // 渲染简单的 Markdown
  renderSimpleMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: any[] = [];
    let i = 0;
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let inTable = false;
    let tableRows: string[] = [];

    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // 处理代码块
      if (trimmedLine.startsWith('```')) {
        if (!inCodeBlock) {
          // 开始代码块
          inCodeBlock = true;
          codeBlockContent = [];
        } else {
          // 结束代码块
          inCodeBlock = false;
          elements.push(
            <View key={`code-${i}`} className="markdown-pre">
              <View className="markdown-code">
                {codeBlockContent.join('\n')}
              </View>
            </View>
          );
          codeBlockContent = [];
        }
        i++;
        continue;
      }

      // 在代码块内
      if (inCodeBlock) {
        codeBlockContent.push(line);
        i++;
        continue;
      }

      // 处理表格
      if (trimmedLine.includes('|') && trimmedLine.split('|').length > 2) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(line);
        i++;
        continue;
      } else if (inTable) {
        // 结束表格
        inTable = false;
        elements.push(this.renderTable(tableRows, `table-${i}`));
        tableRows = [];
        // 不要跳过当前行，继续处理
      }

      // 处理多级标题 (支持 # 到 ######)
      const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        elements.push(
          <View key={i} className={`markdown-h${level}`}>
            {text}
          </View>
        );
        i++;
        continue;
      }

      // 处理列表项（支持缩进）
      if (trimmedLine.startsWith('- ') || trimmedLine.match(/^\d+\.\s/)) {
        const content = trimmedLine.replace(/^[-\d+\.]\s/, '');
        const indentLevel = (line.length - line.trimStart().length) / 2; // 假设2个空格为一级缩进
        elements.push(
          <View key={i} className="markdown-li" style={{ paddingLeft: `${20 + indentLevel * 30}rpx` }}>
            <View className="markdown-li-marker">•</View>
            <View className="markdown-li-content">{this.renderInlineMarkdown(content)}</View>
          </View>
        );
        i++;
        continue;
      }

      // 处理空行
      if (trimmedLine === '') {
        elements.push(<View key={i} className="markdown-br" />);
        i++;
        continue;
      }

      // 普通段落
      elements.push(
        <View key={i} className="markdown-p">
          {this.renderInlineMarkdown(line)}
        </View>
      );
      i++;
    }

    // 处理未结束的表格
    if (inTable && tableRows.length > 0) {
      elements.push(this.renderTable(tableRows, `table-end`));
    }

    return elements;
  };

  // 渲染行内Markdown（粗体、斜体、行内代码）
  renderInlineMarkdown = (text: string) => {
    const parts: any[] = [];
    let currentText = text;
    let key = 0;

    // 处理行内代码 `code`
    const codeRegex = /`([^`]+)`/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(currentText)) !== null) {
      // 添加代码前的文本
      if (match.index > lastIndex) {
        const beforeText = currentText.slice(lastIndex, match.index);
        parts.push(this.renderTextWithEmphasis(beforeText, key++));
      }

      // 添加行内代码
      parts.push(
        <View key={key++} className="markdown-code">
          {match[1]}
        </View>
      );

      lastIndex = match.index + match[0].length;
    }

    // 添加剩余文本
    if (lastIndex < currentText.length) {
      const remainingText = currentText.slice(lastIndex);
      parts.push(this.renderTextWithEmphasis(remainingText, key++));
    }

    return parts.length > 0 ? parts : text;
  };

  // 渲染粗体和斜体
  renderTextWithEmphasis = (text: string, baseKey: number) => {
    const parts: any[] = [];
    let key = baseKey * 1000;

    // 处理粗体 **text**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <View key={key++} className="markdown-strong">
          {match[1]}
        </View>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 1 ? parts : text;
  };

  // 渲染表格
  renderTable = (rows: string[], key: string) => {
    if (rows.length === 0) return null;

    const tableData: string[][] = [];

    rows.forEach((row) => {
      const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
      if (cells.length > 0) {
        // 检查是否是分隔行 (如 |---|---|)
        if (cells.every(cell => /^-+$/.test(cell))) {
          return;
        }
        tableData.push(cells);
      }
    });

    if (tableData.length === 0) return null;

    return (
      <View key={key} className="markdown-table">
        {tableData.map((row, rowIndex) => (
          <View key={`${key}-row-${rowIndex}`} className={`markdown-table-row ${rowIndex === 0 ? 'markdown-table-header' : ''}`}>
            {row.map((cell, cellIndex) => (
              <View key={`${key}-cell-${rowIndex}-${cellIndex}`} className="markdown-table-cell">
                {this.renderInlineMarkdown(cell)}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  render() {
    const { content, className = '' } = this.props;

    if (!content) {
      return null;
    }

    return (
      <View className={`markdown-renderer ${className}`}>
        {this.renderSimpleMarkdown(content)}
      </View>
    );
  }
}
