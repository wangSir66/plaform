<template>
  <div class="app-container">
    <el-form :inline="true" :model="filterData">
      <el-form-item>
        <el-select v-model="filterData.filterType" placeholder="请选择查询类型">
          <el-option
            v-for="item in filterOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="descClass">
        <el-input
          v-model="filterData.content"
          :placeholder="placeholder"
          type="text"
          :clearable="true"
          @clear="clearFilterData('filterType')"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="listLoading"
      :data="merchantList"
      element-loading-text="Loading"
      stripe
      highlight-current-row
    >
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-table :data="scope.row.PropItems" stripe highlight-current-row>
            <el-table-column align="center" label="序号" type="index" />
            <el-table-column align="center" label="关联商品">
              <template slot-scope="scope">
                <el-image :src="scope.row.Picture[0]" style="width: 64px;height: 64px" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="商品名称" prop="Name" />
            <el-table-column align="center" label="道具ID" prop="ItemID" />
            <el-table-column align="center" label="商品标价" prop="MarketValue" />
            <el-table-column align="center" label="商品成本" prop="CostPrice" />
            <el-table-column align="center" label="核销方式" prop="Type">
              <template slot-scope="scope1">
                {{
                getPropName(scope1.row.Type)
                }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="商品详细图片1">
              <template slot-scope="scope">
                <el-image :src="scope.row.Picture[1]" style="width: 64px;height: 64px" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="商品详细图片2">
              <template slot-scope="scope">
                <el-image :src="scope.row.Picture[2]" style="width: 64px;height: 64px" />
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column align="center" label="序号" type="index" />
      <el-table-column align="center" label="商户ID" prop="IndexID" />
      <el-table-column align="center" label="商户名称">
        <template slot-scope="scope">{{ scope.row.Name }}</template>
      </el-table-column>
      <el-table-column align="center" label="商户LOGO">
        <template slot-scope="scope">
          <el-image :src="scope.row.Icon" style="width: 64px;height: 64px" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="联系方式">
        <template slot-scope="scope">{{ scope.row.ContactInfo }}</template>
      </el-table-column>
      <el-table-column align="center" label="商户地址">
        <template slot-scope="scope">{{ scope.row.Address }}</template>
      </el-table-column>
      <el-table-column align="center" label="商户登录账号密码">
        <template slot-scope="scope">
          <div>账号：{{ scope.row.Account || "无" }}</div>
          <div>密码：{{ scope.row.Password || "无" }}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" plain @click="lookUpOrder(scope.row.IndexID)">查看订单</el-button>
        </template>
      </el-table-column>
      <el-table-column width="160px" align="center">
        <template slot="header">
          <el-button size="mini" type="primary" @click="handleCreate">创建</el-button>
        </template>
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      center
      :title="dialogTitle"
      :before-close="handleClose"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      top="2vh"
      width="62%"
    >
      <el-form
        ref="ruleForm"
        label-position="right"
        label-width="100px"
        :rules="rules"
        :model="formData"
      >
        <el-form-item label="门店logo" prop="Icon">
          <el-upload
            class="avatar-uploader"
            multiple
            accept="image/jpeg, image/png"
            :action="uploadPath"
            :show-file-list="false"
            :http-request="uploadFile"
            :before-upload="beforeUpload"
          >
            <el-image
              v-if="formData.Icon"
              v-model="formData.Icon"
              fit="contain"
              :src="formData.Icon"
              style="width: 79px;height: 79px"
              class="el-upload"
              @error="handleImageError"
            />
            <span v-else class="el-icon-plus avatar-uploader-icon el-upload" />
          </el-upload>
        </el-form-item>
        <el-form-item label="名称" prop="Name">
          <el-input v-model="formData.Name" placeholder="输入商户名称" />
        </el-form-item>
        <el-form-item label="商户地址" prop="Address">
          <el-input v-model="formData.Address" placeholder="展示给用户的商品核销门店详细地址" />
        </el-form-item>
        <el-form-item label="联系方式" prop="ContactInfo">
          <el-input v-model="formData.ContactInfo" placeholder="展示给用户的商品核销门店的联系方式" />
        </el-form-item>
        <el-form-item label="商户账号" prop="Account">
          <el-input v-model="formData.Account" placeholder="输入商户登录系统的手机账号" />
        </el-form-item>
        <el-form-item label="登录密码" prop="Password">
          <el-input v-model="formData.Password" placeholder="默认888888" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="mechantLoading" type="primary" @click="handleConfirm('ruleForm')">确 定</el-button>
      </span>
    </el-dialog>
    <!--查看订单对话框 -->
    <el-dialog
      center
      title="查看订单"
      :before-close="handleOrderClose"
      :visible.sync="dialogOrderVisible"
      :close-on-click-modal="false"
      top="2vh"
      width="72%"
    >
      <el-form :inline="true" :model="orderFilterData">
        <el-form-item>
          <el-input
            v-model="orderFilterData.content"
            size="medium"
            placeholder="奖品名称,核销码,比赛ID"
            :clearable="true"
            @clear="clearFilterOrderData('content')"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQueryOrder">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="orderList" stripe highlight-current-row>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item label="有效期">
                <span>{{ parseTime(scope.row.start) }}到{{ parseTime(scope.row.end) }}</span>
              </el-form-item>
              <el-form-item label="用户手机">
                <span>{{ scope.row.phone || '无' }}</span>
              </el-form-item>
              <el-form-item label="特殊说明">
                <span>{{ scope.row.special || '无' }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column align="center" label="序号" type="index" />
        <el-table-column align="center" label="订单时间" width="150upx">
          <template slot-scope="scope">
            {{
            parseTime(scope.row.time)
            }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="奖品信息">
          <template slot-scope="scope">
            <el-image :src="scope.row.icon[0]" style="width: 64px;height: 64px" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="奖品名称" prop="propName" />
        <el-table-column align="center" label="价格">
          <template slot-scope="scope">
            <div>原价：{{ scope.row.marketValue }}</div>
            <div>成本：{{ scope.row.costPrice }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="核销码" prop="code" />
        <el-table-column align="center" label="商户名称、ID">
          <template slot-scope="scope">
            <div>{{ scope.row.merchantName }}</div>
            <div>ID:{{ scope.row.merchantID }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="核销方式" prop="type">
          <template slot-scope="scope">
            {{
            getPropName(scope.row.type)
            }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="关联比赛/ID">
          <template slot-scope="scope">
            <div>{{ scope.row.matchName }}</div>
            <div>{{ scope.row.matchID }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" prop="state">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.state === 1" type="success" plain>待核销</el-tag>
            <el-tag v-else-if="scope.row.state === 2" type="primary" plain>已核销</el-tag>
            <el-tag v-else-if="scope.row.state === 3" type="warning" plain>已过期</el-tag>
            <el-tag v-else type="warning" plain>未知类型</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { Copy, ErrorTip, SetData } from '@/utils/util'
import request from '@/utils/request'
import settings from '@/settings'
import { parseTime } from '@/utils/index'
import merchant from '@/api/merchant'
import prop from '@/api/prop'
import order from '@/api/order'
export default {
  data() {
    return {
      // 筛选
      filterData: {
        content: '',
        filterType: undefined
      },
      filterOptions: [
        {
          value: 1,
          label: '商户ID'
        },
        {
          value: 2,
          label: '商户名称'
        },
        {
          value: 3,
          label: '商户联系电话'
        },
        {
          value: 4,
          label: '商户登录电话'
        }
      ],
      // 创建商户
      mechantLoading: false,
      // 查看订单对话框
      orderFilterData: {
        // 筛选
        content: ''
      },
      merchantID: undefined, // 根据merchantID查询订单
      orderList: [], // 订单列表
      dialogOrderVisible: false,
      //
      uploadPath: `${settings.baseUrl}/upload`,
      listLoading: true,
      merchantList: [],
      handleImageError: ErrorTip,
      dialogTitle: '',
      dialogVisible: false,
      rules: {
        Icon: [
          { required: true, message: '门店logo不能为空', trigger: 'blur' }
        ],
        Name: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
        Address: [
          { required: true, message: '请输入门店地址', trigger: 'blur' }
        ],
        ContactName: [
          { required: true, message: '请输入联系人姓名', trigger: 'blur' }
        ],
        ContactInfo: [
          { required: true, message: '请输入联系人电话', trigger: 'blur' }
        ],
        Account: [
          { required: true, message: '请输入商户账号', trigger: 'blur' }
        ],
        Password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' }
        ]
      },
      formData: {}
    }
  },
  computed: {
    placeholder() {
      if (this.filterData?.filterType === 1) {
        return '请输入商户ID'
      } else if (this.filterData?.filterType === 2) {
        return '请输入商户名称'
      } else if (this.filterData?.filterType === 3) {
        return '请输入商户联系电话'
      } else if (this.filterData?.filterType === 4) {
        return '请输入商户登录电话'
      } else {
        return '请输入'
      }
    }
  },
  created() {
    if (this.$route.query.id) {
      this.filterData = {
        filterType: 1,
        content: this.$route.query.id
      }
    }
    this.getMerchantList()
  },
  methods: {
    // 工具类
    parseTime(time) {
      return parseTime(new Date(time))
    },
    async uploadFile(req) {
      const formData = new FormData()
      formData.append('file', req.file)
      const res = await request.post(`${settings.baseUrl}/upload`, formData)
      if (res && res.name) {
        const data = Object.assign({}, this.formData)
        data.Icon = res.url
        this.formData = data
      }
    },
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt32Kb = file.size / 1024 / 1024 / 1024 < 32
      if (!isJPG && !isPNG) {
        this.$message.error('图标只能是 JPG 或者 PNG 格式!')
      }
      if (!isLt32Kb) {
        this.$message.error('图标大小不能超过 32 KB!')
      }
      return (isJPG || isPNG) && isLt32Kb
    },
    // 查询
    handleQuery() {
      this.getMerchantList()
    },
    clearFilterData(key) {
      delete this.filterData[key]
      this.getMerchantList()
    },
    // 查看订单
    getPropName(type) {
      return prop.PropType[0]?.label
    },
    async getOrderList(filterContent) {
      const params = {
        merchantID: this.merchantID
      }
      if (filterContent) {
        params.filterData = { content: filterContent }
      }
      const res = await order.orderList(params)
      console.log('---', res)
      this.orderList = res
    },
    clearFilterOrderData(key) {
      delete this.orderFilterData[key]
      this.getOrderList()
    },
    lookUpOrder(merchantID) {
      this.dialogOrderVisible = true
      this.merchantID = merchantID
      this.getOrderList()
    },
    handleOrderClose(done) {
      done()
    },
    handleQueryOrder() {
      this.getOrderList(this.orderFilterData.content)
    },
    goDetail() {},
    // 表格
    //
    handleCreate() {
      this.dialogTitle = '创建商户'
      this.formData = {}
      this.dialogVisible = true
    },
    handleConfirm(formName) {
      this.$refs[formName].validate(val => {
        if (!val) return
        const data = Object.assign({}, this.formData)
        this.listLoading = true
        this.mechantLoading = true
        merchant.updateMerchant(data).then(res => {
          this.listLoading = false
          this.mechantLoading = false
          if (res.error) {
            this.handleImageError(1, '编辑/创建商户', res.error.message)
            return
          }
          if (this.dialogTitle === '创建商户') {
            this.merchantList.push(res)
          } else {
            for (let _i = 0, len = this.merchantList.length; _i < len; _i++) {
              const item = this.merchantList[_i]
              if (item.IndexID === res.IndexID) {
                SetData(item, res)
                break
              }
            }
          }
        })
        this.dialogVisible = false
      })
    },
    handleEdit(index, row) {
      console.log('编辑', index, row)
      this.dialogTitle = '编辑商户'
      this.formData = Copy(row)
      this.dialogVisible = true
    },
    handleDelete(index, row) {
      console.log('删除', index, row)
      this.$confirm('确定要删除该商户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          merchant.delMerchant({ IndexID: row.IndexID }).then(res => {
            if (res.error) {
              this.handleImageError(1, '删除道具', res.error.message)
              return
            }
            this.merchantList.splice(index, 1)
          })
        })
        .catch(() => {})
    },
    async getMerchantList() {
      this.listLoading = true
      const params = { filterData: this.filterData }
      this.merchantList = await merchant.merchantList(params)
      console.log('商户列表：', this.merchantList)
      this.listLoading = false
    },
    handleClose(done) {
      this.$refs['ruleForm'].resetFields()
      done()
    }
  }
}
</script>
<style scoped>
.avatar-uploader {
  line-height: 0;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  /* overflow: hidden; */
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 79px;
  height: 79px;
  line-height: 79px;
  text-align: center;
  overflow: none;
}
.avatar {
  width: 79px;
  height: 79px;
  display: block;
}
</style>
