<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="DataList"
      element-loading-text="加载中..."
      stripe
      highlight-current-row
    >
      <el-table-column align="center" label="序号" type="index" />
      <el-table-column align="center" label="UserID" prop="IndexID" />
      <el-table-column align="center" label="电话" prop="Account" />
      <el-table-column align="center" label="区域">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="showHasCities(scope.row)">查看区域</el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" label="游戏">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="showHasGames(scope.row)">查看游戏</el-button>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="操作">
        <template slot="header">
          <el-button size="mini" type="primary" @click="handleAdd()">添加</el-button>
        </template>
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      center
      :title="dlgTitle"
      :visible.sync="dlgVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      width="64%"
      top="3vh"
    >
      <el-form
        ref="formData"
        v-loading="gameEditLoading"
        element-loading-text="正在保存,请稍后..."
        :model="formData"
        label-width="100px"
      >
        <el-form-item v-if="dlgTitle === '编辑'" label="UserID">
          <el-input v-model="formData.IndexID" disabled></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formData.Account" maxlength="11"></el-input>
        </el-form-item>
        <el-form-item label="区域：">
          <el-checkbox
            v-model="CityCheckAll"
            :indeterminate="isCityIndeterminate"
            @change="handleCityCheckAllChange"
          >全选</el-checkbox>
          <el-checkbox-group v-model="checkedCity" @change="handleCheckedCityChange">
            <el-checkbox
              v-for="item of cities"
              :key="item.IndexID"
              :label="item.IndexID"
            >{{ item.CityName }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="游戏：">
          <el-collapse v-model="showGame">
            <el-collapse-item
              v-for="item of allGames"
              :key="item.ID"
              :title="item.Name"
              :name="item.ID"
            >
              <el-checkbox
                v-model="item.IsAll"
                :indeterminate="item.Indeter"
                @change="handleCheckAllChange(item)"
              >全选</el-checkbox>
              <el-checkbox-group v-model="item.Selected" @change="handleCheckedChange(item)">
                <el-checkbox
                  v-for="game of item.Children"
                  :key="game.GameID"
                  :label="game.GameID"
                >{{ game.Name }}</el-checkbox>
              </el-checkbox-group>
            </el-collapse-item>
          </el-collapse>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirm('formData')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="已拥有的游戏" center :visible.sync="hasGamesDlg" width="60%">
      <el-collapse v-model="showGame">
        <el-collapse-item
          v-for="item of hasGames"
          :key="item.ID"
          :title="item.Name"
          :name="item.ID"
        >
          <el-checkbox
            v-for="game of item.Children"
            :key="game.GameID"
            :label="game.GameID"
            checked
            disabled
          >{{ game.Name }}</el-checkbox>
        </el-collapse-item>
      </el-collapse>
    </el-dialog>
    <el-dialog title="已拥有的区域" center :visible.sync="hasCityDlg" width="60%">
      <el-checkbox
        v-for="game of hasCity"
        :key="game.IndexID"
        :label="game.IndexID"
        checked
        disabled
      >{{ game.CityName }}</el-checkbox>
    </el-dialog>
  </div>
</template>

<script>
import promoter from '@/api/promoter'
import game from '@/api/platform'
export default {
  data() {
    return {
      gameEditLoading: false,
      gamesList: [],
      MajiangList: [], // 所有的麻将游戏
      CityCheckAll: false,
      gamesType: [],
      formData: { Cities: [], GameIDs: [] },
      dlgVisible: false,
      dlgTitle: '',
      DataList: [],
      listLoading: true,
      hasGamesDlg: false,
      hasCityDlg: false,
      hasCity: [],
      cities: [],
      isCityIndeterminate: true,
      checkedCity: [],
      allGames: [],
      hasGames: [],
      showGame: []
    }
  },
  async created() {
    this.fetchData()
    // 查询所有可配置的游戏
    const res = await game.gameList()
    const city = await game.getCities()
    const type = await game.GetGameTypeList()// 先获取分类
    console.log('游戏列表===>', res.data)
    console.log('城市列表===>', city.data)
    console.log('游戏类型列表===>', type.data)
    this.cities = city.data
    this.gamesType = type.data
    this.gamesList = res.data.filter(g => !!g.Cities && g.Cities.filter(c => this.cities.filter(c1 => c1.IndexID === c).length).length > 0)
    this.gamesClassify(this.gamesList)
  },
  methods: {
    gamesFilterByGameID(games) {
      this.hasGames = []
      if (!games) return
      for (let _i = 0; _i < this.allGames.length; _i++) {
        const g = this.allGames[_i]
        const c = g.Children.filter(c => games.includes(c.GameID))
        if (c.length > 0) this.hasGames.push({ ID: g.ID, Name: g.Name, Children: c })
        g.Selected = c.map(c1 => c1.GameID)
        this.handleCheckedChange(g)
      }
    },
    showHasGames(row) {
      this.hasGamesDlg = true
      this.gamesFilterByGameID(row.GameIDs)
    },
    showHasCities(row) {
      this.hasCityDlg = true
      this.hasCity = row.Cities ? this.cities.filter(c => row.Cities.includes(c.IndexID)) : []
    },
    handleCheckAllChange(val) {
      if (!val.IsAll) val.Selected = []
      else val.Selected = val.Children.map(v => v.GameID)
      val.Indeter = false
    },
    handleCheckedChange(item) {
      const count = item.Selected.length
      item.IsAll = count === item.Children.length
      item.Indeter = count > 0 && count < item.Children.length
    },
    gamesClassify(games) {
      this.allGames = []
      const indexArr = []
      // 根据分类再划分
      this.gamesType.forEach(type => {
        const obj = { ID: type.IndexID, Name: type.Name, Children: [], Selected: [], IsAll: false, Indeter: true }
        obj.Children = games.filter(item => {
          if (item.TypeID === type.IndexID) {
            indexArr.push(games.GameID)
            return true
          } else {
            return false
          }
        })
        this.allGames.push(obj)
      })
      games.length !== indexArr.length && this.allGames.push({
        ID: 99, Name: '其他', Children: games.filter(item => !indexArr.includes(item.GameID)), Selected: [], IsAll: false, Indeter: true
      })
      this.showGame = this.allGames.map(h => h.ID)
    },
    handleCityCheckAllChange(val) {
      const gameOption = []
      this.cities.forEach(item => gameOption.push(item.IndexID))
      this.checkedCity = val ? gameOption : []
      this.isCityIndeterminate = false
      const gamesList = this.gamesList.filter(g => !!g.Cities && g.Cities.filter(c => !val ? this.cities.filter(c1 => c1.IndexID === c).length > 0 : this.checkedCity.includes(c)).length > 0)
      this.gamesClassify(gamesList)
    },
    handleCheckedCityChange(value) {
      const count = value.length
      this.CityCheckAll = count === this.cities.length
      this.isCityIndeterminate = count > 0 && count < this.cities.length
      const gamesList = this.gamesList.filter(g => !!g.Cities && g.Cities.filter(c => value.length === 0 ? this.cities.filter(c1 => c1.IndexID === c).length > 0 : value.includes(c)).length > 0)
      this.gamesClassify(gamesList)
    },
    handleConfirm(formName) {
      this.$refs[formName].validate(async valid => {
        if (!valid) return false
        this.gameEditLoading = true
        const g = new Set()
        this.allGames.map(val => { g.add(...val.Selected) })
        const data = Object.assign(this.formData, {
          GameIDs: Array.from(g),
          Cities: [...this.checkedCity]
        })
        console.log('传的参数是', data)
        this.$refs[formName].resetFields()
        try {
          if (this.dlgTitle === '添加') {
            await promoter.superAdminAdd(data)
          } else {
            await promoter.superAdminModify(data)
          }
          await this.fetchData()
        } catch (error) {
          console.log(error)
        } finally {
          this.gameEditLoading = false
          this.dlgVisible = false
        }
      })
    },
    handleClose(done) {
      this.$refs['formData'].resetFields()
      done()
    },
    async fetchData() {
      try {
        const res = await promoter.promoterList({ filterData: { role: [0] }})
        console.log('超管---->', res)
        this.DataList = res.data
      } catch (error) {
        console.log(error)
      } finally {
        this.listLoading = false
      }
    },
    async handleAdd() {
      this.dlgTitle = '添加'
      this.formData = {}
      this.allGames.map(val => {
        val.Selected = []
        val.IsAll = false
        val.Indeter = true
      })
      this.checkedCity = []
      this.dlgVisible = true
    },
    handleDelete(index, row) {
      this.$confirm('确定要删除该超管吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await promoter.superAdminDel({ IndexID: row.IndexID })
        this.fetchData()
      }).catch(() => {})
    },
    handleEdit(index, row) {
      this.dlgTitle = '编辑'
      this.formData = Object.assign({}, row)
      this.checkedCity = !!row.Cities && row.Cities.length > 0 ? row.Cities : []
      // 显示已选择的游戏
      if (row.GameIDs && row.GameIDs.length) {
        this.gamesFilterByGameID(row.GameIDs)
      }
      this.dlgVisible = true
    }
  }
}
</script>
