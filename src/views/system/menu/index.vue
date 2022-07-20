<template>
  <a-card hoverable :style="{ width: '100%', margin: '5px' }">
    <a-form
      :model="form"
      :style="{ width: '100%', marginTop: '10px' }"
      @submit="handleSubmit"
      ><a-row :gutter="12">
        <a-col :span="6">
          <a-form-item
            field="menuName"
            label="菜单名称："
            label-col-flex="80px"
          >
            <a-input
              v-model="form.menuName"
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
    :data="menuList"
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

  <a-modal
    v-model:visible="visible"
    width="700px"
    draggable
    @ok="handleSave"
    @cancel="handleCancel"
  >
    <template #title> {{ title }} </template>
    <div>
      <a-form ref="formRef" :rules="rules" :model="form">
        <a-form-item field="clientId" label="上级菜单">
          <a-input
            v-model="form.clientId"
            :disabled="true"
            placeholder="请输入编号"
          />
        </a-form-item>
        <a-form-item field="clientSecret" label="4234 ">
          <a-input v-model="form.clientSecret" placeholder="请输入安全码" />
        </a-form-item>

        <a-form-item field="scope" label="授权范围">
          <a-input v-model="form.scope" placeholder="请输入授权范围" />
        </a-form-item>

        <a-form-item field="authorizedGrantTypes" label="授权类型">
          <a-select
            :default-value="['Beijing', 'Shanghai']"
            :size="size"
            placeholder="Please select ..."
            multiple
          >
            <a-option>Beijing</a-option>
            <a-option>Shanghai</a-option>
            <a-option>Guangzhou</a-option>
            <a-option disabled>Disabled</a-option>
            <a-option>Shenzhen</a-option>
            <a-option>Chengdu</a-option>
            <a-option>Wuhan</a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="accessTokenValidity" label="令牌时效（ms）">
          <a-input-number
            v-model="form.accessTokenValidity"
            :style="{ width: '100px' }"
            placeholder="请输入令牌时效"
          />
        </a-form-item>

        <a-form-item field="refreshTokenValidity" label="刷新时效（ms）">
          <a-input-number
            v-model="form.refreshTokenValidity"
            :style="{ width: '100px' }"
            placeholder="请输入刷新时效"
          />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script lang="ts">
  import { onMounted, reactive, toRefs } from 'vue';
  import { getMenuListApi } from '@/api/system/menu';
  import { transListDataToTreeData } from '@/utils/twelvet';

  export default {
    name: 'Menu',
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
            title: '菜单名称',
            dataIndex: 'menuName',
          },
          {
            title: 'Icon',
            dataIndex: 'icon',
          },
          {
            title: '排序',
            dataIndex: 'orderNum',
          },
          {
            title: '权限标识',
            dataIndex: 'menuType',
          },
          {
            title: '组件路径',
            dataIndex: 'path',
          },
          {
            title: '状态',
            slotName: 'status',
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

        menuList: [],
      });
      // 表单
      const form = reactive({
        menuName: '',
        status: '',
      });
      const handleSubmit = (data: any) => {
        console.log(data);
      };

      const getMenuList = () => {
        state.loading = true;
        try {
          getMenuListApi(form).then((res) => {
            state.loading = false;
            const { data } = res;

            const dataTree = transListDataToTreeData(data, 0);
            state.menuList = dataTree;
          });
        } finally {
          state.loading = false;
        }
      };
      const reset = () => {
        form.menuName = '';
        form.status = '';
        getMenuList();
      };
      /**
       * 初始化
       */
      onMounted(() => {
        getMenuList();
      });

      /**
       * 根据ID获取客户端信息
       */
      const editModal = (clientId: string) => {
        try {
          state.title = '编辑客户端';
          state.loading = true;
          // 打开窗口
          state.visible = true;
          //   getClientByIdApi(clientId).then((res) => {
          //     const { data } = res;
          //     state.form = data;
          //     // 打开窗口
          //     state.visible = true;
          //   });
        } finally {
          // 关闭加载状态
          state.loading = false;
        }
      };

      return {
        ...toRefs(state),
        getMenuList,
        form,
        reset,
        editModal,
        handleSubmit,
      };
    },
  };
</script>

<style scoped></style>
