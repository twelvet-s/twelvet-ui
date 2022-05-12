<template>
  <a-card class="general-card" title="OAuth2终端">
    <a-row v-show="searchVisible">
      <a-col :flex="1">
        <a-form ref="queryFormRef" :model="queryParams">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-form-item field="clientId" label="搜索编号">
                <a-input
                  v-model="queryParams.clientId"
                  allow-clear
                  placeholder="搜索编号"
                  @press-enter="handleQuery"
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-space :size="18">
                <a-button type="primary" @click="handleQuery">
                  <template #icon>
                    <icon-search />
                  </template>
                  搜索
                </a-button>
                <a-button @click="resetQuery">
                  <template #icon>
                    <icon-refresh />
                  </template>
                  重置
                </a-button>
              </a-space>
            </a-col>
          </a-row>
        </a-form>
      </a-col>
    </a-row>
    <a-divider v-show="searchVisible" />
    <a-row style="margin-bottom: 16px">
      <a-col :span="16">
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon>
              <icon-plus />
            </template>
            新增
          </a-button>
          <a-popconfirm content="确认删除吗？" @ok="handleDelete(selectedKeys)">
            <a-button :disabled="selectedKeys.length > 0 ? false : true">
              <icon-delete />
              批量删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </a-col>
      <a-col :span="8" style="text-align: right">
        <a-space>
          <a-popover>
            <a-button shape="circle" @click="toggleSearch()">
              <icon-search />
            </a-button>
            <template #content> 隐藏搜索参数</template>
          </a-popover>
          <a-popover>
            <a-button shape="circle" @click="getClientList()">
              <icon-refresh />
            </a-button>
            <template #content> 刷新</template>
          </a-popover>
        </a-space>
      </a-col>
    </a-row>
    <a-table
      v-model:selectedKeys="selectedKeys"
      row-key="clientId"
      column-resizable
      :bordered="{ cell: true }"
      :row-selection="rowSelection"
      :columns="columns"
      :data="tableDate"
      :loading="loading"
    >
      <template #optional="{ record }">
        <a-space>
          <a-link @click="handleUpdate(record.clientId)"> 修改 </a-link>
          <a-popconfirm
            content="确认删除吗？"
            @ok="handleDelete([record.clientId])"
          >
            <a-link>删除</a-link>
          </a-popconfirm>
        </a-space>
      </template>
    </a-table>
  </a-card>

  <a-modal
    v-model:visible="visible"
    :ok-loading="loading"
    width="700px"
    draggable
  >
    <template #title> {{ title }} </template>
    <div>
      <a-form ref="formRef" :rules="rules" :model="form">
        <a-form-item field="clientId" label="编号">
          <a-input
            v-model="form.clientId"
            :disabled="title === '新增客户端' ? false : true"
            placeholder="请输入编号"
          />
        </a-form-item>
        <a-form-item
          field="clientSecret"
          label="安全码"
          :rules="
            title === '新增客户端'
              ? [{ required: true, message: '请输入编号' }]
              : [{ required: false }]
          "
        >
          <a-input v-model="form.clientSecret" placeholder="请输入安全码" />
        </a-form-item>

        <a-form-item field="scope" label="授权范围">
          <a-input v-model="form.scope" placeholder="请输入授权范围" />
        </a-form-item>

        <a-form-item field="authorizedGrantTypes" label="授权类型">
          <DictionariesSelect />
        </a-form-item>

        <a-form-item field="accessTokenValidity" label="令牌时效（ms）">
          <a-input-number
            v-model="form.accessTokenValidity"
            :style="{ width: '150px' }"
            placeholder="请输入令牌时效"
          />
        </a-form-item>

        <a-form-item field="refreshTokenValidity" label="刷新时效（ms）">
          <a-input-number
            v-model="form.refreshTokenValidity"
            :style="{ width: '150px' }"
            placeholder="请输入刷新时效"
          />
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <a-space>
        <a-button type="primary" @click="submitForm">确认</a-button>
        <a-button @click="handleCancel">取消</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script lang="ts">
  import { onMounted, reactive, toRefs, ref } from 'vue';
  import { FormInstance } from '@arco-design/web-vue/es/form';
  import { Message } from '@arco-design/web-vue';
  import {
    getClientListApi,
    getClientByIdApi,
    deleteClientApi,
    insertClientApi,
    updateClientApi,
  } from '@/api/system/client';
  import DictionariesSelect from '@/components/twelvet/dictionaries/dictionaries-select/index.vue';

  export default {
    name: 'Client',
    components: {
      DictionariesSelect,
    },
    setup() {
      const formRef = ref<FormInstance>();

      const queryFormRef = ref<FormInstance>();

      const state = reactive({
        searchVisible: true,
        rowSelection: {
          type: 'checkbox',
          showCheckedAll: true,
        },
        selectedKeys: [],
        queryParams: {
          current: 1,
          pageSize: 10,
          clientId: undefined,
        },
        loading: false,
        visible: false,
        title: '',
        columns: [
          {
            title: '编号',
            dataIndex: 'clientId',
            align: 'center',
          },
          {
            title: '授权范围',
            dataIndex: 'scope',
            align: 'center',
          },
          {
            title: '授权类型',
            dataIndex: 'authorizedGrantTypes',
            align: 'center',
          },
          {
            title: '令牌有效时间',
            dataIndex: 'accessTokenValidity',
            align: 'center',
          },
          {
            title: '刷新令牌有效期',
            dataIndex: 'refreshTokenValidity',
            align: 'center',
          },
          {
            title: '操作',
            slotName: 'optional',
            align: 'center',
          },
        ],
        rules: {
          clientId: [{ required: true, message: '请输入编号' }],
          scope: [{ required: true, message: '请输入授权范围' }],
          authorizedGrantTypes: [{ required: true, message: '请选择授权类型' }],
          accessTokenValidity: [{ required: true, message: '请输入令牌时效' }],
          refreshTokenValidity: [{ required: true, message: '请输入刷新时效' }],
        },
        tableDate: [],
        form: {
          clientId: undefined,
          clientSecret: undefined,
          scope: undefined,
          authorizedGrantTypes: [],
          accessTokenValidity: undefined,
          refreshTokenValidity: undefined,
        },
      });

      /**
       * 获取客户列表
       */
      const getClientList = () => {
        state.loading = true;
        getClientListApi(state.queryParams).then((res) => {
          const { data } = res;
          state.tableDate = data.records;
          state.loading = false;
        });
      };

      /**
       * 初始化
       */
      onMounted(() => {
        getClientList();
      });

      /**
       *取消对话框
       */
      const handleCancel = () => {
        formRef.value?.clearValidate();
        state.visible = false;
      };

      /**
       * 搜索
       */
      const handleQuery = () => {
        state.queryParams.current = 1;
        getClientList();
      };

      /**
       * 重置按钮操作
       */
      const resetQuery = () => {
        queryFormRef.value?.resetFields();
        handleQuery();
      };

      /**
       * 根据ID获取客户端信息
       */
      const handleUpdate = (clientId: string) => {
        state.title = '编辑客户端';
        state.loading = true;
        getClientByIdApi(clientId).then((res) => {
          const { data } = res;
          state.form = data;
          state.form.authorizedGrantTypes =
            state.form.authorizedGrantTypes.split(',');
          // 打开窗口
          state.visible = true;
          // 关闭加载状态
          state.loading = false;
        });
      };

      /**
       * 隐藏搜索
       */
      const toggleSearch = () => {
        state.searchVisible = !state.searchVisible;
      };

      /**
       * 新增
       */
      const handleAdd = () => {
        state.title = '新增客户端';
        state.visible = true;
        formRef.value?.resetFields();
      };

      /**
       * 删除
       */
      const handleDelete = (clientIds: []) => {
        deleteClientApi(clientIds).then((res) => {
          Message.info(res.msg);
          getClientList();
        });
      };

      /**
       * 提交数据
       */
      const submitForm = () => {
        formRef.value?.validate((valid) => {
          if (!valid) {
            state.visible = true;
            state.form.authorizedGrantTypes =
              state.form.authorizedGrantTypes.join(',');
            // 不存在ID即为创建
            if (state.form.clientId !== undefined) {
              updateClientApi(state.form).then(() => {
                handleCancel();
              });
            } else {
              insertClientApi(state.form).then(() => {
                handleCancel();
              });
            }
          }
        });
      };

      return {
        ...toRefs(state),
        queryFormRef,
        formRef,
        getClientList,
        submitForm,
        handleCancel,
        handleUpdate,
        handleDelete,
        toggleSearch,
        handleQuery,
        handleAdd,
        resetQuery,
      };
    },
  };
</script>

<style scoped></style>
