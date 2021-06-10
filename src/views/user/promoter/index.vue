<template>
  <div class="app-container">
    <el-form :inline="true" :model="filterData">
      <el-form-item label="查找推广员">
        <el-input
          v-model="filterData.user"
          placeholder="ID或手机或推广码"
          :clearable="true"
          @clear="clearFilterData('user')"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button v-if="hiddenforyunwei" type="primary" @click="handleResetPhone">重置手机</el-button>
        <el-button v-if="hiddenforyunwei" type="primary" @click="handleResetPassword">重置登录密码</el-button>
      </el-form-item>
    </el-form>
    <el-form :inline="true" :model="filterData">
      <el-form-item label="代理过滤">
        <el-checkbox-group v-model="filterData.role" @change="handleQuery">
          <el-checkbox :label="0">超管</el-checkbox>
          <el-checkbox :label="1">一级</el-checkbox>
          <el-checkbox :label="2">二级</el-checkbox>
          <el-checkbox :label="3">三级</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <el-table
      ref="users"
      v-loading="loading"
      stripe
      :data="users"
      @selection-change="handleSelectionChange"
    >
      <el-table-column align="center" type="selection" />
      <el-table-column type="index" label="序号" align="center" />
      <el-table-column label="推广员ID" align="center" prop="IndexID" />
      <el-table-column label="手机" align="center" prop="Account" />
      <el-table-column label="密码" align="center" prop="Password" />
      <el-table-column label="推广员标识" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.Role === 0">超管</span>
          <span v-else-if="scope.row.Role === 1">一级推广员</span>
          <span v-else-if="scope.row.Role === 2">二级推广员</span>
          <span v-else-if="scope.row.Role === 3">三级推广员</span>
        </template>
      </el-table-column>
      <el-table-column label="上级ID" align="center" prop="HigherLevel" />
      <el-table-column label="分成比例" align="center" prop="ShareRatio" />
      <el-table-column label="推广码" align="center" prop="Code" />
      <el-table-column label="备注信息" align="center" prop="Remarks" />
      <el-table-column v-if="users.length > 0" fixed="right" align="center" label="操作" width="180">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleLookupUser(scope.row)">详情</el-button>
          <el-button
            v-if="!scope.row.Disabled"
            type="danger"
            size="small"
            @click="handleDisableUser(scope.row)"
          >禁用</el-button>
          <el-button v-else type="info" size="small" @click="handleDisableUser(scope.row)">解禁</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="sizes, prev, pager, next"
      :hide-on-single-page="true"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageCount"
      :total="count"
      :current-page.sync="pageIndex"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-dialog
      title="详情"
      center
      :visible.sync="UserDetailDlg"
      :close-on-click-modal="false"
      width="70%"
    >
      <el-tabs @tab-click="changePanel">
        <el-tab-pane label="地域权限">
          <el-checkbox
            v-for="idx of myCity"
            :key="idx.IndexID"
            :label="idx.IndexID"
            checked
            disabled
          >{{ idx.CityName }}</el-checkbox>
        </el-tab-pane>
        <el-tab-pane label="游戏权限">
          <el-checkbox
            v-for="game of myGame"
            :key="game.GameID"
            :label="game.GameID"
            checked
            disabled
          >{{ game.Name }}</el-checkbox>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <el-dialog
      center
      :title="resetTitle"
      :before-close="handleCloseResetDlg"
      :visible.sync="visibleResetDlg"
      :close-on-click-modal="false"
      width="30%"
    >
      <el-form
        ref="ResetRuleForm"
        label-position="left"
        label-width="160px"
        :rules="ResetRules"
        :model="formResetData"
      >
        <el-form-item label="操作">
          <el-radio-group v-model="resetNull" @change="resetNullChange">
            <el-radio v-if="resetFlag != 1" label="1">置空</el-radio>
            <el-radio label="2">手动输入</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="labelName">
          <span v-if="resetNull === '1'">空</span>
          <el-input v-else v-model="formResetData.Phone" :placeholder="initPassword" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          :loading="ResetPhoneLoading"
          type="primary"
          @click="handleConfirmReset('ResetRuleForm')"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import promoter from '@/api/promoter'
import game from '@/api/platform'
import store from '../../../store'
import { Password } from '@/utils/encryptor'

export default {
  name: 'Promoter',
  data() {
    return {
      initPassword: '',
      resetFlag: undefined,
      labelName: '手机号',
      resetNull: '1',
      formResetData: {
        Phone: undefined
      },
      ResetPhoneLoading: false,
      visibleResetDlg: false,
      resetTitle: '重置',
      hiddenforyunwei: true,
      UserDetailDlg: false,
      loading: false,
      pageIndex: 1,
      pageCount: 10,
      count: 0,
      users: [],
      selectionRows: [],
      filterData: {
        user: undefined,
        role: []
      },
      ResetRules: {
        Phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
      },
      CityAndGame: undefined,
      cities: [],
      myCity: [],
      myGame: []
    }
  },
  async created() {
    this.fetchUsers()
    if (store.getters.roles === 'yunwei') {
      this.hiddenforyunwei = false
    }
    const city = await game.getCities()
    const games = await game.gameList()
    console.log('城市列表--游戏列表->', city.data, games.data)
    this.cities = city.data
    this.games = games.data
  },
  methods: {
    initCity() {
      this.myCity = this.cities.filter(c => this.CityAndGame.Cities.includes(c.IndexID))
    },
    initGame() {
      this.myGame = this.games.filter(c => this.CityAndGame.GameIDs.includes(c.GameID))
    },
    changePanel(panel) {
      if (!this.CityAndGame) return
      if (panel.label === '地域权限') {
        this.initCity()
      } else if (panel.label === '游戏权限') {
        this.initGame()
      } else {
        console.log('没有此选项卡')
      }
    },
    handleResetPhone(row) {
      if (this.selectionRows.length === 1) {
        // 重置手机
        this.resetFlag = 1
        this.labelName = '手机号'
        this.resetTitle = '重置手机'
        this.visibleResetDlg = true
      } else {
        this.$message.error('请选择一个玩家')
      }
    },
    handleResetPassword(row) {
      if (this.selectionRows.length === 1) {
        // 重置登录密码
        this.resetFlag = 2
        this.labelName = '密码'
        this.initPassword = '123456'
        this.resetTitle = '重置登录密码'
        this.visibleResetDlg = true
      } else {
        this.$message.error('请选择一个玩家')
      }
    },
    resetNullChange(val) {
      if (val === '1') {
        this.formResetData = {
          Phone: null
        }
      }
    },
    handleConfirmReset(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          if (this.resetFlag === 1) {
            // 检查手机是否被占用
            const param = {
              Phone: this.formResetData.Phone,
              Flag: 0
            }
            try {
              if (this.resetNull === '2') {
                const res = await promoter.queryPhoneUsed(param)
                if (res.data || res.error) {
                  this.$message.error(res.error ? res.error.message : '该手机号被占用')
                  return
                } else {
                  // 未占用可以修改
                  const param1 = {
                    IndexID: this.selectionRows[0].IndexID,
                    Phone: this.formResetData.Phone || null
                  }
                  const res1 = await promoter.bindPhone(param1)
                  if (res1.error) this.$message.error(res1.error.message)
                  else if (res1.data.Ok) {
                    this.$message.success('绑定成功')
                    this.visibleResetDlg = false
                    this.formResetData = {}
                    this.fetchUsers()
                  } else {
                    this.$message.success('绑定失败')
                  }
                }
              } else {
                this.$message.error('推广员手机号不允许置空')
                // // 置空可以修改
                // const param1 = {
                //   IndexID: this.selectionRows[0].IndexID,
                //   Phone: this.formResetData.Phone || null
                // }
                // const res1 = await promoter.bindPhone(param1)
                // if (res1.data.Ok) {
                //   this.$message.success('置空成功')
                //   this.visibleResetDlg = false
                //   this.formResetData = {}
                //   this.fetchUsers()
                // } else {
                //   this.$message.success('置空失败')
                // }
              }
            } catch (error) {
              console.log(error)
            }
          } else if (this.resetFlag === 2) {
            const passwordParam = {
              Password: Password(this.formResetData.Phone),
              IndexID: this.selectionRows[0].IndexID
            }
            const res = await promoter.resetUserLoginPassword(passwordParam)
            if (res.data.Ok) {
              this.$message.success('重置密码成功')
              this.visibleResetDlg = false
              this.formResetData = {}
              this.fetchUsers()
            } else {
              this.$message.success('重置密码失败')
            }
          }
        }
      })
    },
    handleCloseResetDlg(done) {
      this.formResetData = {}
      done()
    },
    async fetchUsers() {
      this.loading = true
      const res = await promoter.promoterList({ filterData: this.filterData, pageIndex: this.pageIndex, pageCount: this.pageCount })
      if (res.error) {
        console.error(res.error.message)
        this.loading = false
        return
      }
      this.users = res.data.List
      console.log('推广员', this.users)
      this.count = res.data.Count
      this.loading = false
    },
    clearFilterData(key) {
      delete this.filterData[key]
      this.handleQuery()
    },
    handleQuery() {
      this.fetchUsers()
    },
    handleSizeChange(val) {
      this.pageCount = val
      this.fetchUsers()
    },
    handleCurrentChange(val) {
      this.pageIndex = val
      this.fetchUsers()
    },
    handleLookupUser(row) {
      this.UserDetailDlg = true
      this.CityAndGame = row
      this.initCity()
      this.initGame()
    },
    handleDisableUser(row) {
      this.$confirm(`确定要${row.Disabled ? '解禁' : '禁用'}吗?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await promoter.promoterDis({ IndexID: row.IndexID, Disabled: !row.Disabled })
        this.fetchUsers()
      }).catch(() => {})
    },
    handleSelectionChange(val) {
      this.selectionRows = val
    }
  }
}
</script>
