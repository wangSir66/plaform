<template>
  <div class="app-container">
    <el-row style="margin-bottom:20px;">
      <el-col :span="12">
        <el-select
          v-model="sortType"
          size="mini"
          placeholder="排序方式"
          style="margin:0;padding:0;vertical-align:middle;"
          @change="fetchData()"
        >
          <el-option
            v-for="item in SortOptions"
            :key="item.sortType"
            :label="item.label"
            :value="item.sortType"
          />
        </el-select>
        <el-select
          v-model="ascOrder"
          size="mini"
          placeholder="升序/降序"
          style="margin:0;padding:0;vertical-align:middle;"
          @change="fetchData()"
        >
          <el-option :value="true" label="升序">升序</el-option>
          <el-option :value="false" label="降序">降序</el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      stripe
      highlight-current-row
    >
      <el-table-column align="center" label="序号" type="index" />
      <el-table-column align="center" label="游戏标识">
        <template slot-scope="scope">{{ scope.row.GameID }}</template>
      </el-table-column>
      <el-table-column align="center" label="发布标识">
        <template slot-scope="scope">
          <span v-if="scope.row.Published">已发布</span>
          <span v-else>未发布</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="推荐标识">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.RecommendID" type="success">推荐</el-tag>
          <el-tag v-else type="info">不推荐</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="游戏图标">
        <template slot-scope="scope">
          <el-image
            :src="scope.row.Icon"
            style="width: 64px;height: 64px"
            @error="handleImageError"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="游戏名称">
        <template slot-scope="scope">{{ scope.row.Name }}</template>
      </el-table-column>
      <el-table-column align="center" label="游戏分类">
        <template slot-scope="scope">
          <span v-if="scope.row.TypeID">
            {{ getTypeName(scope.row.TypeID) }}
          </span>
          <span v-else>未知类型</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序标识">
        <template slot-scope="scope">{{ scope.row.OrderID }}</template>
      </el-table-column>
      <el-table-column align="center" label="当前版本">
        <template slot-scope="scope">{{ scope.row.Version }}</template>
      </el-table-column>
      <el-table-column align="center" label="客户端目录">
        <template slot-scope="scope">{{ scope.row.ClientEntryDir }}</template>
      </el-table-column>
      <el-table-column align="center" label="服务器目录">
        <template slot-scope="scope">{{ scope.row.ServerEntryDir }}</template>
      </el-table-column>
      <el-table-column align="center" label="是否公用">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.IsPublic" type="success">公用</el-tag>
          <el-tag v-else type="danger">私有</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="免费状态">
        <template slot-scope="scope">
          <span v-if="scope.row.Free">免费</span>
          <span v-else>付费</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="地域">
        <template slot-scope="scope">
          <div v-for="item of cities" :key="item.IndexID">
            <span
              v-if="Object.values(scope.row.Cities).indexOf(item.IndexID) > -1"
            >{{ item.ProvinceName }} - {{ item.CityName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="360px" align="center">
        <template slot="header">
          <el-button size="mini" type="primary" @click="handleCreate">创建</el-button>
        </template>
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button
            size="mini"
            @click="handleFkOption(scope.$index, scope.row)"
          >房卡配置</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
          >删除</el-button>
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
      width="32%"
    >
      <el-form
        ref="ruleForm"
        label-position="right"
        label-width="100px"
        :rules="rules"
        :model="formData"
      >
        <el-form-item label="游戏图标" prop="Icon">
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
              fit="contain"
              :src="formData.Icon"
              style="width: 79px;height: 79px"
              class="el-upload"
              @error="handleImageError"
            />
            <span v-else class="el-icon-plus avatar-uploader-icon el-upload" />
          </el-upload>
        </el-form-item>
        <el-form-item label="发布状态" prop="Published">
          <template>
            <el-radio v-model="formData.Published" :label="1">已发布</el-radio>
            <el-radio v-model="formData.Published" :label="0">未发布</el-radio>
          </template>
        </el-form-item>
        <el-form-item label="游戏类型" prop="TypeID">
          <el-select v-model="formData.TypeID" placeholder="请选择">
            <el-option
              v-for="item in gameTypes"
              :key="item.IndexID"
              :label="item.Name"
              :value="item.IndexID"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="游戏标识" prop="GameID">
          <el-input v-model.number="formData.GameID" />
        </el-form-item>
        <el-form-item label="游戏名称" prop="Name">
          <el-input v-model="formData.Name" />
        </el-form-item>
        <el-form-item label="客户端目录" prop="ClientEntryDir">
          <el-input v-model="formData.ClientEntryDir" />
        </el-form-item>
        <el-form-item label="服务器目录" prop="ServerEntryDir">
          <el-input v-model="formData.ServerEntryDir" />
        </el-form-item>
        <el-form-item label="游戏版本" prop="Version">
          <el-input v-model="formData.Version" />
        </el-form-item>
        <el-form-item label="排序标识">
          <el-input v-model.number="formData.OrderID" />
        </el-form-item>
        <el-form-item label="推荐标识">
          <el-radio-group v-model="formData.RecommendID">
            <el-radio :label="0">不推荐</el-radio>
            <el-radio :label="1">推 荐</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否公用">
          <el-radio-group v-model="formData.IsPublic">
            <el-radio :label="1">公用</el-radio>
            <el-radio :label="0">私有</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="免费状态">
          <el-radio-group v-model="formData.Free">
            <el-radio :label="1">免费</el-radio>
            <el-radio :label="0">付费</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="游戏归属" prop="Cities">
          <el-checkbox-group v-model="formData.Cities">
            <el-checkbox
              v-for="item of cities"
              :key="item.IndexID"
              :label="item.IndexID"
            >{{ item.ProvinceName }} - {{ item.CityName }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirm('ruleForm')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      center
      title="房卡配置"
      :visible.sync="dialogVisibleFkOption"
      :close-on-click-modal="false"
      width="70%"
    >
      <el-table
        v-loading="listLoading"
        :data="formData.Prices"
        stripe
        style="width: 100%"
      >
        <el-table-column align="center" prop="IndexID" label="索引" />
        <el-table-column align="center" prop="Round" label="局数" />
        <el-table-column align="center" prop="Diamond" label="扣钻" />
        <el-table-column width="200px" align="center">
          <template slot="header">
            <el-button size="mini" type="primary" @click="handleCreateFkOption">创建</el-button>
          </template>
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEditFkOption(scope.$index, scope.row)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDeleteFkOption(scope.$index, scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirmFkOption">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      center
      :title="dialogTitleFk"
      :before-close="handleCloseFK"
      :visible.sync="dialogVisibleFK"
      :close-on-click-modal="false"
      width="32%"
    >
      <el-form
        ref="ruleFormFK"
        label-position="left"
        label-width="100px"
        :rules="rulesFK"
        :model="formDataFK"
      >
        <el-form-item label="游戏局数" prop="Round">
          <el-input v-model.number="formDataFK.Round" />
        </el-form-item>
        <el-form-item label="扣钻" prop="Diamond">
          <el-input v-model.number="formDataFK.Diamond" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirmFK('ruleFormFK')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import game from '@/api/platform'
import settings from '@/settings'

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
    let baseUrl = settings.baseUrl
    if (baseUrl.endsWith('admin')) {
      baseUrl = baseUrl.slice(0, baseUrl.indexOf('admin'))
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1)
      }
    }
    const uploadPath = `${baseUrl}/upload`

    return {
      free: undefined, // 一键免费收费
      itemLabel: [
        { label: '返50%扣卡', value: 1 },
        { label: '返60%扣卡', value: 2 },
        { label: '返70%扣卡', value: 3 },
        { label: '返75%扣卡', value: 4 },
        { label: '返80%扣卡', value: 5 }
      ],
      // 排序方式
      sortType: 1,
      // 升序降序
      ascOrder: true,
      SortOptions: [
        {
          sortType: 1,
          label: '序号排序'
        },
        {
          sortType: 2,
          label: '类型排序'
        },
        {
          sortType: 3,
          label: 'ID排序'
        }
      ],
      list: null,
      dialogTitle: '',
      dialogTitleFk: '',
      dialogVisible: false,
      dialogVisibleFkOption: false,
      dialogVisibleFK: false,
      formData: {},
      formDataFK: {},
      gameTypes: [],
      cities: [],
      listLoading: true,
      uploadPath: uploadPath,
      rules: {
        GameID: [
          { required: true, message: '请输入游戏标识', trigger: 'blur' }
        ],
        Name: [{ required: true, message: '请输入游戏名称', trigger: 'blur' }],
        TypeID: [
          { required: true, message: '请输入游戏类型名称', trigger: 'blur' }
        ],
        Published: [
          { required: true, message: '请设置游戏发布状态', trigger: 'blur' }
        ],
        Icon: [{ required: true, message: '请设置游戏图标', trigger: 'blur' }],
        ClientEntryDir: [
          {
            required: true,
            message: '请输入游戏脚本目录(注：相对客户端Games文件夹)',
            trigger: 'blur'
          }
        ],
        ServerEntryDir: [
          {
            required: true,
            message: '请输入游戏脚本目录(注：相对服务器端Games文件夹)',
            trigger: 'blur'
          }
        ],
        Cities: [
          { required: true, message: '选择游戏归属地', trigger: 'blur' }
        ],
        Version: [
          {
            required: true,
            message: '请输入游戏最新版本号（如：0.0.0.1）',
            trigger: 'blur'
          }
        ]
      },
      rulesFK: {
        Round: [{ required: true, message: '请输入游戏局数', trigger: 'blur' }],
        Diamond: [
          { required: true, message: '请输入扣钻数量', trigger: 'blur' }
        ],
        Card50: [
          { required: true, message: '请输入返50%扣卡', trigger: 'blur' }
        ],
        Card60: [
          { required: true, message: '请输入返60%扣卡', trigger: 'blur' }
        ],
        Card70: [
          { required: true, message: '请输入返70%扣卡', trigger: 'blur' }
        ],
        Card75: [
          { required: true, message: '请输入返75%扣卡', trigger: 'blur' }
        ],
        Card80: [
          { required: true, message: '请输入返80%扣卡', trigger: 'blur' }
        ],
        SelectIndex: [
          { required: true, message: '请输入默认选中', trigger: 'blur' }
        ]
      }
    }
  },
  async created() {
    this.fetchData()
    const res = await game.GetGameTypeList()
    this.gameTypes = res.data
  },
  methods: {
    getRuleName(ruleId) {
      for (const rule of this.formData.SubRules) {
        if (rule.IndexID === ruleId) return rule.Name
      }
      return '未知玩法'
    },
    getTypeName(typeId) {
      for (const item of this.gameTypes) {
        if (item.IndexID === typeId) return item.Name
      }
      return '未知类型'
    },
    handleImageError(e) {
      console.error(e)
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
        const data = Object.assign({}, this.formData)
        data.Icon = res.url
        this.formData = data
      }
    },
    async fetchData() {
      this.listLoading = true
      const results = await Promise.all([
        request.get('/gameList'),
        request.get('/cities')
      ])
      this.listLoading = false
      if (this.ascOrder) {
        // 升序
        switch (Number(this.sortType)) {
          case 1:
            this.list = results[0]?.data?.sort((a, b) => a.IndexID - b.IndexID)
            break
          case 2:
            this.list = results[0]?.data?.sort((a, b) => {
              if (a.TypeID === b.TypeID) return a.GameID - b.GameID
              else return a.TypeID - b.TypeID
            })
            break
          case 3:
            this.list = results[0]?.data?.sort((a, b) => a.GameID - b.GameID)
            break
          default:
            this.list = results[0]?.data?.sort((a, b) => a.IndexID - b.IndexID)
            break
        }
      } else {
        // 降序
        switch (this.sortType) {
          case 1:
            this.list = results[0]?.data?.sort((a, b) => b.IndexID - a.IndexID)
            break
          case 2:
            this.list = results[0]?.data?.sort((a, b) => {
              if (a.TypeID === b.TypeID) return b.GameID - a.GameID
              else return b.TypeID - a.TypeID
            })
            break
          case 3:
            this.list = results[0]?.data?.sort((a, b) => b.GameID - a.GameID)
            break
          default:
            this.list = results[0]?.data?.sort((a, b) => b.IndexID - a.IndexID)
            break
        }
      }
      this.cities = results[1].data
    },
    handleCreate() {
      this.dialogTitle = '创建'
      this.formData = {
        OrderID: 0,
        RecommendID: 0,
        SubRules: [],
        Cities: []
      }
      this.dialogVisible = true
    },
    handleEdit(index, row) {
      this.dialogTitle = '编辑'
      this.formData = Object.assign({}, row)
      this.formData.Cities = this.formData.Cities.map(item => Number(item))
      this.dialogVisible = true
    },
    handleCreateFkOption() {
      if (this.formData.Prices.length >= 4) {
        this.$message.warning('最多支持4个局数选项!')
        return
      }
      this.formDataFK = {}
      this.dialogTitleFk = '新建配置'
      this.dialogVisibleFK = true
    },
    handleEditFkOption(index, row) {
      this.dialogTitleFk = '编辑配置'
      this.dialogVisibleFK = true
      this.formDataFK = Object.assign({}, row)
    },
    handleDeleteFkOption(index, row) {
      this.$confirm('确定要删除该配置吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await request.post('game/DelFK', { IndexID: row.IndexID })
          await this.fetchData()

          for (const game of this.list) {
            if (game.IndexID === this.formData.IndexID) {
              this.formData = game
              break
            }
          }
        })
        .catch(() => {})
    },
    handleConfirmFkOption() {
      this.dialogVisibleFkOption = false
    },
    handleFkOption(index, row) {
      this.dialogVisibleFkOption = true
      this.formData = Object.assign({}, row)
    },
    handleDelete(index, row) {
      this.$confirm('确定要删除该游戏吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await request.post('game/Del', { IndexID: row.IndexID })
        this.fetchData()
      }).catch(() => {})
    },
    handleCloseFK(done) {
      this.$refs['ruleFormFK'].resetFields()
      done()
    },
    handleConfirmFK(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          let rebateOptions = []
          if (this.dialogTitleFk === '新建配置') {
            rebateOptions.push(this.formDataFK.Card50)
            rebateOptions.push(this.formDataFK.Card60)
            rebateOptions.push(this.formDataFK.Card70)
            rebateOptions.push(this.formDataFK.Card75)
            rebateOptions.push(this.formDataFK.Card80)
            this.formDataFK.RebateOptions = rebateOptions
          } else {
            rebateOptions.push(String(this.formDataFK.RebateOptions[0].Value))
            rebateOptions.push(String(this.formDataFK.RebateOptions[1].Value))
            rebateOptions.push(String(this.formDataFK.RebateOptions[2].Value))
            rebateOptions.push(String(this.formDataFK.RebateOptions[3].Value))
            rebateOptions.push(String(this.formDataFK.RebateOptions[4].Value))
            this.formDataFK.RebateOptions = JSON.parse(
              JSON.stringify(rebateOptions)
            )
          }
          // 去掉房卡start
          rebateOptions = [0, 0, 0, 0, 0]
          this.formDataFK.RebateOptions = JSON.parse(
            JSON.stringify(rebateOptions)
          )
          this.formDataFK.SelectIndex = 0
          // 去掉房卡end
          const data = Object.assign(
            {
              RuleID: 0,
              GameID: this.formData.GameID,
              IndexID: this.formData.IndexID
            },
            this.formDataFK
          )
          data.RebateOptions = JSON.parse(JSON.stringify(data.RebateOptions))
          this.dialogVisibleFK = false
          this.$refs[formName].resetFields()
          this.formDataFK = {}
          try {
            if (this.dialogTitleFk === '新建配置') {
              await request.post('game/AddFK', data)
            } else {
              await request.post('game/ModifyFK', data)
            }
          } finally {
            await this.fetchData()

            for (const game of this.list) {
              if (game.IndexID === this.formData.IndexID) {
                this.formData = game
                break
              }
            }
          }
        } else {
          return false
        }
      })
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
            request.post('game/Add', data).then(res => {
              this.fetchData()
            })
          } else {
            request.post('game/Modify', data).then(res => { this.fetchData() })
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>
<style scoped>
.avatar-uploader {
  line-height: 0
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
