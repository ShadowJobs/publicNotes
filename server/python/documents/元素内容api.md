# 元素的 textContent、innerText、children 和 innerHTML 的区别

这四个属性/方法都与 DOM 元素的内容相关，但它们有一些重要的区别。

## 1. textContent

`textContent` 属性获取或设置节点及其后代的文本内容。

特点：
- 返回所有元素的文本内容，包括 `<script>` 和 `<style>` 元素。
- 不会解析 HTML 标签。
- 会返回隐藏元素的文本。

```javascript
// HTML: <div id="example">这是<span style="display:none;">隐藏的</span>文本</div>

let element = document.getElementById('example');
console.log(element.textContent); // 输出: "这是隐藏的文本"
```

## 2. innerText

`innerText` 属性获取或设置元素中呈现的文本内容。

特点：
- 只返回可见元素的文本内容。
- 会考虑 CSS 样式，例如不会返回 `display: none` 元素的内容。
- 在获取值时会触发重排（reflow），可能影响性能。

```javascript
// HTML: <div id="example">这是<span style="display:none;">隐藏的</span>文本</div>

let element = document.getElementById('example');
console.log(element.innerText); // 输出: "这是文本"
```

## 3. children

`children` 是一个只读属性，返回一个 HTMLCollection，其中包含所有的子元素。

特点：
- 只返回元素节点，不包括文本节点和注释节点。
- 返回的是一个类数组对象，可以通过索引访问子元素。

```javascript
// HTML: <div id="parent"><p>段落1</p><span>段落2</span></div>

let parent = document.getElementById('parent');
console.log(parent.children.length); // 输出: 2
console.log(parent.children[0].tagName); // 输出: "P"
console.log(parent.children[1].tagName); // 输出: "SPAN"
```

## 4. innerHTML

`innerHTML` 属性获取或设置元素内的 HTML 或 XML 标记。

特点：
- 返回元素的 HTML 内容，包括所有的标签。
- 可以用来插入或修改 HTML 内容。
- 使用时要注意潜在的安全风险，如 XSS 攻击。

```javascript
// HTML: <div id="example"><p>这是<strong>加粗的</strong>文本</p></div>

let element = document.getElementById('example');
console.log(element.innerHTML); // 输出: "<p>这是<strong>加粗的</strong>文本</p>"

// 修改innerHTML
element.innerHTML = "<span>新的内容</span>";
```

## 总结

- `textContent`: 返回所有文本内容，不解析 HTML。
- `innerText`: 返回可见的文本内容，考虑 CSS 样式。
- `children`: 返回子元素节点的集合。
- `innerHTML`: 返回或设置 HTML 内容，包括标签。

选择使用哪一个取决于具体需求。例如，如果只需要纯文本内容，使用 `textContent` 通常是最佳选择；如果需要操作 HTML，则可以使用 `innerHTML`，但要注意安全问题。
# DOM 元素获取文本内容的其他方法

除了 `textContent`、`innerText`、`children` 和 `innerHTML`，还有一些其他的属性和方法可以用来获取标签里的文字。

## 1. outerText

`outerText` 是一个非标准的属性，行为类似于 `innerText`，但包括元素本身。

```javascript
// HTML: <div id="example">Hello <span>World</span></div>

let element = document.getElementById('example');
console.log(element.outerText); // 输出: "Hello World"

// 设置 outerText 会替换整个元素
element.outerText = "New Text";
// 现在 HTML 变成: New Text (div 元素被完全替换)
```

## 2. outerHTML

`outerHTML` 属性获取描述元素（包括其后代）的序列化 HTML 片段。它也可以设置为用节点替换元素。

```javascript
// HTML: <div id="example">Hello <span>World</span></div>

let element = document.getElementById('example');
console.log(element.outerHTML); // 输出: "<div id="example">Hello <span>World</span></div>"
```

## 3. firstChild.nodeValue

对于只包含文本的元素，可以使用 `firstChild.nodeValue` 来获取文本内容。

```javascript
// HTML: <p id="example">Simple text</p>

let element = document.getElementById('example');
console.log(element.firstChild.nodeValue); // 输出: "Simple text"
```

## 4. childNodes

`childNodes` 属性返回一个包含所有子节点的 NodeList，包括文本节点、注释节点等。

```javascript
// HTML: <div id="example">Text <span>More</span> <!-- comment --></div>

let element = document.getElementById('example');
element.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
        console.log(node.nodeValue.trim());
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        console.log(node.textContent);
    }
});
// 输出:
// "Text"
// "More"
```

## 5. data 属性（用于文本节点）

对于文本节点，可以直接使用 `data` 属性获取其内容。

```javascript
// HTML: <p id="example">Hello World</p>

let element = document.getElementById('example');
console.log(element.firstChild.data); // 输出: "Hello World"
```

## 6. wholeText（用于文本节点）

`wholeText` 属性返回包含此文本节点在内的所有同级文本节点的内容。

```javascript
// HTML: <p id="example">Hello <!-- comment --> World</p>

let element = document.getElementById('example');
console.log(element.firstChild.wholeText); // 输出: "Hello  World"
```

## 7. textTracks（用于媒体元素）

对于 `<video>` 和 `<audio>` 元素，`textTracks` 属性可以用来获取文本轨道（如字幕）的内容。

```javascript
// HTML: <video id="myVideo"><track kind="subtitles" src="subs.vtt"></video>

let video = document.getElementById('myVideo');
video.textTracks[0].mode = 'showing';
// 可以通过 video.textTracks[0].cues 访问字幕内容
```

## 总结

这些额外的属性和方法提供了更多灵活性，可以根据具体需求选择最适合的方法：

1. `outerText`: 类似 `innerText`，但包括元素本身。
2. `outerHTML`: 包括元素本身的 HTML 字符串。
3. `firstChild.nodeValue`: 适用于只包含文本的元素。
4. `childNodes`: 访问所有类型的子节点。
5. `data`: 直接访问文本节点的内容。
6. `wholeText`: 获取相邻文本节点的组合内容。
7. `textTracks`: 用于媒体元素的文本轨道。

# DOM 元素内容的读写操作

这些属性中有些是只读的，有些是可读写的。

## 1. 可读写属性

### 1.1 textContent

- 可读写
- 读取：获取所有文本内容，包括隐藏元素
- 写入：替换所有子节点为一个单一的文本节点

```javascript
let element = document.getElementById('example');
console.log(element.textContent); // 读取内容
element.textContent = '新的文本内容'; // 写入内容
```

### 1.2 innerText

- 可读写
- 读取：获取可见的文本内容
- 写入：替换所有子节点为一个单一的文本节点

```javascript
let element = document.getElementById('example');
console.log(element.innerText); // 读取内容
element.innerText = '新的可见文本'; // 写入内容
```

### 1.3 innerHTML

- 可读写
- 读取：获取元素的HTML内容
- 写入：解析字符串为HTML并替换元素的内容

```javascript
let element = document.getElementById('example');
console.log(element.innerHTML); // 读取HTML内容
element.innerHTML = '<span>新的HTML内容</span>'; // 写入HTML内容
```

### 1.4 outerHTML

- 可读写
- 读取：获取包括元素自身在内的HTML
- 写入：替换整个元素

```javascript
let element = document.getElementById('example');
console.log(element.outerHTML); // 读取包括元素自身的HTML
element.outerHTML = '<div id="newExample">完全新的元素</div>'; // 替换整个元素
```

## 2. 只读属性

### 2.1 children

- 只读
- 无法直接写入，但可以通过其他方法修改子元素

```javascript
let parent = document.getElementById('parent');
console.log(parent.children); // 读取子元素

// 修改子元素
parent.innerHTML = ''; // 清空所有子元素
parent.appendChild(document.createElement('div')); // 添加新的子元素
```

### 2.2 childNodes

- 只读
- 无法直接写入，但可以通过其他方法修改子节点

```javascript
let element = document.getElementById('example');
console.log(element.childNodes); // 读取所有子节点

// 修改子节点
while (element.firstChild) {
    element.removeChild(element.firstChild);
}
element.appendChild(document.createTextNode('新文本')); // 添加新的文本节点
```

## 3. 文本节点的修改

### 3.1 nodeValue 和 data

- 可读写
- 用于直接修改文本节点的内容

```javascript
let element = document.getElementById('example');
let textNode = element.firstChild;
console.log(textNode.nodeValue); // 读取文本内容
textNode.nodeValue = '新的文本内容'; // 修改文本内容

// 或者使用 data 属性
console.log(textNode.data); // 读取文本内容
textNode.data = '使用 data 修改的新内容'; // 修改文本内容
```

## 4. 更复杂的操作

对于更复杂的DOM操作，可能需要结合使用多种方法：

```javascript
function updateContent(elementId, newContent) {
    let element = document.getElementById(elementId);
    
    // 清空现有内容
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    
    // 添加新内容
    if (typeof newContent === 'string') {
        // 如果是字符串，直接设置为文本内容
        element.textContent = newContent;
    } else if (newContent instanceof Node) {
        // 如果是 Node 对象，直接添加
        element.appendChild(newContent);
    } else if (Array.isArray(newContent)) {
        // 如果是数组，假设数组中每个元素都是 Node 对象
        newContent.forEach(node => element.appendChild(node));
    }
}

// 使用示例
updateContent('example', '简单的文本内容');
updateContent('example', document.createElement('div'));
updateContent('example', [
    document.createTextNode('文本节点'),
    document.createElement('br'),
    document.createTextNode('另一个文本节点')
]);
```

## 总结

1. `textContent`, `innerText`, `innerHTML`, `outerHTML` 是可读写的。
2. `children`, `childNodes` 是只读的，但可以通过其他方法修改子元素。
3. 文本节点可以通过 `nodeValue` 或 `data` 属性直接修改。
4. 对于复杂的DOM操作，可能需要结合使用多种方法，如 `removeChild`, `appendChild` 等。

使用 `innerHTML` 可能比逐个创建和添加节点更快，但在处理用户输入时可能存在安全风险。始终记得在处理用户输入时进行适当的清理和转义，以防止XSS攻击。