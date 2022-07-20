<template>
  <a-card hoverable :style="{ width: '100%', margin: '5px' }">
    <a-form
      :model="form"
      :style="{ width: '100%', marginTop: '10px' }"
      @submit="handleSubmit"
      ><a-row :gutter="12">
        <a-col :span="6">
          <a-form-item
            field="dictName"
            label="字典名称："
            label-col-flex="80px"
          >
            <a-input
              v-model="form.dictName"
              placeholder="请输入"
            /> </a-form-item
        ></a-col>

        <a-col :span="6">
          <a-form-item field="dictType" label="字典类型" label-col-flex="80px">
            <a-input
              v-model="form.dictType"
              placeholder="请输入"
            /> </a-form-item
        ></a-col>
        <a-col :span="6">
          <a-form-item field="status" label="状态：">
            <a-select v-model="form.status" placeholder="请选择">
              <a-option value="1">启用</a-option>
              <a-option value="0">禁用</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-button type="dashed" @click="reset()">重置</a-button>
        <a-button type="primary" @click="getMenuList()">查询</a-button>
      </a-row>
    </a-form>
  </a-card>

  <a-table
    :columns="columns"
    :data="dictionariesList"
    row-key="menuId"
    :loading="loading"
    :row-selection="rowSelection"
    :style="{ marginTop: '10px' }"
  >
    <template #status="{ record }">
      <div>
        <a-badge v-if="record.status === 1" color="green" text="启用" />
        <a-badge v-else color="red" text="禁用" />
      </div>
    </template>
    <template #optional="{ record }">
      <a-space>
        <a-link @click="editModal(record.clientId)"> 修改 </a-link>
        <a-link>删除</a-link>
        <a-link>新增</a-link>
      </a-space>
    </template>
  </a-table>
</template>

<script lang="ts">
  import { onMounted, reactive, toRefs } from 'vue';
  import { getDictionariesListApi } from '@/api/system/dictionaries';

  export default {
    setup() {
      const state = reactive({
        loading: false,
        visible: false,
        title: '',
        rowSelection: {
          type: 'checkbox',
          showCheckedAll: true,
        },
        columns: [
          {
            title: '字典名称',
            dataIndex: 'dictName',
          },
          {
            title: '字典类型',
            dataIndex: 'dictType',
          },
          {
            title: '状态',
            dataIndex: 'status',
          },
          {
            title: '备注',
            dataIndex: 'remark',
          },
          {
            title: '创建时间',
            dataIndex: 'createTime',
          },
          {
            title: '操作',
            slotName: 'optional',
          },
        ],

        dictionariesList: [],
      });
      const form = reactive({
        dictName: '',
        dictType: '',
        status: '',
      });

      const getDictionaries = () => {
        state.loading = true;
        try {
          getDictionariesListApi(form).then((res) => {
            state.loading = false;
            console.log(res);
            state.dictionariesList = res.data.records;
          });
        } finally {
          state.loading = false;
        }
      };
      const reset = () => {
        form.dictName = '';
        form.dictType = '';
        form.status = '';
        getDictionaries();
      };
      /**
       * 初始化
       */
      onMounted(() => {
        getDictionaries();
      });

      return {
        ...toRefs(state),
        form,
        getDictionaries,
      };
    },
  };
</script>

<style scoped></style>
