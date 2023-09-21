
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProDescriptionsItemProps,
  ProForm,
  ProTable,
  ProColumns,
  
} from '@ant-design/pro-components';
import { Button, Divider, Drawer, message,Input } from 'antd';
import React, { useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm, { FormValueType } from './components/UpdateForm';
import {request} from "@umijs/max";

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.UserInfo) => {
  const hide = message.loading('正在添加');
  try {
    await addUser({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};

/**
 * 更新节点
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('正在配置');
  try {
    await modifyUser(
      {
        userId: fields.id || '',
      },
      {
        name: fields.name || '',
        nickName: fields.nickName || '',
        email: fields.email || '',
      },
    );
    hide();

    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
    return false;
  }
};

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.UserInfo[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await deleteUser({
      userId: selectedRows.find((row) => row.id)?.id || '',
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};
/*
*  获取日期
*/
const getMoment = (str: any, hm?: boolean, spacer?: string) => {
  if (Number(str)) {
    let date = new Date(Number(str)); // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear();
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth()+1) : date.getMonth()+1);
    let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    let spacerline = spacer ? spacer : '-';
    if (hm) {
      str = Y + spacerline + M + spacerline + D;
    }
    else {
      str = Y + spacerline + M + spacerline + D + '\n' + h + ':' + m + ':' + s;
    }
  }
  else {
    str = '-';
  }
  return str;
}
const TableList: React.FC<unknown> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] =
    useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<API.UserInfo>();
  const [selectedRowsState, setSelectedRows] = useState<API.UserInfo[]>([]);
  
  // const columns: ProDescriptionsItemProps[] = [
  const columns: ProColumns[] = [

    {
      title: 'ID',
      order:1, //搜索栏的排列顺序, 数值越大，排位越靠前
      dataIndex: 'id',
      fixed: 'left',//样式做浮动
      sorter: true, //支持排序
      align: 'center', //字体居中
      fieldProps: () => ({ //对应着valueType的所有方法,具体方法可以查看官网找到对应类型的组件进行查看
        placeholder: '请输入ID',
      }),
      formItemProps: { //想要此处生效，必须要设置 ignoreRules
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    },
    {
      title: '作者',
      dataIndex: 'author',
    },
    {
      order:2, //搜索栏的排列顺序
      title: '标题',
      dataIndex: 'title',
      width: 200, //设置宽度
      tip: '是唯一的 key',//表头提示
      ellipsis: true, //设置一个，就每一列都会平均分配宽度。并且内容过多，会自动展示省略号 + tip提示
      copyable: true, //支持复制
      search: {
        transform:(val) => {
          console.log("title.val",val); //输入时就会触发，不用点击搜索按钮
          return val //设置的ts类型有关，必须要有返回值
        }
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select', //设置状态搜索表单类型是 下拉选择 ,默认类型 "text"
      initialValue: '全部', //默认值
      valueEnum: {
        all: { text: '超长'.repeat(50) , disabled:true}, //内容过长自动展示省略tip
        0: {
          text: '全部',
        },
        3: {
          text: '失联',
          status: 'Error',
        },
        1: {
          text: '完结',
          status: 'Success',
          disabled: true, //搜索下拉框中禁用
        },
        2: {
          text: '连载',
          status: 'Processing',
        },
      },
      // 搜索， 默认是 false 为隐藏
      search: {
        transform: (value: any) => {
          console.log("transform",value); //可以做类型判断，或者是时间转换，如果后端要时间戳，可在这里转换
          if (value.indexOf('all') !== -1) {
            return value
          }
          return {
            status: value
          }
        },
      },
    },
    {
      title:'创建时间',
      dataIndex:'createAt',
      hideInSearch:true, //不在搜索表单展示
      hideInTable:false, //不在table中显示 false：显示
      renderText:(val)=> getMoment(val), //行内容展示 重写
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => ( //重写tabel每行的内容
        <>
          <a onClick={()=>{
             handleUpdateModalVisible(true);
             setStepFormValues(record);
          }} >规则配置</a>

          <Divider type="vertical" />
          <a href="">订阅警报</a>
        </>
      ),
    },
    // 自拟定搜索
    {
      order: 99,
      hideInTable: true,
      title: '订阅量',
      formItemProps: {
          className: 'searchTypeFormIt' //设置 fromItem的className
      },
      renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
  
        
          return (
              <>
                  <ProForm.Item
                      noStyle
                      name='amountMin' 
                      label="订阅量"
                      rules= {[
                          {
                              required: false,
                              pattern:  new RegExp(/^(\d+)$|^(\d+\.\d+)$/),
                              message: '最小值请输入数值类型'
                          },
                      ]}
                  >
                      <Input
                          style={{
                              width: 'calc(50% - 12px)',
                          }}
                          placeholder="最小值"
                      />
                  </ProForm.Item>

                  <span style={{padding:'0 5px'}}>~</span>

                  <ProForm.Item
                      noStyle
                      name='amountMax'
                      rules= {[
                          {
                              required: false,
                              pattern:  new RegExp(/^(\d+)$|^(\d+\.\d+)$/),
                              message: '最大值请输入数值类型'
                          },
                          () => (
                              {
                                  validator(rule: any, value: any) {
                                    const MinAmount = form.getFieldValue('amountMin');
                                    console.log('MinAmount',MinAmount);
                                    console.log('value',value);
                                      if (MinAmount && Number(MinAmount) > Number(value)) {
                                          return Promise.reject('最大值不能小于最小值');
                                      }
                                      return Promise.resolve();

                                  }
                              }
                          )
                      ]}
                  >
                      <Input
                          style={{
                              width: 'calc(50% - 12px)',
                          }}
                          placeholder="最大值"
                      />
                  </ProForm.Item>
              </>
          )
      },
  },
  ];

  return (
    <PageContainer
      header={{
        title: 'CRUD 示例',
      }}
    >
      <ProTable<API.UserInfo>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        form={{
          ignoreRules: false, //搭配 formItemProps ,设置校验规则
        }}
        toolBarRender={() => [
          <Button
            key="1"
            type="primary"
            onClick={() => handleModalVisible(true)}
          >
            新建
          </Button>,
        ]}
        request={async (params, sorter, filter) => {
          const { data, success } = await request('/api/v1/articleList', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
            },
            data: {},
          });
          return {
            data: data?.list || [],
            total:data?.total || 0,
            success,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              项&nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
          <Button type="primary">批量审批</Button>
        </FooterToolbar>
      )}
      <CreateForm
        onCancel={() => handleModalVisible(false)}
        modalVisible={createModalVisible}
      >
        <ProTable<API.UserInfo, API.UserInfo>
          onSubmit={async (value) => {
            const success = await handleAdd(value);
            if (success) {
              handleModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          rowKey="id"
          type="form"
          columns={columns}
        />
      </CreateForm>
      {stepFormValues && Object.keys(stepFormValues).length ? (
        <UpdateForm
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalVisible(false);
              setStepFormValues({});
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues({});
          }}
          updateModalVisible={updateModalVisible}
          values={stepFormValues}
        />
      ) : null}

      <Drawer
        width={600}
        open={!!row}
        onClose={() => {
          setRow(undefined);
        }}
        closable={false}
      >
        {row?.name && (
          <ProDescriptions<API.UserInfo>
            column={2}
            title={row?.name}
            request={async () => ({
              data: row || {},
            })}
            params={{
              id: row?.name,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
