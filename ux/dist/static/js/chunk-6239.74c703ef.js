(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-6239"],{"/Z2C":function(e,t,s){"use strict";var a=s("9bSZ");s.n(a).a},"9bSZ":function(e,t,s){},"9e0i":function(e,t,s){},S0To:function(e,t,s){"use strict";s.r(t);var a=s("oj9+"),n=s("MT78"),i=s.n(n),l=s("VOuH"),o={name:"FunnelStatistics",components:{},mixins:[a.a],data:function(){return{loading:!1,list:[],fieldList:[{field:"status_name",name:"阶段"},{field:"money",name:"金额"},{field:"count",name:"商机数"}],funnelChart:null,funnelOption:null}},computed:{},mounted:function(){this.initAxis()},methods:{getDataList:function(e){var t=this;this.loading=!0,Object(l.a)(e).then(function(e){t.loading=!1,t.list=e.data.list;for(var s=[],a=0;a<e.data.list.length;a++){var n=e.data.list[a];s.push({name:n.status_name+"("+n.count+")",value:n.money})}t.funnelOption.series[0].data=s,t.funnelOption.series[0].max=e.data.sum_money<1?1:e.data.sum_money,t.funnelChart.setOption(t.funnelOption,!0)}).catch(function(){t.loading=!1})},initAxis:function(){var e=i.a.init(document.getElementById("axismain")),t={tooltip:{trigger:"item",formatter:"{b} <br/> 预测金额: {c}元"},toolbox:{feature:{saveAsImage:{}}},calculable:!0,grid:{left:0,right:0,bottom:0,top:0},color:this.chartColors,series:[{name:"漏斗图",type:"funnel",left:"20%",width:"56%",sort:"none",gap:2,label:{normal:{show:!0,position:"right"},emphasis:{textStyle:{fontSize:20}}},labelLine:{normal:{length:20,lineStyle:{width:1,type:"solid"}}},data:[]}]};e.setOption(t,!0),this.funnelOption=t,this.funnelChart=e}}},u=(s("yXUI"),s("KHd+")),c=Object(u.a)(o,function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{directives:[{name:"loading",rawName:"v-loading",value:e.loading,expression:"loading"}],staticClass:"main-container"},[s("filtrate-handle-view",{staticClass:"filtrate-bar",attrs:{"show-business-select":!0,"module-type":"business"},on:{load:function(t){e.loading=!0},change:e.getDataList}}),e._v(" "),s("div",{staticClass:"content"},[e._m(0),e._v(" "),s("div",{staticClass:"table-content"},[s("el-table",{attrs:{data:e.list,height:"400",stripe:"",border:"","highlight-current-row":""}},e._l(e.fieldList,function(e,t){return s("el-table-column",{key:t,attrs:{prop:e.field,label:e.name,align:"center","header-align":"center","show-overflow-tooltip":""}})}))],1)])],1)},[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"axis-content"},[t("div",{attrs:{id:"axismain"}})])}],!1,null,"2f084472",null);c.options.__file="FunnelStatistics.vue";t.default=c.exports},VOuH:function(e,t,s){"use strict";s.d(t,"a",function(){return n}),s.d(t,"b",function(){return i}),s.d(t,"c",function(){return l}),s.d(t,"d",function(){return o});var a=s("t3Un");function n(e){return Object(a.a)({url:"bi/business/funnel",method:"post",data:e})}function i(e){return Object(a.a)({url:"bi/business/businessTrend",method:"post",data:e})}function l(e){return Object(a.a)({url:"bi/business/trendList",method:"post",data:e})}function o(e){return Object(a.a)({url:"bi/business/win",method:"post",data:e})}},"gXW+":function(e,t,s){"use strict";var a=s("KTTK"),n=s("UcQx"),i=s("conU"),l=s("uKQN"),o=s("wd/R"),u=s.n(o),c={name:"FiltrateHandleView",components:{timeTypeSelect:l.a},props:{moduleType:{required:!0,type:String},showYearSelect:{default:!1,type:Boolean},showBusinessSelect:{default:!1,type:Boolean},showUserSelect:{default:!0,type:Boolean},showCustomSelect:{default:!1,type:Boolean},customDefault:"",customOptions:{default:function(){return[]},type:Array},showProductSelect:{default:!1,type:Boolean}},data:function(){return{pickerOptions:{disabledDate:function(e){return e.getTime()>Date.now()}},yearValue:"",timeTypeValue:{},structuresProps:{children:"children",label:"label",value:"id"},deptList:[],structuresSelectValue:"",userOptions:[],userSelectValue:"",businessOptions:[],businessStatusValue:"",productValue:[],productOptions:[],customValue:""}},watch:{},mounted:function(){var e=this;this.showCustomSelect&&(this.customValue=this.customDefault),this.showYearSelect&&(this.yearValue=u()(new Date).year().toString()),this.$emit("load"),this.getDeptList(function(){e.showBusinessSelect?e.getBusinessStatusList(function(){e.postFiltrateValue()}):e.postFiltrateValue()}),this.showProductSelect&&this.getProductCategoryIndex()},beforeDestroy:function(){},methods:{customSelectChange:function(){this.$emit("typeChange",this.customValue)},timeTypeChange:function(e){this.timeTypeValue=e},getDeptList:function(e){var t=this;Object(a.c)({m:"bi",c:this.moduleType,a:"read"}).then(function(s){t.deptList=s.data,s.data.length>0?(t.structuresSelectValue=s.data[0].id,t.showUserSelect&&t.getUserList()):t.structuresSelectValue="",e(!0)}).catch(function(){t.$emit("error")})},structuresValueChange:function(e){this.showUserSelect&&(this.userSelectValue="",this.userOptions=[],this.getUserList())},getUserList:function(){var e=this,t={};t.structure_id=this.structuresSelectValue,Object(a.k)(t).then(function(t){e.userOptions=t.data}).catch(function(){e.$emit("error")})},getBusinessStatusList:function(e){var t=this;Object(n.h)().then(function(s){t.businessOptions=s.data,s.data.length>0&&(t.businessStatusValue=s.data[0].type_id),e(!0)}).catch(function(){t.$emit("error")})},getProductCategoryIndex:function(){var e=this;Object(i.v)({type:"tree"}).then(function(t){e.productOptions=t.data}).catch(function(){})},postFiltrateValue:function(){var e={structure_id:this.structuresSelectValue};this.showUserSelect&&(e.user_id=this.userSelectValue),this.showBusinessSelect&&(e.type_id=this.businessStatusValue),this.showProductSelect&&(e.category_id=this.productValue.length>0?this.productValue[this.productValue.length-1]:""),this.showYearSelect?e.year=this.yearValue:"custom"==this.timeTypeValue.type?(e.start_time=this.timeTypeValue.startTime,e.end_time=this.timeTypeValue.endTime):e.type=this.timeTypeValue.value,this.$emit("change",e)}}},r=(s("/Z2C"),s("KHd+")),d=Object(r.a)(c,function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"filtrate-content"},[e.showYearSelect?e._e():s("time-type-select",{on:{change:e.timeTypeChange}}),e._v(" "),e.showYearSelect?s("el-date-picker",{attrs:{clearable:!1,"picker-options":e.pickerOptions,type:"year","value-format":"yyyy",placeholder:"选择年"},model:{value:e.yearValue,callback:function(t){e.yearValue=t},expression:"yearValue"}}):e._e(),e._v(" "),s("el-select",{attrs:{placeholder:"选择部门"},on:{change:e.structuresValueChange},model:{value:e.structuresSelectValue,callback:function(t){e.structuresSelectValue=t},expression:"structuresSelectValue"}},e._l(e.deptList,function(e){return s("el-option",{key:e.id,attrs:{label:e.name,value:e.id}})})),e._v(" "),e.showUserSelect?s("el-select",{attrs:{clearable:!0,placeholder:"选择员工"},model:{value:e.userSelectValue,callback:function(t){e.userSelectValue=t},expression:"userSelectValue"}},e._l(e.userOptions,function(e){return s("el-option",{key:e.id,attrs:{label:e.realname,value:e.id}})})):e._e(),e._v(" "),e.showBusinessSelect?s("el-select",{attrs:{placeholder:"商机组"},model:{value:e.businessStatusValue,callback:function(t){e.businessStatusValue=t},expression:"businessStatusValue"}},e._l(e.businessOptions,function(e){return s("el-option",{key:e.type_id,attrs:{label:e.name,value:e.type_id}})})):e._e(),e._v(" "),e.showProductSelect?s("el-cascader",{staticStyle:{width:"100%"},attrs:{options:e.productOptions,"show-all-levels":!1,props:{children:"children",label:"label",value:"category_id"},"change-on-select":""},model:{value:e.productValue,callback:function(t){e.productValue=t},expression:"productValue"}}):e._e(),e._v(" "),e.showCustomSelect?s("el-select",{attrs:{placeholder:"图标类型"},on:{change:e.customSelectChange},model:{value:e.customValue,callback:function(t){e.customValue=t},expression:"customValue"}},e._l(e.customOptions,function(e){return s("el-option",{key:e.value,attrs:{label:e.name,value:e.value}})})):e._e(),e._v(" "),s("el-button",{attrs:{type:"primary"},nativeOn:{click:function(t){e.postFiltrateValue()}}},[e._v("搜索")]),e._v(" "),e._t("default")],2)},[],!1,null,"7c6c0e5c",null);d.options.__file="filtrateHandleView.vue";t.a=d.exports},"oj9+":function(e,t,s){"use strict";var a=s("gXW+");t.a={data:function(){return{chartColors:["#6CA2FF","#6AC9D7","#72DCA2","#48E78D","#FECD51","#DBB375","#FF7474","#F59561","#A3AEBC","#4C84FF","#0DBEB4","#00DEDE","#FFAA00","#C7C116","#F7A57C","#F661AC","#8652EE"]}},components:{filtrateHandleView:a.a},props:{},computed:{},watch:{},mounted:function(){},methods:{},deactivated:function(){}}},u7bZ:function(e,t,s){},uKQN:function(e,t,s){"use strict";var a=s("7Qib"),n={name:"TimeTypeSelect",props:{defaultType:Object},data:function(){return{selectType:{label:"本年",value:"year"},showTypePopover:!1,showCustomContent:!1,sureCustomContent:!1,startTime:"",endTime:"",typeOptions:[{label:"今天",value:"today"},{label:"昨天",value:"yesterday"},{label:"本周",value:"week"},{label:"上周",value:"lastWeek"},{label:"本月",value:"month"},{label:"上月",value:"lastMonth"},{label:"本季度",value:"quarter"},{label:"上季度",value:"lastQuarter"},{label:"本年",value:"year"},{label:"去年",value:"lastYear"}]}},computed:{iconClass:function(){return this.showTypePopover?"arrow-up":"arrow-down"},typeShowValue:function(){return this.sureCustomContent?this.startTime||this.endTime?(this.startTime||"")+"-"+(this.endTime||""):"":this.selectType.label}},mounted:function(){this.defaultType?this.selectType=this.defaultType:this.$emit("change",{type:"default",value:this.selectType.value})},methods:{typeSelectClick:function(e){this.showTypePopover=!1,this.sureCustomContent=!1,this.showCustomContent=!1,this.selectType=e,this.$emit("change",{type:"default",value:this.selectType.value})},customSureClick:function(){this.startTime&&this.endTime&&(this.sureCustomContent=!0,this.showTypePopover=!1,this.$emit("change",{type:"custom",startTime:Object(a.d)(this.startTime),endTime:Object(a.d)(this.endTime)}))}}},i=(s("ubXe"),s("KHd+")),l=Object(i.a)(n,function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("el-popover",{attrs:{placement:"bottom",width:"200","popper-class":"no-padding-popover",trigger:"click"},model:{value:e.showTypePopover,callback:function(t){e.showTypePopover=t},expression:"showTypePopover"}},[s("div",{staticClass:"type-popper"},[s("div",{staticClass:"type-content"},[e._l(e.typeOptions,function(t,a){return s("div",{key:a,staticClass:"type-content-item",class:{selected:e.selectType.value==t.value&&!e.showCustomContent},on:{click:function(s){e.typeSelectClick(t)}}},[s("div",{staticClass:"mark"}),e._v(e._s(t.label)+"\n      ")])}),e._v(" "),s("div",{staticClass:"type-content-item",class:{selected:e.showCustomContent},on:{click:function(t){e.showCustomContent=!0}}},[s("div",{staticClass:"mark"}),e._v("自定义\n      ")])],2),e._v(" "),e.showCustomContent?s("div",{staticClass:"type-content-custom"},[s("el-date-picker",{attrs:{type:"date","value-format":"yyyy-MM-dd",placeholder:"选择日期"},model:{value:e.startTime,callback:function(t){e.startTime=t},expression:"startTime"}}),e._v(" "),s("el-date-picker",{attrs:{type:"date","value-format":"yyyy-MM-dd",placeholder:"选择日期"},model:{value:e.endTime,callback:function(t){e.endTime=t},expression:"endTime"}}),e._v(" "),s("el-button",{on:{click:e.customSureClick}},[e._v("确定")])],1):e._e()]),e._v(" "),s("el-input",{staticClass:"type-select",attrs:{slot:"reference",readonly:!0,placeholder:"请选择选择"},slot:"reference",model:{value:e.typeShowValue,callback:function(t){e.typeShowValue=t},expression:"typeShowValue"}},[s("i",{class:["el-input__icon","el-icon-"+e.iconClass],attrs:{slot:"suffix"},slot:"suffix"})])],1)},[],!1,null,"7314d766",null);l.options.__file="index.vue";t.a=l.exports},ubXe:function(e,t,s){"use strict";var a=s("u7bZ");s.n(a).a},yXUI:function(e,t,s){"use strict";var a=s("9e0i");s.n(a).a}}]);