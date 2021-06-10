<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="shopList"
      element-loading-text="Loading"
      stripe
      highlight-current-row
    >
      <el-table-column align="center" label="序号" type="index" />
      <el-table-column align="center" label="所属分类">
        <template slot-scope="scope">{{ type.filter(c=>c.key===scope.row.ExchangeType)[0].label }}</template>
      </el-table-column>
      <el-table-column align="center" label="道具（类型/名称）">
        <template slot-scope="scope">{{ getShopName(scope.row) }}</template>
      </el-table-column>
      <el-table-column align="center" label="道具数量">
        <template slot-scope="scope">{{ scope.row.ItemNum }}</template>
      </el-table-column>
      <el-table-column align="center" label="兑换消耗类型">
        <template slot-scope="scope">{{ consumeType.filter(c=>c.key===scope.row.ConsumeType)[0].label }}</template>
      </el-table-column>
      <el-table-column align="center" label="消耗数量">
        <template slot-scope="scope">{{ scope.row.ConsumeNum }}</template>
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
        <el-form-item label="所属分类" prop="ExchangeType">
          <el-select v-model="formData.ExchangeType" placeholder="请选择">
            <el-option
              v-for="item in type"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品类型" prop="Type">
          <el-select v-model="formData.Type" placeholder="请选择">
            <el-option
              v-for="item in propType"
              :key="item.type"
              :label="item.name"
              :value="item.type"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formData.Type === propType[3].type" label="道具名称" prop="ItemID">
          <el-select v-model="formData.ItemID" placeholder="请选择">
            <el-option
              v-for="pro in propList"
              :key="pro.ItemID"
              :label="pro.Name"
              :value="pro.ItemID"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="道具数量" prop="ItemNum">
          <el-input v-model="formData.ItemNum" @input="formData.ItemNum = ((str) => { return str.replace(/[^\d]/g, '') })(formData.ItemNum)" />
        </el-form-item>
        <el-form-item label="兑换消耗" prop="ConsumeType">
          <el-select v-model="formData.ConsumeType" placeholder="请选择">
            <el-option
              v-for="item in consumeType"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消耗数量" prop="ConsumeNum">
          <el-input v-model="formData.ConsumeNum" @input="formData.ConsumeNum = ((str) => { return str.replace(/[^\d]/g, '') })(formData.ConsumeNum)" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirm('ruleForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import shop from '@/api/shop'
import { Copy, ErrorTip, SetData } from '@/utils/util'
import prop from '@/api/prop'
import match from '@/api/match'
export default {
  data() {
    return {
      listLoading: true,
      shopList: [],
      propList: [],
      handleImageError: ErrorTip,
      consumeType: shop.ConsumeType,
      type: shop.ItemType,
      propType: match.RewardType,
      dialogTitle: '',
      dialogVisible: false,
      rules: {
        ExchangeType: [{ required: true, message: '请选择所属类型', trigger: 'blur' }],
        Type: [{ required: true, message: '请选择道具类型', trigger: 'blur' }],
        ItemNum: [{ required: true, message: '请输入道具数量', trigger: 'blur' }],
        ItemID: [{ required: true, message: '请选择道具', trigger: 'blur' }],
        ConsumeType: [{ required: true, message: '请选择兑换消耗类型', trigger: 'blur' }],
        ConsumeNum: [{ required: true, message: '请输入兑换消耗数量', trigger: 'blur' }]
      },
      formData: {}
    }
  },
  created() {
    this.getShopList()
  },
  methods: {
    handleCreate() {
      console.log('创建')
      this.dialogTitle = '创建'
      this.formData = {}
      this.dialogVisible = true
    },
    handleConfirm(formName) {
      this.$refs[formName].validate(val => {
        if (!val) return
        const data = Object.assign({}, this.formData)
        this.listLoading = true
        shop.updateShop(data).then(res => {
          if (res.error) {
            this.handleImageError(1, '编辑/创建商品', res.error.message)
            return
          }
          if (this.dialogTitle === '创建') {
            this.shopList.push(res)
          } else {
            for (let _i = 0, len = this.shopList.length; _i < len; _i++) {
              const item = this.shopList[_i]
              if (item.IndexID === res.IndexID) {
                SetData(item, res)
                break
              }
            }
          }
          this.listLoading = false
        })
        this.dialogVisible = false
      })
    },
    handleEdit(index, row) {
      console.log('编辑', index, row)
      this.dialogTitle = '编辑'
      this.formData = Copy(row)
      this.dialogVisible = true
    },
    handleDelete(index, row) {
      console.log('删除', index, row)
      this.$confirm('确定要删除该商品吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        shop.delShop({ IndexID: row.IndexID }).then(res => {
          if (res.error) {
            this.handleImageError(1, '删除道具', res.error.message)
            return
          }
          this.shopList.splice(index, 1)
        })
      }).catch(() => {})
    },
    async getShopList() {
      this.listLoading = true
      this.propList = await prop.propList()
      console.log('物品列表：', this.propList)
      this.shopList = await shop.shopList()
      console.log('商城列表：', this.shopList)
      this.listLoading = false
    },
    getShopName(rItem) {
      if (rItem.Type === this.propType[3].type) {
        for (let _i = 0; _i < this.propList.length; _i++) {
          const prop = this.propList[_i]
          if (prop.ItemID === rItem.ItemID) return prop.Name
        }
      } else {
        for (const item of this.propType) {
          if (item.type === rItem.Type) return item.name
        }
      }
      return '未知类型'
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
