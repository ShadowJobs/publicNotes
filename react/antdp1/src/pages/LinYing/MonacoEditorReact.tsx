import { useEffect, useRef, useState } from 'react';
import { Card } from 'antd';
import MonacoEditor from 'react-monaco-editor';
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import * as monaco from 'monaco-editor';
import { logLanguage, logTheme } from './monaco-theme';
const options = {
  acceptSuggestionOnCommitCharacter: true, // 是否在输入某些特定字符（例如 . 或 )）时自动接受建议
  acceptSuggestionOnEnter: "on", // 是否在按下 enter 键时自动接受建议。"on"代表始终自动接受建议；"smart"代表只在建议列表中仅有一个建议且该建议可以接受时才自动接受；"off"代表不会自动接受建议。
  accessibilitySupport: "auto", // 定义编辑器的辅助功能支持级别。"auto"代表根据操作系统和设置自动启用或禁用；"off"代表完全禁用辅助功能；"on"代表完全启用辅助功能。
  autoIndent: false, // 是否在输入新行时自动缩进
  automaticLayout: true, // 在编辑器尺寸发生变化时是否自动调整布局
  codeLens: true, // 是否启用代码镜头（Code Lens）
  colorDecorators: true, // 是否启用颜色装饰器
  contextmenu: true, // 是否启用编辑器的上下文菜单
  cursorBlinking: "blink", // 光标闪烁的样式。"blink"代表使用闪烁光标；"smooth"代表使用平滑移动光标；"phase"代表使用相位移动光标；"expand"代表使用扩展光标；"solid"代表使用实心光标。
  cursorSmoothCaretAnimation: false, // 是否启用平滑的光标动画
  cursorStyle: "line", // 光标的样式。"line"代表竖线光标；"block"代表块光标；"underline"代表下划线光标。
  disableLayerHinting: false, // 是否禁用层提示
  disableMonospaceOptimizations: false, // 是否禁用单空格字符的优化
  dragAndDrop: true, // 是否启用拖放操作
  fixedOverflowWidgets: false, // 固定在编辑器的顶部和底部的小部件是否影响编辑器的布局
  folding: true, // 是否启用代码折叠
  foldingStrategy: "auto", // 代码折叠策略。"auto"代表使用自动折叠策略；"indentation"代表根据缩进级别折叠代码块。
  fontLigatures: false, // 是否启用等宽字体连字
  formatOnPaste: true, // 是否在粘贴操作时自动格式化代码
  formatOnType: false, // 是否在输入时自动格式化代码
  hideCursorInOverviewRuler: false, // 在概览标尺中是否隐藏光标
  highlightActiveIndentGuide: true, // 是否突出显示活动缩进指南
  links: true, // 是否启用链接
  mouseWheelZoom: false, // 是否启用鼠标滚轮缩放功能
  multiCursorMergeOverlapping: true, // 是否将重叠的多光标合并为一个
  multiCursorModifier: "alt", // 启用多光标时要使用的修饰符键。"alt"代表使用 alt 键；"ctrlCmd"代表使用 ctrl / cmd 键。
  overviewRulerBorder: true, // 在概览标尺周围是否绘制边框
  overviewRulerLanes: 2, // 概览标尺中的轨道数
  quickSuggestions: true, // 是否启用快速建议
  quickSuggestionsDelay: 100, // 显示快速建议之前的延迟时间（以毫秒为单位）
  readOnly: false, // 是否将编辑器设置为只读模式
  renderControlCharacters: false, // 是否呈现控制字符
  renderFinalNewline: true, // 是否呈现文件末尾的换行符
  renderIndentGuides: true, // 是否呈现缩进指南
  renderLineHighlight: "all", // 高亮当前行的方式。"all"代表高亮整行；"line"代表只高亮文本；"none"代表不高亮。
  renderWhitespace: "all", // 呈现空格和制表符的方式。"none"代表不呈现；"boundary"代表只呈现单词间的空格；"selection"代表呈现选定内容周围的空格；"trailing"代表呈现每行末尾的空格。
  revealHorizontalRightPadding: 30, // 横向滚动条右侧的填充量
  roundedSelection: true, // 是否将选择区域的边角变为圆角
  rulers: [], // 在编辑器中绘制的垂直参考线的列数
  scrollBeyondLastColumn: 5, // 当横向滚动到最后一列时，额外滚动的列数
  scrollBeyondLastLine: false, // 在滚动时是否允许超过最后一行
  selectOnLineNumbers: true, // 是否启用通过单击行号选择整行的功能
  selectionClipboard: true, // 是否将选择内容添加到剪贴板
  selectionHighlight: true, // 是否突出显示与选定内容相同的其他内容
  showFoldingControls: "mouseover", // 折叠控件何时可见。"always"代表始终可见；"mouseover"代表鼠标悬停在编辑器上时可见；"none"代表不可见。
  smoothScrolling: false, // 是否启用平滑滚动
  suggestOnTriggerCharacters: true, // 是否在输入触发字符时自动显示建议
  wordBasedSuggestions: true, // 是否基于单词内容提供建议
  wordWrap: "off", // 控制文本如何包装。"off"代表不换行；"on"代表根据视口宽度换行；"wordWrapColumn"代表在指定列数处换行；"bounded"代表在视口宽度和最大线长度之间进行包装。
  wordSeparators: "~!@#$%^&*()-=+[{]}|;:'\",.<>/?", // 定义哪些字符被认为是单词分隔符
  wordWrapBreakAfterCharacters: "\t})]?|&,;", // 定义单词包装时允许中断的字符
  wordWrapBreakBeforeCharacters: "{([+", // 定义单词包装时允许在其前面中断的字符
  wordWrapBreakObtrusiveCharacters: ".", // 定义单词包装时允许中断的显式断点字符
  wordWrapColumn: 80, // 在指定列数处换行
  wordWrapMinified: true, // 是否在最小化的文件中自动启用单词包装
  wrappingIndent: "none", // 换行后要缩进的空格数。"none"代表不进行缩进；"same"代表使用与当前行相同的缩进；"indent"代表使用比当前行多一个缩进级别的缩进。

};
export const LogCard = ({ curLog }) => {
  const [monacoInited, setMonacoInited] = useState(false);
  const editorRef = useRef(null);
  useEffect(() => {
    // Register the custom language
    monaco.languages.register({ id: 'log' });
    monaco.languages.setMonarchTokensProvider('log', logLanguage);
    // https://microsoft.github.io/monaco-editor/docs.html#functions/editor.defineTheme.html
    // 参数文档
    monaco.editor.defineTheme('logTheme', logTheme);
    setMonacoInited(true);
    const updateEditorLayout = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };
    window.addEventListener('resize', updateEditorLayout);
    return () => {
      window.removeEventListener('resize', updateEditorLayout);
      // monaco.editor.setTheme("vs") //还原，同一页面多个monaco的时候，不还原会污染
    };
  }, []);
  return <Card style={{ backgroundColor: '#454545', color: '#27aa5e', whiteSpace: 'pre-wrap' }}
    bodyStyle={{ maxHeight: '75vh', overflow: 'scroll' }}
  >
    {monacoInited && <MonacoEditor
      height={550}
      language="log"
      theme="logTheme"
      editorDidMount={(editor) => {
        editorRef.current = editor;
      }}
      options={{
        selectOnLineNumbers: true, readOnly: true,
        // 横向滚动条设置1：通过换行保证内容不会超出编辑器，从而省略横向滚动条
        wordWrap: 'on',           // 打开自动换行
        scrollBeyondLastLine: false, // 防止滚动超过最后一行
        horizontalScrollbarSize: 0   // 将横向滚动条的大小设置为0，从而隐藏它
        // 横向滚动条设置2：强制显示滚动条：  
        // scrollbar: { horizontal: "visible" }
      }}
      value={(curLog)}
    />}
  </Card>
}

{/* 仅禁用Y轴滚动，保留x轴滚动
  <MonacoEditor
  value={JSON.stringify(data, null, 2)}
  height="100%"
  width="100%"
  language="json"
  theme="vs"
  options={{
    selectOnLineNumbers: true,
    minimap: { enabled: false },
    readOnly: true,
    automaticLayout: true,
    scrollbar: {
      vertical: 'hidden',       // 隐藏垂直滚动条
      verticalScrollbarSize: 0, // 将垂直滚动条大小设为0
      alwaysConsumeMouseWheel: false // 允许父容器处理溢出的鼠标滚轮事件
    },
    scrollBeyondLastLine: false, // 防止滚动超过最后一行
  }}
  editorDidMount={(editor) => {
    // 原有的editorDidMount逻辑
    if (handleEditorDidMount) {
      handleEditorDidMount(editor);
    }

    // 添加自定义滚动处理
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener('wheel', (event) => {
        // 如果是垂直滚动，阻止默认行为
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          event.preventDefault();
        }
      }, { passive: false });
    }
  }}
/> */}