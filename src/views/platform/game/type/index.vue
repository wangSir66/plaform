<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      stripe
      highlight-current-row
    >
      <el-table-column align="center" label="序号" type="index" />
      <el-table-column align="center" label="推荐标识">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.RecommendID" type="success">推荐</el-tag>
          <el-tag v-else type="info">不推荐</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="类型名称">
        <template slot-scope="scope">{{ scope.row.Name }}</template>
      </el-table-column>
      <el-table-column align="center" label="排序标识">
        <template slot-scope="scope">{{ scope.row.OrderID }}</template>
      </el-table-column>
      <el-table-column width="200px" align="center">
        <template slot="header">
          <el-button size="mini" type="primary" @click="handleCreate">创建</el-button>
        </template>
        <template slot-scope="scope">
          <el-button size="mini" type="info" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
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
      width="30%"
    >
      <el-form
        ref="ruleForm"
        label-position="right"
        label-width="80px"
        :rules="rules"
        :model="formData"
      >
        <el-form-item label="推荐标识">
          <el-radio-group v-model="formData.RecommendID">
            <el-radio :label="0">不推荐</el-radio>
            <el-radio :label="1">推 荐</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="类型名称" prop="Name">
          <el-input v-model="formData.Name" />
        </el-form-item>
        <el-form-item label="排序标识">
          <el-input v-model.number="formData.OrderID" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirm('ruleForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import platform from '@/api/platform'

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
    return {
      list: null,
      dialogTitle: '',
      dialogVisible: false,
      formData: {},
      listLoading: true,
      rules: {
        Name: [
          { required: true, message: '请输入游戏类型名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = false
      platform.GetGameTypeList().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    handleCreate() {
      this.dialogTitle = '创建'
      this.formData = {
        Name: '',
        RecommendID: 0,
        OrderID: 0
      }
      this.dialogVisible = true
    },
    handleEdit(index, row) {
      this.dialogTitle = '编辑'
      this.formData = Object.assign({}, row)
      this.dialogVisible = true
    },
    handleDelete(index, row) {
      this.$confirm('确定要删除该游戏类型吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await platform.RemoveGameType({ IndexID: row.IndexID })
        this.fetchData()
      }).catch(() => {})
    },
    handleClose(done) {
      this.$refs['ruleForm'].resetFields()
      done()
    },
    handleConfirm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = Object.assign({}, this.formData)
          this.dialogVisible = false
          this.$refs[formName].resetFields()
          if (this.dialogTitle === '创建') {
            platform.AddGameType(data).then(res => {
              this.fetchData()
            })
          } else {
            platform.ModifyGameType(data).then(res => {
              this.fetchData()
            })
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>
