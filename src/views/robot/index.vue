<template>
  <div class="app-container">
    <el-table
      v-loading="loading"
      element-loading-text="Loading"
      stripe
      highlight-current-row
      :data="list"
    >
      <el-table-column align="center" label="序号" type="index" width="60" />
      <el-table-column align="center" label="游戏图标">
        <template slot-scope="scope">
          <el-image :src="scope.row.Info.Icon" style="width: 64px;height: 64px" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="游戏名称">
        <template slot-scope="scope">{{ scope.row.Info.Name }}</template>
      </el-table-column>
      <el-table-column align="center" label="比赛时间">
        <template slot-scope="scope">{{ parseTime(scope.row.StartTime) }}</template>
      </el-table-column>
      <el-table-column align="center" label="报名人数/总人数">
        <template slot-scope="scope">{{ scope.row.UserIDs.length }}/{{ scope.row.PeopleNum }}</template>
      </el-table-column>
      <el-table-column align="center" label="比赛状态">
        <template slot-scope="scope">{{ status[scope.row.Status] }}</template>
      </el-table-column>
      <el-table-column width="300px" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleAdd(scope.$index, scope.row)">添加机器人</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      center
      :title="dlgTitle"
      :before-close="handleClose"
      :visible.sync="robotDlgVisible"
      :close-on-click-modal="false"
      width="30%"
    >
      <el-form
        ref="robotRuleForm"
        label-position="right"
        label-width="120px"
        :rules="robotRules"
        :model="robotFormData"
      >
        <el-form-item label="比赛名称" prop="ID">
          <el-input v-model="robotFormData.Info.Name" />
        </el-form-item>
        <el-form-item label="机器人数量" prop="Count">
          <el-input v-model="robotFormData.Count" />
        </el-form-item>
        <!-- <el-form-item label="开始时间" prop="StartTime">
          <el-input v-model="robotFormData.StartTime" />
        </el-form-item>-->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirm('robotRuleForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import robot from '@/api/robot'
import { parseTime } from '@/utils/index'

export default {
  name: 'Robot',
  data() {
    return {
      list: [],
      loading: false,
      dlgTitle: '',
      robotDlgVisible: false,
      robotFormData: { Info: {} },
      spanArr: [],
      status: robot.MatchStatus,
      robotRules: {
        Count: [
          { required: true, message: '请输入机器人数量', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!Number.isInteger(Number(value))) {
                callback(new Error('请输入正整数'))
              } else if (
                Number(value) >
                this.robotFormData.PeopleNum - this.robotFormData.UserIDs.length
              ) {
                callback(new Error('机器人数量太多'))
              } else {
                callback()
              }
            },
            trigger: ['blur']
          }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    parseTime(time) {
      return parseTime(time)
    },
    async fetchData() {
      const res = await robot.matchList()
      this.list = res
      console.log('--99', res)
    },
    handleAdd(index, row) {
      this.dlgTitle = '添加机器人'
      this.robotDlgVisible = true
      console.log(row)
      this.robotFormData = Object.assign({}, row)
    },
    handleClose(done) {
      this.$refs['robotRuleForm'].resetFields()
      done()
    },
    handleDelete(index, row) {
      this.$confirm('确定要删除该配置吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          await request.post('robot/Del', { IndexID: row.IndexID })
          this.fetchCities()
        })
        .catch(() => {})
    },
    handleConfirm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = Object.assign(
            {},
            {
              Count: this.robotFormData.Count,
              MatchID: this.robotFormData.ID,
              StartTime: this.robotFormData.StartTime,
              UserIDs: this.robotFormData.UserIDs
            }
          )
          console.log('---', data)
          this.robotDlgVisible = false
          this.$refs[formName].resetFields()
          request.post('addRobot', data).then(() => {
            this.fetchData()
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>
