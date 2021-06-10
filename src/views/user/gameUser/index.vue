<template>
  <div class="app-container">
    <el-form :inline="true" :model="filterData">
      <el-form-item label="查找玩家">
        <el-input
          v-model="filterData.user"
          placeholder="玩家ID或昵称或手机"
          :clearable="true"
          @clear="clearFilterData('user')"
        />
      </el-form-item>
      <el-form-item label="上级代理">
        <el-input
          v-model="filterData.superior"
          type="text"
          :clearable="true"
          @clear="clearFilterData('superior')"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button v-if="hiddenforyunwei" type="primary" @click="handlePresentGold">赠送金币</el-button>
        <el-button v-if="hiddenforyunwei" type="primary" @click="handlePresentDiamond">赠送钻石</el-button>
        <el-button v-if="hiddenforyunwei" type="primary" @click="handlePresentDJQ">赠送代金券</el-button>
        <!-- <el-button v-if="hiddenforyunwei" type="primary" @click="handleSetRole">代理设置</el-button> -->
        <el-button v-if="hiddenforyunwei" type="primary" @click="handleResetPhone">重置手机</el-button>
        <el-button v-if="hiddenforyunwei" type="primary" @click="handleResetPassword">重置登录密码</el-button>
        <el-button v-if="hiddenforyunwei" type="primary" @click="handleNullityUser">注销账号</el-button>
      </el-form-item>
    </el-form>
    <el-form :inline="true" :model="filterData">
      <el-form-item label="性别过滤">
        <el-select
          v-model="filterData.gender"
          clearable
          placeholder="全部显示"
          @change="handleQuery"
          @clear="clearFilterData('gender')"
        >
          <el-option label="仅显示男玩家" :value="1" />
          <el-option label="仅显示女玩家" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="禁用过滤">
        <el-select
          v-model="filterData.disable"
          clearable
          placeholder="全部显示"
          @change="handleQuery"
          @clear="clearFilterData('disable')"
        >
          <el-option label="仅显示禁用玩家" :value="true" />
          <el-option label="仅显示未禁用玩家" :value="false" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="代理过滤">
        <el-checkbox-group v-model="filterData.role" @change="handleQuery">
          <el-checkbox :label="4096">超管</el-checkbox>
          <el-checkbox :label="128">超代</el-checkbox>
          <el-checkbox :label="64">超二代</el-checkbox>
          <el-checkbox :label="256">超三代</el-checkbox>
          <el-checkbox :label="33">超级VIP</el-checkbox>
          <el-checkbox :label="16">省代</el-checkbox>
          <el-checkbox :label="8">市代</el-checkbox>
          <el-checkbox :label="4">一级代理</el-checkbox>
          <el-checkbox :label="2">二级代理</el-checkbox>
          <el-checkbox :label="1">VIP</el-checkbox>
        </el-checkbox-group>
      </el-form-item>-->
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
      <el-table-column label="头像" align="center">
        <template slot-scope="scope">
          <el-img v-if="scope.row.AvatarUrl !== ''" width="64" height="64" :src="scope.row.AvatarUrl" />
        </template>
      </el-table-column>
      <el-table-column label="昵称" align="center" prop="NickName" />
      <el-table-column label="玩家ID" align="center" prop="GameID" />
      <el-table-column label="UserID" align="center" prop="UserID" />
      <el-table-column label="手机" align="center" prop="Phone" />
      <el-table-column label="性别" align="center">
        <template slot-scope="scope">{{ scope.row.Gender === 1 ? "男" : scope.row.Gender === 2 ? "女" : "未知" }}</template>
      </el-table-column>
      <el-table-column label="推广码" align="center" prop="Code" />
      <el-table-column label="钻石" align="center" prop="Diamond" />
      <el-table-column label="代金券" align="center" prop="Vouchers" />
      <el-table-column label="金币" align="center" prop="Gold" />
      <el-table-column v-if="users.length > 0" fixed="right" align="center" label="操作" width="180">
        <template slot-scope="scope">
          <!-- <el-button type="primary" size="small" @click="handleLookupUser(scope.row)">详情</el-button> -->
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
      center
      :title="titlePresent"
      :before-close="handleClosePresentDlg"
      :visible.sync="visiblePresentDlg"
      :close-on-click-modal="false"
      width="30%"
    >
      <el-form
        ref="PresentRuleForm"
        label-position="right"
        label-width="80px"
        :rules="PresentRules"
        :model="formPresentData"
      >
        <el-form-item label="数量" prop="Count">
          <el-input v-model.number="formPresentData.Count" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirmPresent('PresentRuleForm')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      center
      title="代理设置"
      :before-close="handleCloseRoleEditDlg"
      :visible.sync="visibleRoleEditDlg"
      :close-on-click-modal="false"
      width="40%"
    >
      <el-form
        ref="RoleEditForm"
        label-position="right"
        label-width="80px"
        :rules="PresentRules"
        :model="formRoleEdit"
      >
        <el-form-item label="请选择:" prop="Role">
          <el-radio-group v-model="formRoleEdit.Role">
            <el-radio :label="128">超代</el-radio>
            <!--            <el-radio :label="64">超级二代</el-radio>-->
            <!--            <el-radio :label="33">超级VIP</el-radio>-->
            <el-radio :label="16">省代</el-radio>
            <!--            <el-radio :label="8">市级代理</el-radio>-->
            <!--            <el-radio :label="4">一级代理</el-radio>-->
            <!--            <el-radio :label="2">二级代理</el-radio>-->
            <!--            <el-radio :label="1">VIP</el-radio>-->
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirmRoleEdit('RoleEditForm')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="详情"
      center
      :visible.sync="UserDetailDlg"
      :close-on-click-modal="false"
      width="70%"
    >
      <el-tabs @tab-click="changePanel">
        <el-tab-pane label="基础信息"></el-tab-pane>
        <el-tab-pane label="游戏记录">
          <el-table :data="playRecord">
            <el-table-column align="center" label="序号" type="index" />
            <el-table-column align="center" label="时间" prop="RecordTime" />
            <el-table-column align="center" label="房间序号" prop="RoomIndex" />
            <el-table-column align="center" label="游戏名" prop="GameName" />
            <el-table-column align="center" label="得分" prop="Score" />
            <el-table-column align="center" label="进房时分数" prop="EnterScore" />
            <el-table-column align="center" label="离房时分数" prop="LeaveScore" />
            <el-table-column align="center">
              <template slot="header">操作</template>
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="GameDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            background
            layout="sizes, prev, pager, next"
            :hide-on-single-page="true"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="playRecordPageCount"
            :total="playRecordTotalCount"
            :current-page.sync="playRecordPageIndex"
            @size-change="handlePlayRecordSizeChange"
            @current-change="handlePlayRecordCurrentChange"
          />
        </el-tab-pane>
        <el-tab-pane label="财富记录">
          <el-table :data="TreasureRecord">
            <el-table-column align="center" label="时间" prop="RecordTime" />
            <el-table-column align="center" label="当前钻石" prop="LeftDiamond" />
            <el-table-column align="center" label="钻石修改" prop="DeltaDiamond" />
            <el-table-column align="center" label="当前金币" prop="LeftGold" />
            <el-table-column align="center" label="金币修改" prop="DeltaGold" />
            <el-table-column align="center" label="变动原因" prop="Reason" />
          </el-table>
          <el-pagination
            background
            layout="sizes, prev, pager, next"
            :hide-on-single-page="true"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="TreasureRecordPageCount"
            :total="TreasureRecordTotalCount"
            :current-page.sync="TreasureRecordPageIndex"
            @size-change="handleTreasureRecordSizeChange"
            @current-change="handleTreasureRecordCurrentChange"
          />
        </el-tab-pane>
        <el-tab-pane label="裁判记录">
          <el-form :inline="true" :model="UmpFilterData">
            <el-form-item>
              <el-date-picker
                v-model="UmpFilterData.StartDate"
                type="date"
                placeholder="开始日期"
                @clear="clearFilterData('StartDate')"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-date-picker
                v-model="UmpFilterData.EndDate"
                type="date"
                placeholder="截至日期"
                @clear="clearFilterData('EndDate')"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUmpQuery">查询</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="UmpRecord">
            <el-table-column align="center" label="序号" type="index" />
            <el-table-column align="center" label="亲友圈ID" prop="ClubID" />
            <el-table-column align="center" label="亲友圈名称" prop="ClubName" />
            <el-table-column align="center" label="操作前金币数量" prop="LeftScore">
              <template slot-scope="scope">{{ Number(scope.row.LeftScore) - Number(scope.row.ModifyScore) }}</template>
            </el-table-column>
            <el-table-column align="center" label="变化数量" prop="ModifyScore" />
            <el-table-column align="center" label="操作后金币数量" prop="LeftScore" />
            <el-table-column align="center" label="操作者昵称" prop="NickName" />
            <el-table-column align="center" label="操作者GameID" prop="GameID" />
            <el-table-column align="center" label="时间" width="220px" prop="RecordTime" />
          </el-table>
          <el-pagination
            background
            layout="sizes, prev, pager, next"
            :hide-on-single-page="true"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="UmpRecordPageCount"
            :total="UmpRecordTotalCount"
            :current-page.sync="UmpRecordPageIndex"
            @size-change="handleUmpRecordSizeChange"
            @current-change="handleUmpRecordCurrentChange"
          />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <el-dialog
      title="分数详情"
      center
      :visible.sync="ScoreDetailDlg"
      :close-on-click-modal="false"
      width="30%"
    >
      <el-table :data="scoreResult">
        <el-table-column align="center" label="序号" prop="RoundID" />
        <el-table-column align="center" label="得分" prop="Score" />
      </el-table>
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
            <el-radio label="1">置空</el-radio>
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
import request from '@/utils/request'
import { parseTime } from '@/utils/index'
import store from '../../../store'
import { Password } from '@/utils/encryptor'

export default {
  name: 'Cities',
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
      TreasureRecord: [],
      scoreResult: [],
      ScoreDetailDlg: false,
      playRecord: [],
      UserDetailDlg: false,
      UmpRecord: [],
      loading: false,
      pageIndex: 1,
      pageCount: 10,
      count: 0,
      playRecordPageIndex: 1,
      playRecordPageCount: 10,
      playRecordTotalCount: 0,
      TreasureRecordPageIndex: 1,
      TreasureRecordPageCount: 10,
      TreasureRecordTotalCount: 0,
      UmpRecordPageIndex: 1,
      UmpRecordPageCount: 10,
      UmpRecordTotalCount: 0,
      RecordUserID: undefined,
      titlePresent: '',
      visiblePresentDlg: false,
      visibleRoleEditDlg: false,
      formPresentData: {
        Count: undefined
      },
      formRoleEdit: {
        Role: undefined
      },
      users: [],
      selectionRows: [],
      filterData: {
        user: undefined,
        superior: undefined,
        gender: undefined,
        disable: undefined,
        role: []
      },
      UmpFilterData: {
        StartDate: undefined,
        EndDate: undefined
      },
      PresentRules: {
        Count: [{ required: true, message: '请输入赠送数量', trigger: 'blur' }]
      },
      ResetRules: {
        Phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
      },
      EditRoleRules: {
        Role: [{ required: true, message: '请选择代理级别', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchUsers()
    if (store.getters.roles === 'yunwei') {
      this.hiddenforyunwei = false
    }
  },
  methods: {
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
    handleNullityUser() {
      if (this.selectionRows.length === 0) {
        this.$message.error('请选择一个玩家')
      } else {
        this.$confirm('确定要注销该账号吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            const param = { UserID: this.selectionRows[0].UserID }
            const res = await request.post('nullityUser', param)
            if (res.data.Ok) {
              this.$message.success('注销成功')
              this.fetchUsers()
            } else {
              this.$message.success('注销失败')
            }
          })
          .catch(() => {})
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
                const res = await request.post('queryPhoneUsed', param)
                if (res.data) {
                  this.$message.error('该手机号被占用')
                  return
                } else {
                  // 未占用可以修改
                  const param1 = {
                    UserID: this.selectionRows[0].UserID,
                    Phone: this.formResetData.Phone || null
                  }
                  const res1 = await request.post('bindUserPhone', param1)
                  if (res1.data.Ok) {
                    this.$message.success('绑定成功')
                    this.visibleResetDlg = false
                    this.formResetData = {}
                    this.fetchUsers()
                  } else {
                    this.$message.success('绑定失败')
                  }
                }
              } else {
                // 置空可以修改
                const param1 = {
                  UserID: this.selectionRows[0].UserID,
                  Phone: this.formResetData.Phone || null
                }
                const res1 = await request.post('bindUserPhone', param1)
                if (res1.data.Ok) {
                  this.$message.success('置空成功')
                  this.visibleResetDlg = false
                  this.formResetData = {}
                  this.fetchUsers()
                } else {
                  this.$message.success('置空失败')
                }
              }
            } catch (error) { this.$message.success(error) }
          } else if (this.resetFlag === 2) {
            const passwordParam = {
              Password: Password(this.formResetData.Phone),
              UserID: this.selectionRows[0].UserID
            }
            const res = await request.post(
              'resetUserLoginPassword',
              passwordParam
            )
            if (res.data.Ok) {
              this.$message.success('重置密码成功')
              this.visibleResetDlg = false
              this.formResetData = {}
            } else {
              this.$message.success('重置密码失败')
            }
          }
        }
      })
    },
    async handleRemoveBind() {
      this.$confirm('确定要解除绑定吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const param = { UserID: this.selectionRows[0].UserID }
          const res = await request.post('unbindUserPhone', param)
          if (res.data.Ok) {
            this.$message.success('解绑成功')
          }
        })
        .catch(() => {})
    },

    handleCloseResetDlg(done) {
      this.formResetData = {}
      done()
    },
    handleUmpQuery() {
      this.fetchUmpRecord()
    },
    fetchUsers() {
      this.loading = true
      request
        .post('/userList', {
          filterData: this.filterData,
          pageIndex: this.pageIndex,
          pageCount: this.pageCount
        })
        .then(res => {
          this.users = res.data.users
          console.log('玩家数据', this.users)
          this.count = res.data.count
          this.loading = false
        })
        .catch(e => {
          this.loading = false
        })
    },
    // 财富记录
    async fetchTreasureRecord() {
      const data = {
        PageIndex: this.TreasureRecordPageIndex - 1,
        PageCount: this.TreasureRecordPageCount,
        UserID: this.RecordUserID
      }
      const result = await request.post('user/TreasureRecord', data)
      this.TreasureRecord = result.data[0]
      this.TreasureRecordTotalCount = result.data[1]
      for (const index in this.TreasureRecord) {
        this.TreasureRecord[index].RecordTime = parseTime(
          this.TreasureRecord[index].RecordTime
        )
      }
    },
    // 游戏记录
    async fetchPlayRecord() {
      const data = {
        PageIndex: this.playRecordPageIndex - 1,
        PageCount: this.playRecordPageCount,
        UserID: this.RecordUserID
      }
      const result = await request.post('user/PlayRecord', data)
      this.playRecord = result.data[0]
      this.playRecordTotalCount = result.data[1]
      for (const index in this.playRecord) {
        this.playRecord[index].RecordTime = parseTime(
          this.playRecord[index].RecordTime
        )
      }
    },
    // 裁判记录
    async fetchUmpRecord() {
      const data = {
        PageIndex: this.UmpRecordPageIndex - 1,
        PageCount: this.UmpRecordPageCount,
        UserID: this.RecordUserID,
        StartDate: this.UmpFilterData.StartDate,
        EndDate: this.UmpFilterData.EndDate
      }
      const result = await request.post('user/UmpRecord', data)
      this.UmpRecord = result.data.details
      this.UmpRecordTotalCount = result.data.count
      for (const index in this.UmpRecord) {
        this.UmpRecord[index].RecordTime = parseTime(
          this.UmpRecord[index].RecordTime
        )
      }
    },
    // 小局详情
    async fetchPlayScoreDetailInfo(row) {
      const data = { RoomIndex: row.RoomIndex, UserID: this.RecordUserID }
      const result = await request.post('user/PlayScoreDetailInfo', data)
      this.scoreResult = result.data
    },
    GameDetail(row) {
      this.ScoreDetailDlg = true
      this.fetchPlayScoreDetailInfo(row)
    },
    changePanel(panel) {
      if (panel.label === '游戏记录') {
        this.fetchPlayRecord()
      } else if (panel.label === '财富记录') {
        this.fetchTreasureRecord()
      } else if (panel.label === '裁判记录') {
        this.fetchUmpRecord()
      }
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
    handlePlayRecordSizeChange(val) {
      this.playRecordPageCount = val
      this.fetchPlayRecord()
    },
    handlePlayRecordCurrentChange(val) {
      this.playRecordPageIndex = val
      this.fetchPlayRecord()
    },
    handleTreasureRecordSizeChange(val) {
      this.TreasureRecordPageCount = val
      this.fetchTreasureRecord()
    },
    handleTreasureRecordCurrentChange(val) {
      this.TreasureRecordPageIndex = val
      this.fetchTreasureRecord()
    },
    handleUmpRecordSizeChange(val) {
      this.UmpRecordPageCount = val
      this.fetchUmpRecord()
    },
    handleUmpRecordCurrentChange(val) {
      this.UmpRecordPageIndex = val
      this.fetchUmpRecord()
    },
    handleLookupUser(row) {
      this.UserDetailDlg = true
      this.RecordUserID = row.UserID
      this.fetchPlayRecord()
      this.fetchTreasureRecord()
      this.fetchUmpRecord()
    },
    handleDisableUser(row) {
      this.$confirm(`确定要${row.Disabled ? '解禁' : '禁用'}吗?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await request.post('user/Disabled', {
            UserID: row.UserID,
            Disabled: !row.Disabled
          })

          this.fetchUsers()
        })
        .catch(() => {})
    },
    handleClosePresentDlg(done) {
      this.$refs['PresentRuleForm'].resetFields()
      done()
    },
    handleCloseRoleEditDlg(done) {
      this.$refs['RoleEditForm'].resetFields()
      done()
    },
    handleShowPresentDlg(title) {
      if (this.selectionRows.length === 0) {
        this.$message.error('请选择要赠送的玩家')
        return
      }
      this.titlePresent = title
      this.visiblePresentDlg = true
    },
    handlePresentGold() {
      this.handleShowPresentDlg('赠送金币')
    },
    handlePresentDiamond() {
      this.handleShowPresentDlg('赠送钻石')
    },
    handlePresentDJQ() {
      this.handleShowPresentDlg('赠送代金券')
    },
    handleSelectionChange(val) {
      this.selectionRows = val
    },
    handleSetRole(row) {
      if (this.selectionRows.length === 0) {
        this.$message.error('请选择玩家')
      } else {
        this.visibleRoleEditDlg = true
      }
    },

    handleConfirmPresent(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = Object.assign({}, this.formPresentData)
          this.visiblePresentDlg = false
          this.$refs[formName].resetFields()

          request
            .post('user/Present', {
              Users: this.selectionRows.map(row => row.UserID),
              Diamond:
                this.titlePresent === '赠送钻石' ? data.Count : undefined,
              Gold: this.titlePresent === '赠送金币' ? data.Count : undefined,
              Vouchers:
                this.titlePresent === '赠送代金券' ? data.Count : undefined
            })
            .then(r => {
              this.fetchUsers()
            })
        } else {
          return false
        }
      })
    },
    handleConfirmRoleEdit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = Object.assign({}, this.formRoleEdit)
          this.visibleRoleEditDlg = false
          this.$refs[formName].resetFields()

          request
            .post('user/RoleSetting', {
              Users: this.selectionRows.map(row => row.UserID),
              Role: data.Role
            })
            .then(r => {
              this.fetchUsers()
            })
        } else {
          return false
        }
      })
    }
  }
}
</script>
