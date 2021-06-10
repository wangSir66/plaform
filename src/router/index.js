/* eslint-disable */
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [{
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: {
        title: '个人信息',
        icon: 'dashboard'
      }
    }]
  },
  // 游戏
  {
    path: '/platform',
    component: Layout,
    redirect: '/platform/game',
    name: 'platform',
    meta: {
      title: '平台管理',
      icon: 'nested'
    },
    children: [{
        path: 'configure',
        component: () => import('@/views/platform/configure/index'), // Parent router-view
        name: 'configure',
        meta: {
          title: '平台配置'
        }
      },
      {
        path: 'city',
        component: () => import('@/views/platform/city/index'), // Parent router-view
        name: 'city',
        meta: {
          title: '地域管理'
        }
      },
      {
        path: 'type',
        component: () => import('@/views/platform/game/type/index'),
        name: 'type',
        meta: {
          title: '游戏类型'
        }
      },
      {
        path: 'game',
        component: () => import('@/views/platform/game/index'),
        name: 'game',
        meta: {
          title: '游戏管理'
        }
      }
    ]
  },
  // 比赛
  {
    path: '/match',
    component: Layout,
    redirect: '/match',
    name: 'match',
    meta: {
      title: '比赛',
      icon: 'el-icon-s-help'
    },
    children: [{
      path: 'match',
      name: 'match',
      component: () => import('@/views/match/index'),
      meta: {
        title: '比赛管理',
        icon: 'table'
      }
    }]
  },
  // 商品
  {
    path: '/commodity',
    component: Layout,
    redirect: '/commodity/prop',
    name: 'commodity',
    meta: {
      title: '商品配置',
      icon: 'nested'
    },
    children: [{
        path: 'prop',
        component: () => import('@/views/commodity/prop/index'), // Parent router-view
        name: 'prop',
        meta: {
          title: '道具配置'
        }
      },
      {
        path: 'shop',
        component: () => import('@/views/commodity/shop/index'),
        name: 'shop',
        meta: {
          title: '商城配置'
        }
      }
    ]
  },
  // 商户
  {
    path: '/merchant',
    component: Layout,
    redirect: '/merchant',
    name: 'merchant',
    meta: {
      title: '商户',
      icon: 'nested'
    },
    children: [{
      path: 'merchant',
      component: () => import('@/views/merchant/index'), // Parent router-view
      name: 'merchant',
      meta: {
        title: '商户配置'
      }
    }]
  },
  // 订单
  {
    path: '/order',
    component: Layout,
    redirect: '/order',
    name: 'order',
    meta: {
      title: '订单',
      icon: 'nested'
    },
    children: [{
      path: 'order',
      component: () => import('@/views/order/index'), // Parent router-view
      name: 'order',
      meta: {
        title: '订单管理'
      }
    }]
  },
  // 机器人配置
  {
    path: '/robot',
    component: Layout,
    redirect: '/robot',
    name: 'robot',
    meta: {
      title: '机器人配置',
      icon: 'nested'
    },
    children: [{
      path: 'robot',
      component: () => import('@/views/robot/index'), // Parent router-view
      name: 'robot',
      meta: {
        title: '机器人配置'
      }
    }]
  },
  {
    path: '/user',
    component: Layout,
    name: 'user',
    meta: {
      title: '用户管理',
      icon: 'user'
    },
    children: [{
        path: 'gameUser',
        name: 'gameUser',
        component: () => import('@/views/user/gameUser/index'),
        meta: {
          title: '玩家管理'
        }
      },
      {
        path: 'superPromoter',
        name: 'superPromoter',
        component: () => import('@/views/user/superPromoter/index'),
        meta: {
          title: '超管管理'
        }
      },
      {
        path: 'promoter',
        name: 'promoter',
        component: () => import('@/views/user/promoter/index'),
        meta: {
          title: '推广员管理'
        }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
