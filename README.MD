# iview tree table

对 iview UI 组件的 Tree 扩展

### Installation

```
npm install iview-tree-table --save
```

```
import TreeTable from 'iview-tree-table'

export default {
    name: 'example',
    components: {
        TreeTable
    }
}

<tree-table :data="data" :columns="columns" show-checkbox border>
</tree-table>
```

## API

### Table Attributes

| 属性          | 说明                                          | 类型     | 参数 | 默认值     |
| ------------- | --------------------------------------------- | -------- | ---- | ---------- |
| data          | 表格各行的数据                                | Array    | -    | []         |
| columns       | 表格各列的配置（具体见下文：Columns Configs） | Array    | -    | []         |
| border        | 是否显示 边框                                 | Boolean  | -    | false      |
| bottom-line   | 是否显示 每行的底线                           | Boolean  | -    | false      |
| show-checkbox | 是否显示多选框                                | Boolean  | -    | false      |
| empty-text    | 表格数据为空时显示的文字                      | String   | -    | '暂无数据' |
| children-key  | 定义子节点键                                  | String   | -    | 'children' |
| load-data     | 异步加载数据的方法                            | Function | -    | -          |
| show-header   | 是否显示表头                                  | Boolean  | -    | false      |

### Columns Configs

| 属性      | 说明                                                            | 类型     | 默认值 |
| --------- | --------------------------------------------------------------- | -------- | ------ |
| title     | 列标题名称                                                      | String   | ''     |
| key       | 对应列内容的属性名                                              | String   | ''     |
| style     | 对应列标题的样式                                                | Object   | -      |
| className | 对应列标题的样式名称                                            | String   | ''     |
| width     | 列宽度                                                          | Number   | -      |
| minWidth  | 列最小宽度                                                      | Number   | -      |
| maxWidth  | 列最大宽度                                                      | Number   | -      |
| template  | 自定义列模板，作用域插槽（它可以获取到 data, node, column）名称 | String   | ''     |
| render    | 自定义渲染 render(h, {data, node, column})                      | Function | -      |

### Table Events

| 事件名           | 说明                   | 参数                 |
| ---------------- | ---------------------- | -------------------- |
| on-check-change  | 点击复选框时触发       | 当前已勾选节点的数组 |
| on-toggle-expand | 展开和收起子列表时触发 | 当前节点的数据       |

### Table Methods

| 方法名          | 说明             | 参数                                      |
| --------------- | ---------------- | ----------------------------------------- |
| getCheckedNodes | 获取被勾选的节点 | 是否获取不定状态 indeterminate 默认 false |

### Data

| 属性            | 说明                                   | 类型    | 默认值 |
| --------------- | -------------------------------------- | ------- | ------ |
| expand          | 是否展开直子节点                       | Boolean | false  |
| disabled        | 禁掉响应                               | Boolean | false  |
| disableCheckbox | 禁掉 checkbox                          | Boolean | false  |
| checked         | 是否勾选(如果勾选，子节点也会全部勾选) | Boolean | false  |
