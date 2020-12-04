/** crm自定义列表 公共逻辑 */
import {
  mapGetters
} from 'vuex'
import Lockr from 'lockr'
import CRMListHead from '../components/CRMListHead'
import CRMTableHead from '../components/CRMTableHead'
import FieldsSet from '../components/fieldsManager/FieldsSet'
import {
  filedGetField,
  crmFieldColumnWidth
} from '@/api/customermanagement/common'
import {
  crmLeadsIndex,
  crmLeadsExcelExport
} from '@/api/customermanagement/clue'
import {
  crmCustomerIndex,
  crmCustomerPool,
  crmCustomerExcelExport,
  crmCustomerPoolExcelExportAPI
} from '@/api/customermanagement/customer'
import {
  crmContactsIndex,
  crmContactsExcelExport
} from '@/api/customermanagement/contacts'
import {
  crmBusinessIndex
} from '@/api/customermanagement/business'
import {
  crmContractIndex
} from '@/api/customermanagement/contract'
import {
  crmProductIndex,
  crmProductExcelExport
} from '@/api/customermanagement/product'
import {
  crmReceivablesIndex
} from '@/api/customermanagement/money'
import {
  getDateFromTimestamp,
  moneyFormat
} from '@/utils'
import moment from 'moment'
import { Loading } from 'element-ui'

export default {
  components: {
    CRMListHead,
    CRMTableHead,
    FieldsSet
  },

  data() {
    return {
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 240, // 表的高度
      list: [],
      fieldList: [],
      sortData: {}, // 字段排序
      currentPage: 1,
      pageSize: Lockr.get('crmPageSizes') || 15,
      pageSizes: [15, 30, 60, 100],
      total: 0,
      search: '', // 搜索内容
      /** 控制详情展示 */
      rowID: '', // 行信息
      rowType: '', // 详情类型
      showDview: false,
      /** 格式化规则 */
      formatterRules: {},
      /** 高级筛选 */
      filterObj: {}, // 筛选确定数据
      scene_id: '', // 场景筛选ID
      scene_name: '', // 场景名字
      /** 列表展示字段管理 */
      showFieldSet: false,
      /** 勾选行 */
      selectionList: [] // 勾选数据 用于全局导出
    }
  },

  computed: {
    ...mapGetters(['crm'])
  },

  mounted() {
    var self = this
    /** 控制table的高度 */
    window.onresize = function() {
      var offsetHei = document.documentElement.clientHeight
      var removeHeight = Object.keys(self.filterObj).length > 0 ? 310 : 240
      self.tableHeight = offsetHei - removeHeight
    }

    if (this.crm[this.crmType].index) {
      if (this.isSeas) {
        this.getFieldList()
      } else {
        this.loading = true
      }
    }
  },

  methods: {
    /** 获取列表数据 */
    getList() {
      this.loading = true
      var crmIndexRequest = this.getIndexRequest()
      var params = {
        page: this.currentPage,
        limit: this.pageSize,
        search: this.search
      }
      if (this.scene_id) {
        params.scene_id = this.scene_id
      }

      if (this.sortData.order) {
        params.order_field = this.sortData.prop
        params.order_type = this.sortData.order == 'ascending' ? 'asc' : 'desc'
        this.$bus.emit('getSortData', { order_field: params.order_field, order_type: params.order_type })
      }
      for (var key in this.filterObj) {
        params[key] = this.filterObj[key]
      }
      crmIndexRequest(params)
        .then(res => {
          if (this.crmType === 'customer') {
            this.list = res.data.list.map(element => {
              element.show = false // 控制列表商机展示
              return element
            })
          } else {
            if (this.crmType === 'contract') {
              // 合同列表展示金额信息
              this.moneyData = res.data.data
            }
            this.list = res.data.list
          }

          this.total = res.data.dataCount

          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    /** 获取列表请求 */
    getIndexRequest() {
      if (this.crmType === 'leads') {
        return crmLeadsIndex
      } else if (this.crmType === 'customer') {
        if (this.isSeas) {
          return crmCustomerPool
        } else {
          return crmCustomerIndex
        }
      } else if (this.crmType === 'contacts') {
        return crmContactsIndex
      } else if (this.crmType === 'business') {
        return crmBusinessIndex
      } else if (this.crmType === 'contract') {
        return crmContractIndex
      } else if (this.crmType === 'product') {
        return crmProductIndex
      } else if (this.crmType === 'receivables') {
        return crmReceivablesIndex
      }
    },
    /** 获取字段 */
    getFieldList() {
      if (this.fieldList.length == 0) {
        this.loading = true
        var params = {
          types: 'crm_' + this.crmType,
          module: 'crm',
          action: this.isSeas ? 'pool' : 'index'
        }
        params.controller = this.crmType

        filedGetField(params)
          .then(res => {
            for (let index = 0; index < res.data.length; index++) {
              const element = res.data[index]
              /** 获取需要格式化的字段 和格式化的规则 */
              if (element.form_type === 'date') {
                this.formatterRules[element.field] = {
                  formatter: function fieldFormatter(time) {
                    if (time == '0000-00-00') {
                      time = ''
                    }
                    return time
                  }
                }
              } else if (element.form_type === 'datetime') {
                this.formatterRules[element.field] = {
                  formatter: function fieldFormatter(time) {
                    if (time == 0 || !time) {
                      return ''
                    }
                    return moment(getDateFromTimestamp(time)).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )
                  }
                }
              } else if (element.field === 'create_user_id' || element.field === 'owner_user_id') {
                this.formatterRules[element.field] = {
                  type: 'crm',
                  formatter: function fieldFormatter(info) {
                    return info ? info.realname : ''
                  }
                }
              } else if (element.form_type === 'user') {
                this.formatterRules[element.field] = {
                  type: 'crm',
                  formatter: function fieldFormatter(info) {
                    if (info) {
                      var content = ''
                      for (let index = 0; index < info.length; index++) {
                        const element = info[index]
                        content = content + element.realname + (index === (info.length - 1) ? '' : ',')
                      }
                      return content
                    }
                    return ''
                  }
                }
              } else if (element.form_type === 'structure') {
                this.formatterRules[element.field] = {
                  type: 'crm',
                  formatter: function fieldFormatter(info) {
                    if (info) {
                      var content = ''
                      for (let index = 0; index < info.length; index++) {
                        const element = info[index]
                        content = content + element.name + (index === (info.length - 1) ? '' : ',')
                      }
                      return content
                    }
                    return ''
                  }
                }
                /** 联系人 客户 商机 合同*/
              } else if (element.field === 'contacts_id' || element.field === 'customer_id' || element.field === 'business_id' || element.field === 'contract_id') {
                this.formatterRules[element.field] = {
                  type: 'crm',
                  formatter: function fieldFormatter(info) {
                    return info ? info.name : ''
                  }
                }
              } else if (element.field === 'status_id' || element.field === 'type_id' || element.field === 'category_id' || element.field === 'plan_id') {
                this.formatterRules[element.field] = {
                  type: 'crm',
                  formatter: function fieldFormatter(info) {
                    return info || ''
                  }
                }
              } else if (element.form_type === 'floatnumber') {
                this.formatterRules[element.field] = {
                  type: 'floatnumber',
                  formatter: function fieldFormatter(info) {
                    return moneyFormat(info)
                  }
                }
              }

              var width = 0
              if (!element.width) {
                if (element.name && element.name.length <= 6) {
                  width = element.name.length * 15 + 45
                } else {
                  width = 140
                }
              } else {
                width = element.width
              }

              this.fieldList.push({
                prop: element.field,
                label: element.name,
                width: width
              })
            }

            // 获取好字段开始请求数据
            this.getList()
          })
          .catch(() => {
            this.loading = false
          })
      } else {
        // 获取好字段开始请求数据
        this.getList()
      }
    },
    /** 格式化字段 */
    fieldFormatter(row, column) {
      // 如果需要格式化
      var aRules = this.formatterRules[column.property]
      if (aRules) {
        if (aRules.type === 'crm') {
          if (column.property) {
            return aRules.formatter(row[column.property + '_info']) || '--'
          } else {
            return ''
          }
        } else {
          return aRules.formatter(row[column.property]) || '--'
        }
      }
      return row[column.property] || '--'
    },
    /** */
    /** */
    /** 搜索操作 */
    crmSearch(value) {
      this.search = value
      this.currentPage = 1
      if (this.fieldList.length) {
        this.getList()
      }
    },
    /** 列表操作 */
    // 当某一行被点击时会触发该事件
    handleRowClick(row, column, event) {
      if (column.type === 'selection') {
        return // 多选布局不能点击
      }
      if (this.crmType === 'leads') {
        if (column.property === 'name') {
          this.rowID = row.leads_id
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'customer') {
        if (column.property === 'business-check' && row.business_count > 0) {
          return // 列表查看商机不展示详情
        }
        if (column.property === 'name') {
          this.rowID = row.customer_id
          this.rowType = 'customer'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'contacts') {
        if (column.property === 'customer_id') {
          this.rowID = row.customer_id_info.customer_id
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'name') {
          this.rowID = row.contacts_id
          this.rowType = 'contacts'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'business') {
        if (column.property === 'customer_id') {
          this.rowID = row.customer_id_info.customer_id
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'name') {
          this.rowID = row.business_id
          this.rowType = 'business'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'contract') {
        if (column.property === 'customer_id') {
          this.rowID = row.customer_id_info.customer_id
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'business_id') {
          this.rowID = row.business_id_info.business_id
          this.rowType = 'business'
          this.showDview = true
        } else if (column.property === 'contacts_id') {
          this.rowID = row.contacts_id_info.contacts_id
          this.rowType = 'contacts'
          this.showDview = true
        } else if (column.property === 'num') {
          this.rowID = row.contract_id
          this.rowType = 'contract'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'product') {
        if (column.property === 'name') {
          this.rowID = row.product_id
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'receivables') {
        if (column.property === 'customer_id') {
          this.rowID = row.customer_id_info.customer_id
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'contract_id') {
          this.rowID = row.contract_id
          this.rowType = 'contract'
          this.showDview = true
        } else if (column.property === 'number') {
          this.rowID = row.receivables_id
          this.rowType = 'receivables'
          this.showDview = true
        } else {
          this.showDview = false
        }
      }
    },
    /**
     * 导出 线索 客户 联系人 产品
     * @param {*} data
     */
    // 导出操作
    exportInfos(page = 1) {
      var params = {
        search: this.search,
        page
      }
      if (this.scene_id) {
        params.scene_id = this.scene_id
      }
      for (var key in this.filterObj) {
        params[key] = this.filterObj[key]
      }

      let request
      // 公海的请求
      if (this.isSeas) {
        request = crmCustomerPoolExcelExportAPI
      } else {
        request = {
          customer: crmCustomerExcelExport,
          leads: crmLeadsExcelExport,
          contacts: crmContactsExcelExport,
          product: crmProductExcelExport
        }[this.crmType]
      }
      var progress = ''
      const loading = Loading.service({ fullscreen: true, text: `导出中...${progress}` })
      console.log(loading, '==loading==')
      request(params)
        .then(res => {
          if (res.data.type.indexOf('json') !== -1) {
            var blob = new Blob([res.data], {
              type: 'application/json'
            })
            var reader = new FileReader()
            reader.readAsText(blob, 'utf-8')
            reader.onload = () => {
              var temp = JSON.parse(reader.result)
              progress = String(temp.data.done) + '/' + String(temp.data.total)
              loading.setText('导出中...' + progress)
              this.exportInfos(temp.data.page)
            }
          } else {
            var blob = new Blob([res.data], {
              type: 'application/vnd.ms-excel;charset=utf-8'
            })
            var downloadElement = document.createElement('a')
            var href = window.URL.createObjectURL(blob) // 创建下载的链接
            downloadElement.href = href
            downloadElement.download =
              decodeURI(
                res.headers['content-disposition'].split('filename=')[1]
              ) || '' // 下载后文件名
            document.body.appendChild(downloadElement)
            downloadElement.click() // 点击下载
            document.body.removeChild(downloadElement) // 下载完成移除元素
            window.URL.revokeObjectURL(href) // 释放掉blob对象
            loading.close()
          }
        })
        .catch(() => {
          loading.close()
        })
    },
    /** 筛选操作 */
    handleFilter(data) {
      this.filterObj = data
      var offsetHei = document.documentElement.clientHeight
      var removeHeight = Object.keys(this.filterObj).length > 0 ? 310 : 240
      this.tableHeight = offsetHei - removeHeight
      this.currentPage = 1
      this.getList()
    },
    /** 场景操作 */
    handleScene(data) {
      this.scene_id = data.id
      this.scene_name = data.name
      this.currentPage = 1
      this.getFieldList()
    },
    /** 勾选操作 */
    handleHandle(data) {
      if (data.type === 'alloc' ||
        data.type === 'get' ||
        data.type === 'transfer' ||
        data.type === 'transform' ||
        data.type === 'delete' ||
        data.type === 'cancel' ||
        data.type === 'put_seas') {
        this.showDview = false
      }

      if (data.type !== 'edit') {
        this.getList()
      }
    },
    /** 自定义字段管理 */
    setSave() {
      this.fieldList = []
      this.getFieldList()
    },
    /** */
    /** 页面头部操作 */
    listHeadHandle(data) {
      if (data.type === 'save-success') {
        // 重新请求第一页数据
        this.currentPage = 1
        this.getList()
      }
    },
    // 设置点击
    handleTableSet() {
      this.showFieldSet = true
    },
    /**
     * 字段排序
     */
    sortChange(column, prop, order) {
      this.sortData = column
      this.getList()
    },

    /** 勾选操作 */
    // 当选择项发生变化时会触发该事件
    handleSelectionChange(val) {
      this.selectionList = val // 勾选的行
      this.$refs.crmTableHead.headSelectionChange(val)
    },
    // 当拖动表头改变了列的宽度的时候会触发该事件
    handleHeaderDragend(newWidth, oldWidth, column, event) {
      if (column.property) {
        const crmType = this.isSeas ? this.crmType + '_pool' : this.crmType
        crmFieldColumnWidth({
          types: 'crm_' + crmType,
          field: column.property,
          width: newWidth
        })
          .then(res => {
          })
          .catch(() => { })
      }
    },
    // 更改每页展示数量
    handleSizeChange(val) {
      Lockr.set('crmPageSizes', val)
      this.pageSize = val
      this.getList()
    },
    // 更改当前页数
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },
    // 0待审核、1审核中、2审核通过、3已拒绝 4已撤回 5未提交
    getStatusStyle(status) {
      if (status == 0) {
        return {
          'border-color': '#E6A23C',
          'background-color': '#FDF6EC',
          'color': '#E6A23C'
        }
      } else if (status == 1) {
        return {
          'border-color': '#409EFF',
          'background-color': '#ECF5FF',
          'color': '#409EFF'
        }
      } else if (status == 2) {
        return {
          'border-color': '#67C23A',
          'background-color': '#F0F9EB',
          'color': '#67C23A'
        }
      } else if (status == 3) {
        return {
          'border-color': '#F56C6B',
          'background-color': '#FEF0F0',
          'color': '#F56C6B'
        }
      } else if (status == 4 || status == 5) {
        return {
          'background-color': '#FFFFFF'
        }
      } else if (status == 6) {
        return {
          'border-color': '#E9E9EB',
          'background-color': '#F4F4F5',
          'color': '#909399'
        }
      }
    },
    getStatusName(status) {
      if (status > 6) {
        return ''
      }
      return ['待审核', '审核中', '审核通过', '已拒绝', '已撤回', '未提交', '已作废'][status]
    },
    exportData(params) {
      this.$refs.listHead.handleTypeDrop('out', params)
    }
  },

  beforeDestroy() { }
}
