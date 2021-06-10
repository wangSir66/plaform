<template>
  <div class="app-container">
    <el-table
      v-loading="loading"
      element-loading-text="Loading"
      stripe
      highlight-current-row
      :span-method="cellMerge"
      :data="cities"
    >
      <el-table-column align="center" label="序号" type="index" width="60" />
      <el-table-column align="center" label="省份名称">
        <template slot-scope="scope">{{ scope.row.ProvinceName }}</template>
      </el-table-column>
      <el-table-column align="center" label="城市名称">
        <template slot-scope="scope">{{ scope.row.CityName }}</template>
      </el-table-column>
      <el-table-column align="center" label="排序标识">
        <template slot-scope="scope">{{ scope.row.OrderID }}</template>
      </el-table-column>
      <el-table-column width="300px" align="center">
        <template slot="header">
          <el-button size="mini" type="primary" @click="handleCreate">添加地市</el-button>
        </template>
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      center
      :title="dlgTitle"
      :before-close="handleClose"
      :visible.sync="cityDlgVisible"
      :close-on-click-modal="false"
      width="30%"
    >
      <el-form
        ref="cityRuleForm"
        label-position="right"
        label-width="80px"
        :rules="cityRules"
        :model="cityFormData"
      >
        <el-form-item label="省级城市" prop="ProvinceName">
          <!-- <el-select
            v-model="cityFormData.ProvinceName"
            placeholder="请选择"
            :disabled="dlgTitle==='编辑'"
          >
            <el-option v-for="(item, idx) in provinces" :key="idx" :label="item" :value="item" />
          </el-select>-->
          <el-input v-model="cityFormData.ProvinceName" :readonly="dlgTitle==='编辑'" />
        </el-form-item>
        <el-form-item label="城市名称" prop="CityName">
          <el-input v-model="cityFormData.CityName" :readonly="dlgTitle==='编辑'" />
        </el-form-item>
        <el-form-item label="排序标识">
          <el-input v-model.number="cityFormData.OrderID" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirm('cityRuleForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'Cities',
  data() {
    return {
      cities: [],
      provinces: ['四川', '重庆', '湖南', '广西', '广东', '海南'],
      loading: false,
      dlgTitle: '',
      cityDlgVisible: false,
      cityFormData: {},
      spanArr: [],
      cityRules: {
        ProvinceName: [
          { required: true, message: '请选择省级城市', trigger: 'blur' }
        ],
        CityName: [
          { required: true, message: '请输入地级城市名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchCities()
  },
  methods: {
    cellMerge({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const _row = this.spanArr[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
      if (columnIndex === 1) {
        const _row = this.spanArr[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    getSpanArr(data) {
      for (var i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanArr.push(1)
          this.pos = 0
        } else {
          // 判断当前元素与上一个元素是否相同
          if (data[i].ProvinceName === data[i - 1].ProvinceName) {
            this.spanArr[this.pos] += 1
            this.spanArr.push(0)
          } else {
            this.spanArr.push(1)
            this.pos = i
          }
        }
      }
      return this.spanArr
    },
    fetchCities() {
      this.spanArr = []
      this.loading = true
      request
        .get('cities')
        .then(res => {
          this.cities = res.data.sort((a, b) => {
            return a.ProvinceName.localeCompare(b.ProvinceName)
          })
          this.spanArr = this.getSpanArr(this.cities)
          this.loading = false
        })
        .catch(e => {
          this.loading = false
        })
    },
    handleClose(done) {
      this.$refs['cityRuleForm'].resetFields()
      done()
    },
    handleCreate() {
      this.dlgTitle = '添加城市'
      this.cityDlgVisible = true
      this.cityFormData = {
        OrderID: 0
      }
    },
    handleEdit(index, row) {
      this.dlgTitle = '编辑'
      this.cityDlgVisible = true
      this.cityFormData = Object.assign({}, row)
    },
    handleDelete(index, row) {
      this.$confirm('确定要删除该配置吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          await request.post('city/Del', { IndexID: row.IndexID })
          this.fetchCities()
        })
        .catch(() => {})
    },
    handleConfirm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = Object.assign({}, this.cityFormData)
          console.log('---', data)

          this.cityDlgVisible = false
          this.$refs[formName].resetFields()
          if (this.dlgTitle === '添加城市') {
            request.post('city/Add', data).then(() => {
              this.fetchCities()
            })
          } else {
            request.post('city/Modify', data).then(res => {
              this.fetchCities()
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
