<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
      <el-tab-pane label="平台状态配置" name="systemInfo">
        <el-form
          ref="systemInfoRuleForm"
          label-position="left"
          label-width="150px"
          :model="formData"
        >
          <template v-for="(item,index) in formList">
            <el-form-item
              v-if="item.tag === 'select'"
              :key="index"
              v-bind="item.formItem"
              :label="item.label"
            >
              <el-select v-model="formData[item.model]" v-bind="item.attrs" v-on="item.listeners">
                <el-option
                  v-for="(option,idx) in item.options"
                  :key="idx"
                  :value="option.value"
                  :label="option.label"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              v-else
              :key="index"
              :label="item.label"
              :prop="item.model"
              :rules="[{required:true,message:'输入不能为空',trriger:'blur'}]"
            >
              <component
                :is="`el-${item.tag}`"
                v-model="formData[item.model]"
                v-bind="item.attrs"
                style="width:50%"
                v-on="item.listeners"
              ></component>
            </el-form-item>
          </template>
        </el-form>
        <span style="margin-left:18vw">
          <el-button
            style="width:150px"
            type="primary"
            @click="handleConfirmSystemInfo('systemInfoRuleForm')"
          >修改</el-button>
        </span>
      </el-tab-pane>
      <el-tab-pane label="助手APP配置" name="agentAPPInfo">
        <el-table
          v-loading="loading"
          element-loading-text="Loading"
          stripe
          highlight-current-row
          :data="agentAPPData"
        >
          <el-table-column align="center" label="序号" type="index" />
          <el-table-column align="center" label="安卓版本号" prop="AndroidVersion" />
          <el-table-column align="center" label="IOS版本号" prop="iOSVersion" />
          <el-table-column align="center" label="安卓安装包下载地址" prop="AndroidDownloadUrl" />
          <el-table-column align="center" label="IOS安装包下载地址" prop="iOSDownloadUrl" />
          <el-table-column align="center" label="热更地址" prop="ResUrl" />
          <el-table-column width="200px" align="center">
            <template slot="header">
              <el-button size="mini" type="primary" @click="agentCreate">添加配置</el-button>
            </template>
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="agentAPPEdit(scope.$index, scope.row)"
              >编辑</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="agentAPPDelete(scope.$index, scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      center
      :title="dlgTitleAgent"
      :before-close="handleCloseAgentDlg"
      :visible.sync="agentDlgVisible"
      :close-on-click-modal="false"
      width="50%"
      top="6vh"
    >
      <el-form
        ref="agentAPP"
        label-position="left"
        label-width="150px"
        :rules="agentAPPRule"
        :model="agentAPPFormData"
      >
        <el-form-item label="安卓版本号" prop="AndroidVersion">
          <el-input v-model="agentAPPFormData.AndroidVersion" />
        </el-form-item>
        <el-form-item label="IOS版本号" prop="iOSVersion">
          <el-input v-model="agentAPPFormData.iOSVersion" />
        </el-form-item>
        <el-form-item label="安卓安装包下载地址" prop="AndroidDownloadUrl">
          <el-input v-model="agentAPPFormData.AndroidDownloadUrl" />
        </el-form-item>
        <el-form-item label="IOS安装包下载地址" prop="iOSDownloadUrl">
          <el-input v-model="agentAPPFormData.iOSDownloadUrl" />
        </el-form-item>
        <el-form-item label="热更地址" prop="ResUrl">
          <el-input v-model="agentAPPFormData.ResUrl" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirmAgentAPP('agentAPP')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import request from '@/utils/request'
export default {
  data() {
    return {
      activeName: 'systemInfo',
      formData: {
        Status: '',
        AndroidVersion: '',
        iOSVersion: '',
        ResVersion: '',
        AndroidDownloadUrl: '',
        iOSDownloadUrl: '',
        ResUrl: '',
        ShareUrl: '',
        DownloadShareUrl: '',
        KeFuWx: '',
        Name: ''
      },
      formList: [
        {
          tag: 'select',
          label: '状态',
          model: 'Status',
          options: [
            { value: 0, label: '维护中' },
            { value: 1, label: '内测中' },
            { value: 2, label: '运行中' }
          ]
        },
        {
          tag: 'input',
          label: '安卓版本',
          model: 'AndroidVersion',
          listeners: {
            input: item => {
              console.log('hhh', item)
            }
          }
        },
        {
          tag: 'input',
          label: 'IOS版本',
          model: 'iOSVersion'
        },
        {
          tag: 'input',
          label: '资源版本',
          model: 'ResVersion'
        },
        {
          tag: 'input',
          label: '安卓下载地址',
          model: 'AndroidDownloadUrl'
        },
        {
          tag: 'input',
          label: 'IOS下载地址',
          model: 'iOSDownloadUrl'
        },
        {
          tag: 'input',
          label: '更新地址',
          model: 'ResUrl'
        },
        {
          tag: 'input',
          label: '分享地址',
          model: 'ShareUrl'
        },
        {
          tag: 'input',
          label: '分享下载地址',
          model: 'DownloadShareUrl'
        },
        {
          tag: 'input',
          label: '客服微信',
          model: 'KeFuWx'
        },
        {
          tag: 'input',
          label: '平台名称',
          model: 'Name'
        }
      ],
      // 助手app
      agentAPPData: [],
      loading: false,
      dlgTitleAgent: '',
      agentDlgVisible: false,
      agentAPPFormData: {},
      agentAPPRule: {
        AndroidVersion: [
          { required: true, message: '请输入安卓版本号', trigger: 'blur' }
        ],
        iOSVersion: [
          { required: true, message: '请输入IOS版本号', trigger: 'blur' }
        ],
        AndroidDownloadUrl: [
          { required: true, message: '请输入安卓下载地址', trigger: 'blur' }
        ],
        iOSDownloadUrl: [
          { required: true, message: '请输入IOS下载地址', trigger: 'blur' }
        ],
        ResUrl: [{ required: true, message: '请输入热更地址', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchSystemInfo()
  },
  methods: {
    // 标签切换
    handleTabClick(tab, event) {
      if (tab.index === '0') {
        this.fetchSystemInfo()
      } else if (tab.index === '1') {
        this.fetchAgentAppItems()
      }
    },
    //
    async fetchSystemInfo() {
      const res = await request.get('platform/getConfigure')
      if (Object.keys(res).length) {
        this.formData = res.data
      }
    },
    async handleConfirmSystemInfo(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          const param = Object.assign({}, { ...this.formData })
          console.log(param)
          const res = await request.post('platform/configure', param)
          console.log('res', res)
          if (res.data) {
            this.$message.success('修改成功')
          } else {
            this.$message.error('修改失败')
          }
        }
      })
    },
    // 助手app
    async fetchAgentAppItems() {
      const res = await request.get('agentApp/List')
      this.agentAPPData = res.data
    },
    handleCloseAgentDlg(done) {
      this.$refs['agentAPP'].resetFields()
      done()
    },
    agentCreate() {
      this.dlgTitleAgent = '添加助手APP配置'
      this.agentDlgVisible = true
      this.agentAPPFormData = {}
    },
    agentAPPEdit(index, row) {
      this.dlgTitleAgent = '编辑'
      this.agentDlgVisible = true
      this.agentAPPFormData = Object.assign({}, row)
    },
    agentAPPDelete(index, row) {
      this.$confirm('确定要删除该配置吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          await request.post('agentApp/Del', { IndexID: row.IndexID })
          this.fetchAgentAppItems()
        })
        .catch(() => {})
    },
    handleConfirmAgentAPP(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) return
        const data = Object.assign({}, this.agentAPPFormData)
        this.agentDlgVisible = false
        this.$refs[formName].resetFields()
        if (this.dlgTitleAgent === '添加助手APP配置') {
          request.post('agentApp/Add', data).then(res => {
            this.fetchAgentAppItems()
          })
        } else {
          request.post('agentApp/Modify', data).then(res => {
            this.fetchAgentAppItems()
          })
        }
      })
    }
  }
}
</script>
