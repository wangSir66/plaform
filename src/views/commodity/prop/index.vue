<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="propList"
      element-loading-text="Loading"
      stripe
      highlight-current-row
    >
      <el-table-column align="center" label="序号" type="index" />
      <el-table-column align="center" label="图标">
        <template slot-scope="scope">
          <div v-for="item of scope.row.Picture" :key="item.name">
            <el-image :src="item.url" style="width: 64px;height: 64px" @error="handleImageError" />
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">{{ scope.row.Name }}</template>
      </el-table-column>
      <el-table-column align="center" label="类型">
        <template slot-scope="scope">{{ propType.filter(p=>p.key === scope.row.Type)[0].label }}</template>
      </el-table-column>
      <el-table-column align="center" label="有效期">
        <template
          slot-scope="scope"
        >{{ parseTime(new Date(scope.row.StartTime).getTime()) }} {{ parseTime(new Date(scope.row.EndTime).getTime()) }}</template>
      </el-table-column>
      <el-table-column align="center" label="说明">
        <template slot-scope="scope">{{ scope.row.Instructions }}</template>
      </el-table-column>
      <el-table-column align="center" label="详情">
        <template slot-scope="scope">{{ scope.row.Details }}</template>
      </el-table-column>
      <el-table-column align="center" label="关联商户">
        <template slot-scope="scope">{{ getMerchantName(scope.row) }}</template>
      </el-table-column>
      <el-table-column align="center" label="市场价" prop="MarketValue" />
      <el-table-column align="center" label="成本价" prop="CostPrice" />
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">{{ propState.filter(p=>p.key === scope.row.State)[0].label }}</template>
      </el-table-column>
      <el-table-column width="360px" align="center">
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
        <el-form-item label="名称" prop="Name">
          <el-input v-model="formData.Name" placeholder="道具名称，限15个字" maxlength="15" />
        </el-form-item>
        <el-form-item label="有效期" prop="StartTime">
          <el-date-picker v-model="formData.StartTime" type="datetime" placeholder="选择日期时间" />---
          <el-date-picker v-model="formData.EndTime" type="datetime" placeholder="选择日期时间" />
        </el-form-item>
        <el-form-item v-if="0" prop="EndTime"></el-form-item>
        <el-form-item label="类型" prop="Type">
          <el-select v-model="formData.Type" placeholder="请选择">
            <el-option
              v-for="item in propType"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="State">
          <el-select v-model="formData.State" placeholder="请选择">
            <el-option
              v-for="item in propState"
              :key="item.key"
              :label="item.label"
              :value="item.key"
              :disabled="item.key===2"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="说明" prop="Instructions">
          <el-input
            v-model="formData.Instructions"
            type="textarea"
            maxlength="100"
            :rows="5"
            placeholder="请输入使用说明，限100字"
          />
        </el-form-item>
        <el-form-item label="详情" prop="Details">
          <el-input
            v-model="formData.Details"
            maxlength="100"
            type="textarea"
            :rows="5"
            placeholder="请输入详情，限100字"
          />
        </el-form-item>
        <el-form-item v-if="formData.Type === propType[1].key" label="关联商户" prop="MerchantID">
          <el-select v-model="formData.MerchantID" placeholder="请选择">
            <el-option
              v-for="item in merchantList"
              :key="item.IndexID"
              :label="item.Name"
              :value="item.IndexID"
            />
          </el-select>
          <p>{{ getMerchantConnet(formData.MerchantID) }}</p>
        </el-form-item>
        <el-form-item label="市场价" prop="MarketValue">
          <el-input
            v-model="formData.MarketValue"
            placeholder="市场价"
            oninput="value=value.replace(/[^0-9.]/g,'')"
          />
        </el-form-item>
        <el-form-item label="成本价" prop="CostPrice">
          <el-input
            v-model="formData.CostPrice"
            placeholder="成本价"
            oninput="value=value.replace(/[^0-9.]/g,'')"
          />
        </el-form-item>
        <el-form-item label="图标" prop="Icon">
          <el-upload
            class="avatar-uploader"
            multiple
            accept="image/jpeg, image/png"
            :on-remove="handleRemove"
            :action="uploadPath"
            :show-file-list="true"
            :file-list="fileList"
            list-type="picture-card"
            :http-request="uploadFile"
            :before-upload="beforeUpload"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirm('ruleForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import prop from '@/api/prop'
import merchant from '@/api/merchant'
import { parseTime } from '@/utils/index'
import { Copy, ErrorTip, SetData } from '@/utils/util'
import settings from '@/settings'
import request from '@/utils/request'
export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    const validateMoney = (rule, value, callback) => {
      if (!value) {
        callback(new Error('价格不能为空'))
      } else if (String(value).split('.').length > 2) {
        callback(new Error('输入正确格式的价格')) // 防止输入多个小数点
      } else {
        callback()
      }
    }
    return {
      IconNum: 1,
      uploadPath: `${settings.baseUrl}/upload`,
      listLoading: true,
      propList: [],
      merchantList: [],
      handleImageError: ErrorTip,
      propType: prop.PropType,
      propState: prop.PropState,
      parseTime: parseTime,
      dialogTitle: '',
      dialogVisible: false,
      rules: {
        Details: [
          { required: true, message: '请输入道具详情', trigger: 'blur' }
        ],
        Instructions: [
          { required: true, message: '请输入道具说明', trigger: 'blur' }
        ],
        State: [{ required: true, message: '请选择道具状态', trigger: 'blur' }],
        Type: [{ required: true, message: '请选择道具类型', trigger: 'blur' }],
        StartTime: [
          { required: true, message: '请选择有效期：起始', trigger: 'blur' }
        ],
        EndTime: [
          { required: true, message: '请选择有效期：终止', trigger: 'blur' }
        ],
        Name: [{ required: true, message: '请输入道具名称', trigger: 'blur' }],
        MarketValue: [
          {
            required: true,
            trigger: 'blur',
            validator: validateMoney
          }
        ],
        CostPrice: [
          {
            required: true,
            trigger: 'blur',
            validator: validateMoney
          }
        ]
      },
      formData: {
        Picture: []
      },
      fileList: []
    }
  },
  created() {
    this.getPropList()
  },
  methods: {
    async handleRemove(file, fileList) {
      this.formData.Picture = fileList
    },
    addItem() {
      this.IconNum++
    },
    minusItem() {
      if (this.IconNum === 1) return
      this.IconNum--
    },
    handleCreate() {
      this.fileList = []
      console.log('创建')
      this.dialogTitle = '创建'
      this.formData = {
        Picture: []
      }
      setTimeout(() => {
        this.dialogVisible = true
      }, 150)
    },
    handleConfirm(formName) {
      this.$refs[formName].validate(val => {
        if (!val) return
        if (!this.formData.Picture) this.formData.Picture = []
        const data = Object.assign({}, this.formData)
        this.listLoading = true
        prop.updateProp(data).then(res => {
          if (res.error) {
            this.handleImageError(1, '编辑/创建道具', res.error.message)
            return
          }
          this.getPropList()
          this.fileList = []
          this.listLoading = false
        })
        this.dialogVisible = false
      })
    },
    handleEdit(index, row) {
      console.log('编辑', index, row)
      this.dialogTitle = '编辑'
      this.formData = Object.assign({}, row)
      this.fileList = JSON.parse(JSON.stringify(this.formData.Picture))
      this.dialogVisible = true
    },
    handleDelete(index, row) {
      console.log('删除', index, row)
      this.$confirm('确定要删除该道具吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          prop.delProp({ ItemID: row.ItemID }).then(res => {
            if (res.error) {
              this.handleImageError(1, '删除道具', res.error.message)
              return
            }
            this.propList.splice(index, 1)
          })
        })
        .catch(() => {})
    },
    async getPropList() {
      this.listLoading = true
      this.propList = await prop.propList()
      console.log('道具列表：', this.propList)
      this.merchantList = await merchant.merchantList()
      console.log('商户列表：', this.merchantList)
      this.listLoading = false
    },
    getMerchantName(row) {
      let str = ''
      if (row.Type === this.propType[1].key) {
        for (let _in = 0, len = this.merchantList.length; _in < len; _in++) {
          const m = this.merchantList[_in]
          m.IndexID === row.MerchantID && (str = m.Name)
        }
      }
      return !str ? '无' : str
    },
    getMerchantConnet(id) {
      let str = ''
      for (let _in = 0, len = this.merchantList.length; _in < len; _in++) {
        const m = this.merchantList[_in]
        if (m.IndexID === id) {
          str = `联系方式：${m.ContactInfo}\n地址：${m.Address}`
        }
      }
      return str
    },
    handleClose(done) {
      this.$refs['ruleForm'].resetFields()
      this.fileList = []
      done()
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
    async uploadFile(req) {
      const formData = new FormData()
      formData.append('file', req.file)
      const res = await request.post(`${settings.baseUrl}/upload`, formData)
      if (res && res.name) {
        const data = Object.assign(
          {},
          JSON.parse(JSON.stringify(this.formData))
        )
        data.Picture.push({ name: res.name, url: res.url })
        this.formData = data
      }
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
