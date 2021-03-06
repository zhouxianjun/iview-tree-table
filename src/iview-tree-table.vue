<template>
    <div :class="[prefixCls, 'tree-table', {'tree-table-border': border, 'tree-table-no-bottom-line': bottomLine}]">
        <div :class="['header', {'header-border-bottom': border, 'header-border': !border}]" v-if="showHeader" ref="header">
            <slot name="header">
                <template v-for="(col, i) in cols">
                    <div :class="[col.className]" :style="colStyle(col)" :key="col._index">
                        <template v-if="col._index === 0 && showCheckbox">
                            <Checkbox :value="checkedAll" :indeterminate="indeterminate" @click.native.prevent="checkAll"></Checkbox>
                        </template>
                        <template v-else>
                            {{col.title}}
                            <span class="ivu-table-sort" v-if="col.sortable">
                                <i class="ivu-icon ivu-icon-md-arrow-dropup" :style="selectedStyle('asc', i)" @click="sorting('asc', col, i)"></i>
                                <i class="ivu-icon ivu-icon-md-arrow-dropdown" :style="selectedStyle('desc', i)" @click="sorting('desc', col, i)"></i>
                            </span>
                        </template>
                    </div>
                </template>
            </slot>
        </div>
        <div :style="bodyStyle">
            <tree-table-node v-for="(item, i) in stateTree" :key="i"
                             :data="item" :columns="cols.slice(1)"
                             :columns-width="columnsWidth" visible
                             :bottom-line="bottomLine"
                             :show-checkbox="showCheckbox"
                             :arrow-icon-down="arrowIconDown"
                             :arrow-icon-right="arrowIconRight"
                             :loading-icon="loadingIcon"
                             :children-key="childrenKey"
            >
            </tree-table-node>
        </div>
        <div :class="[prefixCls + '-empty']" v-if="!stateTree.length">{{ emptyText }}</div>
    </div>
</template>
<script>
import Emitter from 'vue-emitter';
import TreeTableNode from './tree-node.vue';
import elementResizeDetectorMaker from 'element-resize-detector';
const prefixCls = 's-tree';
export default {
    name: 'IviewTreeTable',
    mixins: [ Emitter ],
    components: { TreeTableNode },
    props: {
        data: {
            type: Array,
            default () {
                return [];
            }
        },
        columns: {
            type: Array,
            default () {
                return [];
            }
        },
        height: {
            type: Number
        },
        maxHeight: {
            type: Number
        },
        bottomLine: {
            type: Boolean,
            default: false
        },
        showCheckbox: {
            type: Boolean,
            default: false
        },
        emptyText: {
            type: String,
            default: '暂无数据'
        },
        childrenKey: {
            type: String,
            default: 'children'
        },
        loadData: {
            type: Function
        },
        showHeader: {
            type: Boolean,
            default: false
        },
        border: {
            type: Boolean,
            default: false
        },
        arrowIconRight: {
            type: String,
            default: 'arrow-right-b'
        },
        arrowIconDown: {
            type: String,
            default: 'arrow-down-b'
        },
        loadingIcon: {
            type: String,
            default: 'load-c'
        }
    },
    data () {
        return {
            prefixCls: prefixCls,
            stateTree: this.data,
            flatState: [],
            cols: [],
            tableWidth: 0,
            columnsWidth: {},
            checkedAll: false,
            sortRules: ''
        };
    },
    watch: {
        data: {
            deep: true,
            handler () {
                this.stateTree = this.data;
                this.flatState = this.compileFlatState();
                this.rebuildTree();
            }
        }
    },
    computed: {
        indeterminate () {
            this.checkedAll = this.flatState.every(state => state.node.checked === true);
            if (this.checkedAll) {
                return false;
            }
            let some = this.flatState.some(state => state.node.checked === true);
            if (some) {
                return true;
            }
            return false;
        },
        bodyStyle () {
            const { height, maxHeight } = this;
            if (height || maxHeight) {
                return {
                    height: height ? `${height}px` : 'auto',
                    maxHeight: maxHeight ? `${maxHeight}px` : null,
                    overflowY: 'auto'
                };
            }
            return {};
        }
    },
    methods: {
        colStyle (col) {
            return Object.assign({
                width: `${this.columnsWidth[col._index]}px`,
                cursor: col.sortable ? 'pointer' : 'auto'
            }, col.style || {});
        },
        transformCols () {
            let tableWidth = this.$el.offsetWidth - 1;
            // 最小宽度和
            let sumMinWidth = 0;
            // 有自定义宽度的列
            let hasWidthColumns = [];
            // 没有自定义宽度的列
            let noWidthColumns = [];
            // 有自定义最大宽度的列
            let maxWidthColumns = [];
            // 没有自定义最大宽度的列
            let noMaxWidthColumns = [];
            let columnsWidth = {};
            this.cols = [{width: 50}, ...this.columns].map((col, index) => {
                let column = Object.assign({_index: index, _width: null}, col);
                if (!column.render && column.template) {
                    let template = this.$scopedSlots[column.template];
                    if (template) {
                        column.render = (h, params) => {
                            return template(params);
                        };
                    }
                }
                if (column.width) {
                    hasWidthColumns.push(column);
                } else {
                    noWidthColumns.push(column);
                    if (column.minWidth) {
                        sumMinWidth += column.minWidth;
                    }
                    if (column.maxWidth) {
                        maxWidthColumns.push(column);
                    } else {
                        noMaxWidthColumns.push(column);
                    }
                }
                return column;
            });

            // 把所有自定义宽度加起来
            let unUsableWidth = hasWidthColumns.map(cell => cell.width).reduce((a, b) => a + b, 0);
            // 总宽度 - 自定义宽度和 - 最小宽度和 - 1
            let usableWidth = tableWidth - unUsableWidth - sumMinWidth - 1;
            let usableLength = noWidthColumns.length;
            let columnWidth = 0;
            if (usableWidth > 0 && usableLength > 0) {
                columnWidth = parseInt(`${usableWidth / usableLength}`);
            }

            this.cols.forEach(col => {
                let width = columnWidth + (col.minWidth ? col.minWidth : 0);
                if (col.width) {
                    width = col.width;
                } else {
                    if (col._width) {
                        width = col._width;
                    } else {
                        if (col.minWidth > width) {
                            width = col.minWidth;
                        } else if (col.maxWidth < width) {
                            width = col.maxWidth;
                        }

                        if (usableWidth > 0) {
                            usableWidth -= width - (col.minWidth ? col.minWidth : 0);
                            usableLength--;
                            if (usableLength > 0) {
                                columnWidth = parseInt(`${usableWidth / usableLength}`);
                            } else {
                                columnWidth = 0;
                            }
                        } else {
                            columnWidth = 0;
                        }
                    }
                }

                col._width = width;
                columnsWidth[col._index] = width;
            });
            if (usableWidth > 0) {
                usableLength = noMaxWidthColumns.length;
                columnWidth = parseInt(`${usableWidth / usableLength}`);
                noMaxWidthColumns.forEach(column => {
                    let width = column._width + columnWidth;
                    if (usableLength > 1) {
                        usableLength--;
                        usableWidth -= columnWidth;
                        columnWidth = parseInt(`${usableWidth / usableLength}`);
                    } else {
                        columnWidth = 0;
                    }

                    column._width = width;
                    columnsWidth[column._index] = width;
                });
            }

            this.tableWidth = this.cols.map(cell => cell._width).reduce((a, b) => a + b, 0) + 1;
            this.columnsWidth = columnsWidth;
        },
        compileFlatState () { // so we have always a relation parent/children of each node
            let keyCounter = 0;
            let childrenKey = this.childrenKey;
            const flatTree = [];
            function flattenChildren (node, parent) {
                node.nodeKey = keyCounter++;
                node.nodeLevel = parent ? parent.nodeLevel + 1 : 0;
                flatTree[node.nodeKey] = { node: node, nodeKey: node.nodeKey };
                if (typeof parent !== 'undefined') {
                    flatTree[node.nodeKey].parent = parent.nodeKey;
                    flatTree[parent.nodeKey][childrenKey].push(node.nodeKey);
                }

                if (node[childrenKey]) {
                    flatTree[node.nodeKey][childrenKey] = [];
                    node[childrenKey].forEach(child => flattenChildren(child, node));
                }
            }
            this.stateTree.forEach(rootNode => {
                flattenChildren(rootNode);
            });
            return flatTree;
        },
        updateTreeUp (nodeKey) {
            const parentKey = this.flatState[nodeKey].parent;
            if (typeof parentKey === 'undefined') return;

            const node = this.flatState[nodeKey].node;
            const parent = this.flatState[parentKey].node;
            if (node.checked === parent.checked && node.indeterminate === parent.indeterminate) return; // no need to update upwards

            if (node.checked === true) {
                this.$set(parent, 'checked', parent[this.childrenKey].every(node => node.checked));
                this.$set(parent, 'indeterminate', !parent.checked);
            } else {
                this.$set(parent, 'checked', false);
                this.$set(parent, 'indeterminate', parent[this.childrenKey].some(node => node.checked || node.indeterminate));
            }
            this.updateTreeUp(parentKey);
        },
        rebuildTree () { // only called when `data` prop changes
            const checkedNodes = this.getCheckedNodes();
            checkedNodes.forEach(node => {
                this.updateTreeDown(node, {checked: true});
                // propagate upwards
                const parentKey = this.flatState[node.nodeKey].parent;
                if (!parentKey && parentKey !== 0) return;
                const parent = this.flatState[parentKey].node;
                const childHasCheckSetter = typeof node.checked !== 'undefined' && node.checked;
                if (childHasCheckSetter && parent.checked !== node.checked) {
                    this.updateTreeUp(node.nodeKey); // update tree upwards
                }
            });
        },
        getCheckedNodes (indeterminate = false) {
            /* public API */
            return this.flatState.filter(obj => indeterminate ? (obj.node.checked || obj.node.indeterminate) : obj.node.checked).map(obj => obj.node);
        },
        updateTreeDown (node, changes = {}) {
            for (let key in changes) {
                this.$set(node, key, changes[key]);
            }
            if (node[this.childrenKey]) {
                node[this.childrenKey].forEach(child => {
                    this.updateTreeDown(child, changes);
                });
            }
        },
        handleCheck ({ checked, nodeKey }) {
            const node = this.flatState[nodeKey].node;
            this.$set(node, 'checked', checked);
            this.$set(node, 'indeterminate', false);

            this.updateTreeUp(nodeKey); // propagate up
            this.updateTreeDown(node, {checked, indeterminate: false}); // reset `indeterminate` when going down

            this.$emit('on-check-change', this.getCheckedNodes());
        },
        checkAll () {
            this.flatState.forEach(node => this.handleCheck({checked: !this.checkedAll, nodeKey: node.nodeKey}));
        },
        sorting (order, column, i) {
            this.sortRules = order + '-' + i;
            this.$emit('on-sort-change', {column, key: column.key, order});
        },
        selectedStyle (order, i) {
            if (this.sortRules) {
                const sortRules = this.sortRules.split('-');
                if (+sortRules[1] === i && order === sortRules[0]) {
                    if (order === 'desc') {
                        return { borderTopColor: '#2d8cf0' };
                    } else {
                        return { borderBottomColor: '#2d8cf0' };
                    }
                }
            }
            return {};
        }
    },
    created () {
        this.flatState = this.compileFlatState();
        this.rebuildTree();
    },
    mounted () {
        this.transformCols();
        window.addEventListener('resize', this.transformCols, false);
        this.observer = elementResizeDetectorMaker();
        this.observer.listenTo(this.$el, this.transformCols);
        this.$on('on-check', this.handleCheck);
        this.$on('toggle-expand', node => this.$emit('on-toggle-expand', node));
    }
};
</script>
<style lang="less" scoped>
.tree-table-border {
    border: 1px solid #dddee1;
    border-bottom: 0;
    &:before {
        content: "";
        position: absolute;
        background-color: #dcdee2;
        width: 100%;
        height: 1px;
        left: 0;
        bottom: 0;
        z-index: 1;
    }
}
.tree-table {
    .header-border {
        border: 1px solid #e8eaec;
    }
    .header-border-bottom {
        border-bottom: 1px solid #e8eaec;
    }
    .header {
        height: 36px;
        vertical-align: middle;
        background-color: #f8f8f9;
        > div {
            padding: 0 18px;
            line-height: 36px;
            overflow: hidden;
            font-weight: bold;
            display: inline-block;
            white-space: nowrap;
        }
    }
}
.tree-table-no-bottom-line {
    border-bottom: 0;
}

.s-tree-empty {
    border-bottom: 1px solid #e9eaec;
    text-align: center;
    padding: 15px;
}

.ivu-table-sort {
    display: inline-block;
    width: 10px;
    height: 12px;
    .ivu-icon-md-arrow-dropup {
        width: 0;
        height: 0;
        border-width: 0 5px 5px;
        border-style: solid;
        border-color: transparent transparent #C5C8CE;
        &:hover {
            border-bottom-color: #515A6E;
        }
    }
    .ivu-icon-md-arrow-dropdown {
        width: 0;
        height: 0;
        border-width: 5px 5px 0;
        border-style: solid;
        border-color: #C5C8CE transparent transparent;
        &:hover {
            border-top-color: #515A6E;
        }
    }
}
</style>
