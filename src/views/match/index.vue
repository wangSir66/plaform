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
      <el-table-column align="center" label="游戏图标">
        <template slot-scope="scope">
          <el-image
            :src="scope.row.Icon"
            style="width: 64px;height: 64px"
            @error="handleImageError"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="比赛名称">
        <template slot-scope="scope">{{ scope.row.Name }}</template>
      </el-table-column>
      <el-table-column align="center" label="比赛人数">
        <template slot-scope="scope">{{ scope.row.PeopleNum }}</template>
      </el-table-column>
      <el-table-column align="center" label="游戏名称">
        <template slot-scope="scope">{{ getGameNameByID(scope.row.GameID) }}</template>
      </el-table-column>
      <el-table-column align="center" label="比赛费用">
        <template
          slot-scope="scope"
        >{{ getChargeStr(scope.row.ChargeType) }}-{{ scope.row.ChargeNum }}</template>
      </el-table-column>
      <el-table-column align="center" label="比赛类型">
        <template slot-scope="scope">{{ getTypeStr(scope.row.Type) }}</template>
      </el-table-column>
      <el-table-column align="center" label="比赛时间" min-width="90px">
        <template slot-scope="scope">{{ parseTime(scope.row.StartTime) }}</template>
      </el-table-column>
      <el-table-column align="center" label="地区">
        <template slot-scope="scope">
          <div v-for="item of cities" :key="item.IndexID">
            <span
              v-if="Object.values(scope.row.Cities).indexOf(item.IndexID) > -1"
            >{{ item.ProvinceName }} - {{ item.CityName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="推荐">
        <template slot-scope="scope">{{ scope.row.Recommend }}</template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="190px">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleJLOption(scope.$index, scope.row)"
          >奖励配置</el-button>
          <el-button
            size="mini"
            type="success"
            @click="handleJDOption(scope.$index, scope.row)"
          >阶段配置</el-button>
        </template>
      </el-table-column>
      <el-table-column width="240px" align="center">
        <template slot="header">
          <el-button plain size="mini" type="primary" @click="handleCreate">创建</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.State==0"
            plain
            size="mini"
            type="success"
            @click="handleStart(scope.$index, scope.row)"
          >开启</el-button>
          <el-button
            plain
            type="primary"
            size="mini"
            @click="handleEdit(scope.$index, scope.row)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.State<2"
            plain
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
      width="62%"
    >
      <el-form
        ref="ruleForm"
        label-position="right"
        label-width="100px"
        :rules="rules"
        :model="formData"
      >
        <el-form-item label="比赛图标" prop="Icon">
          <el-upload
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
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
        <el-form-item label="比赛名称" prop="Name">
          <el-input v-model="formData.Name" maxlength="15" placeholder="限15字" />
        </el-form-item>
        <el-form-item label="比赛人数" prop="PeopleNum">
          <el-input
            v-model="formData.PeopleNum"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
            placeholder="比赛人数为游戏规则MaxPlayerCount的整数倍"
            @input="formData.PeopleNum = ((str) => { return str.replace(/[^\d]/g, '') })(formData.PeopleNum)"
          />
        </el-form-item>
        <el-form-item label="报名费" prop="ChargeType">
          <el-select
            v-model="formData.ChargeType"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
            placeholder="请选择"
          >
            <el-option
              v-for="item in chargeType"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="ChargeNum">
          <el-input
            v-model="formData.ChargeNum"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
            placeholder="消耗数量"
            @input="formData.ChargeNum = ((str) => { return str.replace(/[^\d]/g, '') })(formData.ChargeNum)"
          />
        </el-form-item>
        <el-form-item label="服务费" prop="ServiceCharge">
          <el-input
            v-model="formData.ServiceCharge"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
            placeholder="设置服务费,0-100%"
            @input="formData.ServiceCharge = ((str) => { return str.replace(/[^\d]/g, '') })(formData.ServiceCharge)"
          />
        </el-form-item>
        <el-form-item label="业绩比例" prop="PromoterRatio">
          <el-input
            v-model="formData.PromoterRatio"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
            placeholder="设置业绩比例,0-100%"
          />
        </el-form-item>
        <el-form-item label="游戏选择" prop="GameID">
          <el-select
            v-model="formData.GameID"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
            placeholder="请选择"
          >
            <el-option
              v-for="item in gameList"
              :key="item.GameID"
              :label="item.Name"
              :value="item.GameID"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="游戏规则" prop="GameRule">
          <el-input v-model="gameRule" type="textarea" :rows="5" placeholder="请输入游戏规则，与金币场规则一致" />
        </el-form-item>
        <el-form-item label="比赛类型" prop="Type">
          <el-select
            v-model="formData.Type"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
            placeholder="请选择"
            @change="bclxChange"
          >
            <el-option
              v-for="item in matchType"
              :key="item.type"
              :label="item.name"
              :value="item.type"
            />
          </el-select>
        </el-form-item>
        <div v-if="isJxBc==matchType[1].type">
          <el-form-item label="比赛间隔：" label-width="120px" prop="LoopType">
            <el-radio-group
              v-model="formData.LoopType"
              :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
              size="medium"
            >
              <el-radio
                v-for="pro in loopType"
                :key="pro.type"
                :label="pro.type"
                @change="loopTypeSelecte"
              >{{ pro.name }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <div v-for="(item,index) in LoopNotLawNum" :key="index" prop="NotLawTimes">
            <el-form-item v-if="loopTypeSelected==loopType[1].type" label="后续比赛">
              <el-date-picker
                v-model="formData.NotLawTimes[index]"
                :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
                type="datetime"
                placeholder="设置比赛时间"
              />
              <el-button
                :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                circle
                @click="notLawPlus(index)"
              ></el-button>
              <el-button
                :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
                type="warning"
                icon="el-icon-minus"
                size="mini"
                circle
                @click="notLawMinus(index)"
              ></el-button>
            </el-form-item>
          </div>
        </div>
        <el-form-item label="开赛时间" prop="StartTime">
          <el-date-picker
            v-model="formData.StartTime"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
            type="datetime"
            placeholder="选择日期时间"
            @change="timeChange"
          />
        </el-form-item>
        <div v-if="loopTypeSelected==loopType[0].type">
          <el-form-item label="最晚时间" prop="LawStopTime">
            <el-date-picker
              v-model="formData.LawStopTime"
              :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
              type="datetime"
              placeholder="最晚时间，超过则不生成"
            />
          </el-form-item>
          <el-form-item label="循环间隔" prop="LawInterData">
            <el-input
              v-model="formData.LawInterData"
              :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
              placeholder="设置循环间隔，以天为单位,每几天循环一次"
              @input="formData.LawInterData = ((str) => { return str.replace(/[^\d]/g, '') })(formData.LawInterData)"
            />
          </el-form-item>
          <el-form-item label="比赛时间段">
            <el-time-picker
              v-model="formData.LawDataTime"
              :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
              is-range
              range-separator="至"
              start-placeholder="比赛开始时间点"
              end-placeholder="比赛最晚时间点"
              placeholder="选择时间范围"
            ></el-time-picker>
          </el-form-item>
        </div>
        <div v-if="isJxBc==matchType[1].type">
          <el-form-item v-if="loopTypeSelected==loopType[0].type" label="比赛间隔" prop="LawInterTime">
            <el-input
              v-model="formData.LawInterTime"
              :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
              placeholder="设置比赛,以分为单位,每几分钟生成一次比赛"
              @input="formData.LawInterTime = ((str) => { return str.replace(/[^\d]/g, '') })(formData.LawInterTime)"
            />
          </el-form-item>
        </div>
        <el-form-item label="晋级规则" prop="PromotionRule">
          <el-input
            v-model="formData.PromotionRule"
            maxlength="50"
            type="textarea"
            :rows="5"
            placeholder="请输入晋级规则，限50字"
          />
        </el-form-item>
        <el-form-item label="游戏规则描述(用于展示)">
          <el-input
            v-model="formData.RuleDes"
            maxlength="50"
            type="textarea"
            :rows="5"
            placeholder="请输入游戏规则，限50字"
          />
        </el-form-item>
        <el-form-item label="推荐标识" prop="Recommend">
          <el-input
            v-model="formData.Recommend"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
            placeholder="比赛推荐序号,0为不推荐,其余数字从小到大排序"
            @input="formData.Recommend = ((str) => { return str.replace(/[^\d]/g, '') })(formData.Recommend)"
          />
        </el-form-item>
        <el-form-item label="地区" prop="Cities">
          <el-checkbox-group
            v-model="formData.Cities"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
          >
            <el-checkbox
              v-for="item of cities"
              :key="item.IndexID"
              :label="item.IndexID"
            >{{ item.ProvinceName }} - {{ item.CityName }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="比赛服务器" prop="ServerGroupID">
          <el-select
            v-model="formData.ServerGroupID"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
            placeholder="请选择"
          >
            <el-option
              v-for="item in serverList"
              :key="item.GroupID"
              :label="item.Name"
              :value="item.GroupID"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间" prop="BeforeTime">
          <el-input
            v-model="formData.BeforeTime"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
            placeholder="请输入报名截止时间，单位为分钟"
            @input="formData.BeforeTime = ((str) => { if(!!formData.LawInterTime && +formData.LawInterTime < +formData.BeforeTime){ return formData.LawInterTime} return str.replace(/[^\d]/g, '') })(formData.BeforeTime)"
          />
        </el-form-item>
        <el-form-item label="支持退赛" prop="CanDropOut">
          <el-select
            v-model="formData.CanDropOut"
            :disabled="Boolean(formData.State && Number(formData.State) !== 0)"
            placeholder="是否支持退赛功能"
          >
            <el-option
              v-for="item in canDropOut"
              :key="item.type"
              :label="item.name"
              :value="item.type"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirm('ruleForm')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      center
      title="奖励配置"
      :visible.sync="dialogVisibleJLOption"
      :close-on-click-modal="false"
      width="70%"
    >
      <el-table v-loading="listLoading" :data="formData.RewardList" stripe style="width: 100%">
        <el-table-column align="center" label="索引" type="index" />
        <el-table-column align="center" label="奖励开始名次">
          <template slot-scope="scope">{{ scope.row.MinRank }}</template>
        </el-table-column>
        <el-table-column align="center" label="奖励结束名次">
          <template slot-scope="scope">{{ scope.row.MaxRank }}</template>
        </el-table-column>
        <el-table-column align="center" label="类型-数量">
          <template slot-scope="scope">
            <div
              v-for="(item,index) in scope.row.Rewards"
              :key="index"
            >{{ getPropTypeName(item) }}-{{ item.itemNum }}</div>
          </template>
        </el-table-column>
        <el-table-column v-if="formData.State==0" width="200px" align="center">
          <template slot="header">
            <el-button size="mini" type="primary" @click="handleCreateJLOption">添加</el-button>
          </template>
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEditJLOption(scope.$index, scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDeleteJLOption(scope.$index, scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog
      center
      :title="dialogRewardTitle"
      :before-close="handleRewardClose"
      :visible.sync="dialogRewardVisible"
      :close-on-click-modal="false"
      width="62%"
    >
      <el-form
        ref="RewardruleForm"
        label-position="right"
        label-width="100px"
        :rules="Rewardrules"
        :model="RewardformData"
      >
        <el-form-item label="minRank" prop="MinRank">
          <el-input
            v-model="RewardformData.MinRank"
            @input="RewardformData.MinRank = ((str) => { return str.replace(/[^\d]/g, '') })(RewardformData.MinRank)"
          />
        </el-form-item>
        <el-form-item label="maxRank" prop="MaxRank">
          <el-input
            v-model="RewardformData.MaxRank"
            @input="RewardformData.MaxRank = ((str) => { return str.replace(/[^\d]/g, '') })(RewardformData.MaxRank)"
          />
        </el-form-item>
        <div v-for="(item,index) in RewardNum" :key="index">
          <el-form-item label="奖励类型" prop="Rewards">
            <el-select v-model="RewardformData.Rewards[index].type" placeholder="请选择">
              <el-option
                v-for="pro in propType"
                :key="pro.type"
                :label="pro.name"
                :value="pro.type"
              />
            </el-select>
            <el-select
              v-if="RewardformData.Rewards[index].type === propType[3].type"
              v-model="RewardformData.Rewards[index].itemId"
              placeholder="请选择"
            >
              <el-option
                v-for="pro in propList"
                :key="pro.ItemID"
                :label="pro.Name"
                :value="pro.ItemID"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="数量" prop="Rewards">
            <el-input
              v-model="RewardformData.Rewards[index].itemNum"
              @input="RewardformData.Rewards[index].itemNum = ((str) => { return str.replace(/[^\d]/g, '') })(RewardformData.Rewards[index].itemNum)"
            />
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addReward">添加奖励</el-button>
        <el-button type="primary" @click="handleRewardConfirm('RewardruleForm')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      center
      title="阶段配置"
      :visible.sync="dialogVisibleJDOption"
      :close-on-click-modal="false"
      width="70%"
    >
      <el-table v-loading="listLoading" :data="formData.RoundList" stripe style="width: 100%">
        <el-table-column align="center" label="索引" type="index" />
        <el-table-column align="center" label="比赛赛制">
          <template slot-scope="scope">{{ getFormatTypeName(scope.row.Format) }}</template>
        </el-table-column>
        <el-table-column align="center" label="比赛局数">
          <template slot-scope="scope">{{ scope.row.GamesNum }}局</template>
        </el-table-column>
        <el-table-column align="center" label="带分比例">
          <template slot-scope="scope">{{ scope.row.ScoreRatio }}%</template>
        </el-table-column>
        <el-table-column align="center" label="晋级人数">
          <template slot-scope="scope">{{ scope.row.PromotionNum }}</template>
        </el-table-column>
        <el-table-column v-if="formData.State==0" width="200px" align="center">
          <template slot="header">
            <el-button size="mini" type="primary" @click="handleCreateJDOption">添加</el-button>
          </template>
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEditJDOption(scope.$index, scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDeleteJDOption(scope.$index, scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog
      center
      :title="dialogJDFormTitle"
      :before-close="handleJDFormClose"
      :visible.sync="dialogJDFormVisible"
      :close-on-click-modal="false"
      width="62%"
    >
      <el-form
        ref="JDFormruleForm"
        label-position="right"
        label-width="100px"
        :rules="JDFormrules"
        :model="JDFormformData"
      >
        <el-form-item label="比赛赛制" prop="Format">
          <el-select v-model="JDFormformData.Format" placeholder="请选择">
            <el-option
              v-for="pro in formatType"
              :key="pro.type"
              :label="pro.name"
              :value="pro.type"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="比赛局数" prop="GamesNum">
          <el-input
            v-model="JDFormformData.GamesNum"
            @input="JDFormformData.GamesNum = ((str) => { return str.replace(/[^\d]/g, '') })(JDFormformData.GamesNum)"
          />
        </el-form-item>
        <el-form-item label="带分比例" prop="ScoreRatio">
          <el-input
            v-model="JDFormformData.ScoreRatio"
            @input="JDFormformData.ScoreRatio = ((str) => { return str.replace(/[^\d\.]/g, '') })(JDFormformData.ScoreRatio)"
          />
        </el-form-item>
        <el-form-item label="晋级人数" prop="PromotionNum">
          <el-input
            v-model="JDFormformData.PromotionNum"
            placeholder="晋级人数必须是MaxPlayerCount的正整数倍数"
            @input="JDFormformData.PromotionNum = ((str) => { return str.replace(/[^\d]/g, '') })(JDFormformData.PromotionNum)"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleJDFormConfirm('JDFormruleForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import settings from '@/settings'
import game from '@/api/platform'
import match from '@/api/match'
import prop from '@/api/prop'
import { Copy, ErrorTip, SetData } from '@/utils/util'
import { parseTime } from '@/utils/index'
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
      value1: [new Date(), new Date()],
      dialogJDFormVisible: false,
      dialogJDFormTitle: '添加',
      JDFormformData: {},
      dialogJDOptionVisible: false,
      RewardNum: 1,
      dialogJDOptionTitle: '',
      dialogRewardTitle: '',
      dialogRewardVisible: false,
      RewardformData: {
        Rewards: [{ type: '', itemNum: '', itemId: 0 }]
      },
      chargeType: match.ChargeType,
      matchType: match.MatchType,
      propType: match.RewardType,
      formatType: match.FormatType,
      loopType: match.LoopType,
      canDropOut: match.CanDropOut,
      gameList: [],
      // 排序方式
      sortType: 1,
      // 升序降序
      ascOrder: true,
      list: [],
      dialogTitle: '',
      dialogTitleFk: '',
      dialogVisible: false,
      dialogVisibleJLOption: false,
      dialogVisibleJDOption: false,
      dialogVisibleFK: false,
      formData: {
        RewardList: [],
        RoundList: [],
        NotLawTimes: []
      },
      formDataFK: {},
      gameTypes: [],
      cities: [],
      listLoading: true,
      uploadPath: uploadPath,
      serverList: [],
      propList: [],
      handleImageError: ErrorTip,
      rules: {
        Name: [{ required: true, message: '请输入比赛名称', trigger: 'blur' }],
        PeopleNum: [
          { required: true, message: '请输入比赛人数', trigger: 'blur' }
        ],
        ChargeType: [
          { required: true, message: '请选择报名费类型', trigger: 'blur' }
        ],
        ChargeNum: [
          { required: true, message: '请输入消耗数量', trigger: 'blur' }
        ],
        ServiceCharge: [
          { required: true, message: '请输入服务费', trigger: 'blur' },
          {
            message: '服务费(%): 0-100',
            validator: (rule, val, callback) => {
              if (val > 100) {
                callback(new Error(''))
              } else callback()
            },
            trigger: 'change'
          }
        ],
        PromoterRatio: [
          { required: true, message: '请输入业绩比例', trigger: 'blur' },
          {
            message: '业绩比例1(%): 0-100',
            validator: (rule, val, callback) => {
              if (!(Number(val) <= 100 && Number(val) >= 0)) {
                callback(new Error('比例错误'))
              } else callback()
            },
            trigger: 'blur'
          }
        ],
        GameID: [{ required: true, message: '请选择游戏', trigger: 'blur' }],
        gameRule: [
          { required: true, message: '请输入游戏规则', trigger: 'blur' }
        ],
        Type: [{ required: true, message: '请选择比赛类型', trigger: 'blur' }],
        ServerGroupID: [
          { required: true, message: '请选择比赛服务器', trigger: 'blur' }
        ],
        StartTime: [
          { required: true, message: '请选择开赛时间', trigger: 'blur' }
        ],
        PromotionRule: [
          { required: true, message: '请输入晋级规则', trigger: 'blur' }
        ],
        Recommend: [
          { required: true, message: '请输入推荐指数', trigger: 'blur' }
        ],
        BeforeTime: [
          {
            required: true,
            message: '请输入报名截止时间（开赛前X分钟）',
            trigger: 'blur'
          }
        ]
      },
      Rewardrules: {
        MinRank: [
          { required: true, message: '请输入起始名次', trigger: 'blur' }
        ],
        MaxRank: [
          { required: true, message: '请输入终止名次', trigger: 'blur' }
        ]
      },
      JDFormrules: {
        Format: [{ required: true, message: '输入不能为空', trigger: 'blur' }],
        GamesNum: [
          { required: true, message: '输入不能为空', trigger: 'blur' }
        ],
        ScoreRatio: [
          { required: true, message: '输入不能为空', trigger: 'blur' }
        ],
        PromotionNum: [
          { required: true, message: '输入不能为空', trigger: 'blur' }
        ]
      },
      isJxBc: 0,
      loopTypeSelected: -1,
      LoopNotLawNum: 1,
      gameRule: ''
    }
  },
  created() {
    this.fetchData(this.$route.query.id || undefined)
    this.getGameList()
  },
  methods: {
    timeChange(val) {
      if (new Date(val) < new Date()) {
        this.$message.error('开赛时间不能为过去')
        this.formData.StartTime = undefined
        return
      }
    },
    parseTime(time) {
      return parseTime(new Date(time), '{y}-{m}-{d} {h}:{i}:{s}')
    },
    notLawPlus(index) {
      this.LoopNotLawNum++
      this.formData.NotLawTimes.splice(index + 1, 0, '')
    },
    notLawMinus(index) {
      if (this.LoopNotLawNum === 1) return
      this.LoopNotLawNum--
      this.formData.NotLawTimes.splice(index, 1)
    },
    loopTypeSelecte(e) {
      this.LoopNotLawNum = this.formData.NotLawTimes?.length | 1
      this.loopTypeSelected = e
    },
    bclxChange(selectValue) {
      this.isJxBc = selectValue
    },
    handleJDOption(index, row) {
      this.formData = Object.assign({}, row)
      this.dialogVisibleJDOption = true
    },
    handleJDFormConfirm(formName) {
      this.$refs[formName].validate(async valid => {
        if (!valid) return
        const data = Object.assign({}, this.JDFormformData)
        this.listLoading = true
        const msg = {
          IndexID: this.formData.IndexID,
          round: data
        }
        if (this.dialogJDFormTitle === '添加') {
          match.addToMatch(msg).then(res => {
            if (res.error) {
              this.handleImageError(1, '添加轮次', res.error.message)
            } else {
              if (!this.formData.RoundList) this.formData.RoundList = []
              this.formData.RoundList.push(res)
              this.dialogJDFormVisible = false
            }
            this.listLoading = false
          })
        } else {
          match.modifyToMatch(msg).then(res => {
            if (res.error) {
              this.handleImageError(1, '修改轮次', res.error.message)
            } else {
              for (let i = 0; i < this.formData.RoundList.length; i++) {
                const item = this.formData.RoundList[i]
                if (res.IndexID === item.IndexID) {
                  SetData(item, res)
                  break
                }
              }
              this.dialogJDFormVisible = false
            }
            this.listLoading = false
          })
        }
        await this.fetchData()
        this.$refs[formName].resetFields()
      })
    },
    handleCreateJDOption() {
      this.dialogJDFormTitle = '添加'
      this.JDFormformData = {}
      this.dialogJDFormVisible = true
    },
    handleEditJDOption(index, row) {
      this.dialogJDFormTitle = '编辑'
      this.JDFormformData = Object.assign({}, row)
      this.dialogJDFormVisible = true
    },
    handleJDFormClose(done) {
      done()
    },
    handleRewardConfirm(rule) {
      this.$refs[rule].validate(res => {
        if (!res) return
        const data = Object.assign({}, this.RewardformData)
        const msg = {
          IndexID: this.formData.IndexID,
          reward: data
        }
        if (this.dialogRewardTitle === '添加') {
          match.addToMatch(msg).then(res => {
            if (res.error) {
              this.handleImageError(1, '添加奖励', res.error.message)
            } else {
              if (!this.formData.RewardList) this.formData.RewardList = []
              this.formData.RewardList.push(res)
              this.dialogRewardVisible = false
            }
          })
        } else {
          match.modifyToMatch(msg).then(res => {
            if (res.error) {
              this.handleImageError(1, '修改奖励', res.error.message)
            } else {
              for (let i = 0; i < this.formData.RewardList.length; i++) {
                const item = this.formData.RewardList[i]
                if (res.IndexID === item.IndexID) {
                  SetData(item, res)
                  if (res.Rewards.length > item.Rewards.length) {
                    item.Rewards.push(
                      ...res.Rewards.slice(
                        item.Rewards.length,
                        res.Rewards.length
                      )
                    )
                  }
                  break
                }
              }
              this.dialogRewardVisible = false
            }
          })
        }
        this.$refs[rule].resetFields()
      })
    },
    addReward() {
      this.RewardNum++
      if (!this.RewardformData.Rewards[this.RewardNum]) {
        this.RewardformData.Rewards.push({ type: '', itemNum: '' })
      }
    },
    handleRewardClose(done) {
      this.RewardNum = 1
      done()
    },
    handleConfirm(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) return
        this.formData.GameRule = this.gameRule
        const data = Object.assign({}, this.formData)
        if (this.dialogTitle === '创建') {
          this.listLoading = true
          match.addToMatch(data).then(res => {
            if (res.error) {
              this.handleImageError(1, '添加比赛', res.error.message)
            } else {
              this.list.push(res)
              this.dialogVisible = false
            }
            this.listLoading = false
          })
        } else {
          match.modifyToMatch(data).then(res => {
            if (res.error) {
              this.handleImageError(1, '添加比赛', res.error.message)
            } else {
              this.fetchData()
              this.dialogVisible = false
            }
          })
        }
        this.$refs[formName].resetFields()
      })
    },
    async getGameList() {
      try {
        const res = await game.gameList()
        this.gameList = res.data
        console.log('--游戏列表--', this.gameList)
        this.serverList = await game.getServerList()
        console.log('--比赛服务器列表--', this.serverList)
        const ct = await game.getCities()
        this.cities = ct.data
        console.log('--城市列表--', this.cities)
        this.propList = await prop.propList()
        console.log('--道具列表--', this.propList)
      } catch (error) {
        console.log(error)
      }
    },
    handleCreateJLOption() {
      this.dialogRewardTitle = '添加'
      this.RewardformData = {
        Rewards: [{ type: '', itemNum: '' }]
      }
      this.RewardNum = 1
      this.dialogRewardVisible = true
    },
    handleEditJLOption(index, row) {
      this.dialogRewardTitle = '编辑'
      console.log('奖励编辑', row)
      this.RewardNum = row.Rewards.length
      this.RewardformData = Copy(row)
      this.dialogRewardVisible = true
    },
    handleDeleteJLOption(index, row) {
      this.$confirm('确定要删除该奖励吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          match
            .deltMatch({ IndexID: this.formData.IndexID, reward: row.IndexID })
            .then(res => {
              if (res.error) {
                this.handleImageError(0, '删除奖励', res.error.message)
              } else {
                for (let i = 0; i < this.formData.RewardList.length; i++) {
                  const item = this.formData.RewardList[i]
                  if (res === item.IndexID) {
                    this.formData.RewardList.splice(i, 1)
                    break
                  }
                }
              }
            })
        })
        .catch(() => {})
    },
    handleDeleteJDOption(index, row) {
      this.$confirm('确定要删除该轮次吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          match
            .deltMatch({ IndexID: this.formData.IndexID, round: row.IndexID })
            .then(res => {
              if (res.error) {
                this.handleImageError(0, '删除轮次 ', res.error.message)
              } else {
                for (let i = 0; i < this.formData.RoundList.length; i++) {
                  const item = this.formData.RoundList[i]
                  if (res === item.IndexID) {
                    this.formData.RoundList.splice(i, 1)
                    break
                  }
                }
              }
            })
        })
        .catch(() => {})
    },
    handleCreate() {
      this.dialogTitle = '创建'
      this.formData = {
        Icon: '',
        Cities: [],
        NotLawTimes: ['']
      }
      this.gameRule = `{ "MaxPlayerCount": 4 }`
      this.isJxBc = 0
      this.loopTypeSelected = -1
      this.LoopNotLawNum = 1
      this.dialogVisible = true
    },
    getRuleName(ruleId) {
      for (const rule of this.formData.SubRules) {
        if (rule.IndexID === ruleId) return rule.Name
      }
      return '未知玩法'
    },
    getPropTypeName(rItem) {
      if (rItem.type === this.propType[3].type) {
        for (let _i = 0; _i < this.propList.length; _i++) {
          const prop = this.propList[_i]
          if (prop.ItemID === rItem.itemId) return prop.Name
        }
      } else {
        for (const item of this.propType) {
          if (item.type === rItem.type) return item.name
        }
      }
      return '未知类型'
    },
    getFormatTypeName(type) {
      for (const item of this.formatType) {
        if (item.type === type) return item.name
      }
      return '未知类型'
    },
    getGameNameByID(id) {
      for (const item of this.gameList) {
        if (item.GameID === id) return item.Name
      }
    },
    getChargeStr(type) {
      for (const item of match.ChargeType) {
        if (item.key === type) return item.name
      }
      return ''
    },
    getTypeStr(type) {
      for (const item of this.matchType) {
        if (item.type === type) return item.name
      }
      return ''
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
    async fetchData(id) {
      console.log('--00', id)

      this.listLoading = true
      this.list = await match.getMatchList(id ? { filterData: { filterType: 1, content: id }} : undefined)
      this.listLoading = false
      console.log('--比赛列表--', this.list)
    },
    handleEdit(index, row) {
      this.dialogTitle = '编辑'
      !row.NotLawTimes && (row.NotLawTimes = [''])
      this.gameRule = row.GameRule ? JSON.stringify(row.GameRule) : ''
      this.formData = Object.assign({}, row)
      this.formData.Cities = this.formData.Cities.map(item => Number(item))
      this.LoopNotLawNum = row.NotLawTimes?.length ?? 1
      this.isJxBc = row.Type
      this.loopTypeSelected = row.LoopType
      this.dialogVisible = true
    },
    handleJLOption(index, row) {
      this.formData = Object.assign({}, row)
      this.dialogVisibleJLOption = true
    },
    handleDelete(index, row) {
      this.$confirm('确定要删除该场比赛吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await match.deltMatch({ IndexID: row.IndexID })
          this.fetchData()
        })
        .catch(() => {})
    },
    handleStart(index, row) {
      this.$confirm('确定开启该场比赛吗？开启后将无法修改！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          match.startMatch({ IndexID: row.IndexID }).then(res => {
            if (res.error) {
              this.handleImageError(1, '开启比赛', res.error.message)
            } else this.fetchData()
          })
        })
        .catch(() => {})
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
