<template>
  <div class="app-container">
    <el-form :inline="true" :model="filterData">
      <el-form-item>
        <el-select v-model="filterData.filterType" placeholder="请选择查询类型">
          <el-option
            v-for="item in filterOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="descClass">
        <el-input
          v-model="filterData.content"
          :placeholder="placeholder"
          type="text"
          :clearable="true"
          @clear="clearFilterData('filterType')"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="listLoading"
      element-loading-text="Loading"
      :data="orderList"
      stripe
      highlight-current-row
    >
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-table
            v-if="scope.row.match"
            element-loading-text="Loading"
            :data="[scope.row.match]"
            stripe
            highlight-current-row
          >
            <el-table-column align="center" label="比赛icon">
              <template slot-scope="scope1">
                <el-image :src="scope1.row.icon" style="width: 64px;height: 64px" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="比赛名称" prop="name" />
            <el-table-column align="center" label="比赛ID" prop="ID" />
            <el-table-column align="center" label="开始时间-结束时间">
              <template slot-scope="scope2">
                {{ parseTime(scope2.row.start) || '/' }}
                <div>-</div>
                {{ parseTime(scope2.row.start) || '/' }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="游戏名称" prop="gameName" />
            <el-table-column align="center" label="比赛区域" prop="cities" />
            <el-table-column align="center" label="操作">
              <template slot-scope="scope3">
                <el-button type="primary" @click="lookUpMatch(scope3.row.ID)">查看比赛</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-table
            v-if="scope.row.merchant"
            element-loading-text="Loading"
            :data="[scope.row.merchant]"
            stripe
            highlight-current-row
          >
            <el-table-column align="center" label="商户icon">
              <template slot-scope="scope1">
                <el-image :src="scope1.row.icon" style="width: 64px;height: 64px" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="商户名称" prop="name" />
            <el-table-column align="center" label="商户ID" prop="ID" />
            <el-table-column align="center" label="商户地址" prop="address" />
            <el-table-column align="center" label="商户账号" prop="account" />
            <el-table-column align="center" label="联系方式" prop="phone" />
            <el-table-column align="center" label="操作">
              <template slot-scope="scope2">
                <el-button type="success" @click="lookUpMerchant(scope2.row.ID)">查看商户</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column align="center" label="序号" type="index" />
      <el-table-column align="center" label="订单时间" width="150upx">
        <template slot-scope="scope">{{ parseTime(scope.row.time) }}</template>
      </el-table-column>
      <el-table-column align="center" label="奖品信息">
        <template slot-scope="scope">
          <el-image :src="scope.row.icon[0]" style="width: 64px;height: 64px" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="奖品名称" prop="propName" />
      <el-table-column align="center" label="价格">
        <template slot-scope="scope">
          <div>原价：{{ scope.row.marketValue }}</div>
          <div>成本：{{ scope.row.costPrice }}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="核销码" prop="code" />
      <el-table-column align="center" label="核销有效期">
        <template slot-scope="scope">
          <div>{{ parseTime(scope.row.start) }}</div>
          <div>到</div>
          <div>{{ parseTime(scope.row.end) }}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="商户名称、ID">
        <template slot-scope="scope">
          <div>{{ scope.row.merchantName }}</div>
          <div>ID:{{ scope.row.merchantID }}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="核销方式" prop="type">
        <template slot-scope="scope">{{ getPropName(scope.row.type) }}</template>
      </el-table-column>
      <el-table-column align="center" label="关联比赛/ID">
        <template slot-scope="scope">
          <div>{{ scope.row.matchName }}</div>
          <div>{{ scope.row.matchID }}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="state">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.state === 1" type="success" plain>待核销</el-tag>
          <el-tag v-else-if="scope.row.state === 2" type="primary" plain>已核销</el-tag>
          <el-tag v-else-if="scope.row.state === 3" type="warning" plain>已过期</el-tag>
          <el-tag v-else type="warning" plain>未知类型</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { parseTime } from '@/utils/index'
import prop from '@/api/prop'
import order from '@/api/order'
export default {
  data() {
    return {
      // 筛选
      filterData: {
        content: '',
        filterType: undefined
      },
      filterOptions: [
        {
          value: 1,
          label: '奖品名称'
        },
        {
          value: 2,
          label: '核销码'
        },
        {
          value: 3,
          label: '商户名称'
        },
        {
          value: 4,
          label: '比赛信息'
        }
      ],
      // 表格
      listLoading: false,
      orderList: [] // 订单列表
    }
  },
  computed: {
    placeholder() {
      if (this.filterData?.filterType === 1) {
        return '请输入奖品名称'
      } else if (this.filterData?.filterType === 2) {
        return '请输入核销码'
      } else if (this.filterData?.filterType === 3) {
        return '请输入商户名称'
      } else if (this.filterData?.filterType === 4) {
        return '请输入比赛信息'
      } else {
        return '请输入'
      }
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 工具类
    parseTime(time) {
      return parseTime(new Date(time))
    },
    // 筛选
    handleQuery() {
      this.getOrderList()
    },
    // 查询订单
    async getOrderList() {
      this.listLoading = true
      const params = Object.assign({}, this.filterData)
      const res = await order.filterOrder(params)
      console.log('---', res)
      this.orderList = res
      this.listLoading = false
    },
    // 查询
    clearFilterData(key) {
      delete this.filterData[key]
      this.getOrderList()
    },
    // 查看订单
    getPropName(type) {
      return prop.PropType[0]?.label
    },
    // 查看比赛查看商户
    lookUpMatch(matchID) {
      console.log('00--', matchID)

      this.$router.push({
        path: '/match/match',
        query: {
          id: matchID
        }
      })
    },
    lookUpMerchant(merchantID) {
      this.$router.push({
        path: '/merchant/merchant',
        query: {
          id: merchantID
        }
      })
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
