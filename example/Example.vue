<template>
    <div style="margin: 10px">
        <div>
            <Checkbox v-model="border">边框</Checkbox>
            <Checkbox v-model="bottomLine">底线</Checkbox>
            <Checkbox v-model="showCheckbox">显示复选框</Checkbox>
            <Checkbox v-model="showHeader">显示头</Checkbox>
        </div>
        <tree-table
            ref="tree"
            :max-height="300"
            :data="data"
            :columns="columns"
            :load-data="loadData"
            :show-checkbox="showCheckbox"
            :show-header="showHeader"
            :bottom-line="bottomLine"
            :border="border"
            @on-sort-change="sorting"
            arrow-icon-down="md-arrow-dropdown"
            arrow-icon-right="md-arrow-dropright"
        >
            <template slot="test" slot-scope="{data}">
                aa {{data.name}} bb
            </template>
        </tree-table>
        <Button @click="ok">确定</Button>
    </div>
</template>
<script>
import TreeTable from '../src/iview-tree-table';
// import TreeTable from '../dist/iview-tree-table';
export default {
    name: 'example',
    data () {
        return {
            border: true,
            bottomLine: true,
            showCheckbox: true,
            showHeader: true,
            columns: [{
                title: '名称',
                key: 'name'
            }, {
                title: '测试',
                key: 'title',
                template: 'test',
                sortable: true
            }],
            data: [{
                id: 1,
                name: '1',
                children: [{
                    id: 11,
                    pid: 1,
                    name: '11'
                }, {
                    id: 12,
                    pid: 1,
                    name: '12',
                    children: [{
                        id: 111,
                        pid: 12,
                        _checked: true,
                        name: '111'
                    }]
                }]
            }, {
                id: 2,
                name: '2',
                _expand: true,
                children: [{
                    id: 22,
                    pid: 2,
                    name: '22'
                }, {
                    id: 23,
                    pid: 2,
                    name: '23'
                }]
            }, {
                id: 3,
                name: '3',
                _disable: true
            }, {
                id: 4,
                name: '4',
                _expand: true,
                children: [{
                    id: 41,
                    pid: 4,
                    name: '41'
                }, {
                    id: 42,
                    pid: 4,
                    name: '42'
                }]
            }],
            data2: [{
                title: 'parent',
                loading: false,
                children: []
            }]
        };
    },
    components: {
        TreeTable
    },
    methods: {
        loadData (item, callback) {
            setTimeout(() => {
                const data = [
                    {
                        title: 'children',
                        loading: false,
                        children: []
                    },
                    {
                        title: 'children',
                        loading: false,
                        children: []
                    }
                ];
                callback(data);
            }, 1000);
        },
        ok () {
            /* eslint-disable no-console */
            console.log(this.$refs.tree.getCheckedNodes());
            console.log(this.$refs.tree.getCheckedNodes(true));
        },
        sorting (order) {
            console.log(order);
        }
    }
};
</script>
