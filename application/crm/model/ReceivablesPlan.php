<?php
// +----------------------------------------------------------------------
// | Description: 回款计划计划
// +----------------------------------------------------------------------
// | Author:  Michael_xu | gengxiaoxu@5kcrm.com
// +----------------------------------------------------------------------
namespace app\crm\model;

use think\Db;
use app\admin\model\Common;
use app\crm\model\Contract as ContractModel;
use think\Request;
use think\Validate;

class ReceivablesPlan extends Common
{
	/**
     * 为了数据库的整洁，同时又不影响Model和Controller的名称
     * 我们约定每个模块的数据表都加上相同的前缀，比如CRM模块用crm作为数据表前缀
     */
	protected $name = 'crm_receivables_plan';
    protected $createTime = 'create_time';
    protected $updateTime = 'update_time';
	protected $autoWriteTimestamp = true;

	/**
     * [getDataList 回款计划list]
     * @author Michael_xu
     * @param     [string]                   $map [查询条件]
     * @param     [number]                   $page     [当前页数]
     * @param     [number]                   $limit    [每页数量]
     * @param     [string]                   $types    1 未使用的回款计划
     * @return    [array]                    [description]
     */		
	public function getDataList($request)
    {  	
    	$userModel = new \app\admin\model\User();
		$search = $request['search'];
    	$user_id = $request['user_id'];
    	$scene_id = (int)$request['scene_id'];
    	$check_status = $request['check_status'];
    	$types = $request['types'];
		unset($request['scene_id']);
		unset($request['search']);
		unset($request['user_id']);	    	
		unset($request['check_status']);	    	
		unset($request['types']);	    	

        $request = $this->fmtRequest( $request );
        $map = $request['map'] ? : [];
        if (isset($map['search'])) {
			//普通筛选
			$map['name'] = ['like', '%'.$map['search'].'%'];
			unset($map['search']);
		} else {
			$map = where_arr($map, 'crm', 'receivables_plan', 'index'); //高级筛选
		}
		if ($map['receivables_plan.owner_user_id']) {
			$map['contract.owner_user_id'] = $map['receivables_plan.owner_user_id'];
			unset($map['receivables_plan.owner_user_id']);
		}
		$whereData = [];
		if ($check_status) {
			unset($map['receivables_plan.check_status']);
			if ($check_status == 2) {
				$map['receivables.check_status'] = $check_status;
			} else {
				unset($map['receivables_plan.receivables_id']);
				$data = [];
				$data['check_status'] = $check_status;
				$whereData = function($query) use ($data){
					        	$query->where(['receivables_plan.receivables_id'=> ['eq',0]])
						        	->whereOr(['receivables.check_status' => $data['check_status']]);					
								};
			}
		}
		// @ymob 2019-12-11 17:51:54
		// 修改回款时，回款计划选项列表应该包含该回款对应的回款计划 不能过滤
		// 原来的 $types 不知道是啥 没备注
		if ($request['map']['receivables_id']) {
			$map = " 
				`receivables_plan`.`contract_id` = {$request['map']['contract_id']} 
				AND (
					`receivables_plan`.`receivables_id` = 0
					OR `receivables_plan`.`receivables_id`= {$request['map']['receivables_id']}
				)
			";
		} elseif ($types == 1) {
			$map['receivables_plan.receivables_id']  = 0;
		}
		$list = db('crm_receivables_plan')
				->alias('receivables_plan')
				->join('__CRM_CONTRACT__ contract','receivables_plan.contract_id = contract.contract_id','LEFT')
				->join('__CRM_CUSTOMER__ customer','receivables_plan.customer_id = customer.customer_id','LEFT')
				->join('__CRM_RECEIVABLES__ receivables','receivables_plan.plan_id = receivables.plan_id','LEFT')
				->limit(($request['page']-1)*$request['limit'], $request['limit'])
				->field('receivables_plan.*,customer.name as customer_name,contract.num as contract_name,receivables.receivables_id,receivables.check_status')
				->where($map)
				->where($whereData)				
				->select();
		$dataCount = db('crm_receivables_plan')
					->alias('receivables_plan')
					->join('__CRM_CONTRACT__ contract','receivables_plan.contract_id = contract.contract_id','LEFT')
					->join('__CRM_CUSTOMER__ customer','receivables_plan.customer_id = customer.customer_id','LEFT')
					->join('__CRM_RECEIVABLES__ receivables','receivables_plan.plan_id = receivables.plan_id','LEFT')		
					->where($map)
					->where($whereData)	
					->count('receivables_plan.plan_id');
        foreach ($list as $k=>$v) {
        	$list[$k]['create_user_id_info'] = $userModel->getUserById($v['create_user_id']);
        	$list[$k]['contract_id_info']['name'] = $v['contract_name'] ? : '';
        	$list[$k]['contract_id_info']['contract_id'] = $v['contract_id'] ? : '';
			$list[$k]['customer_id_info']['name'] = $v['customer_name'] ? : '';
        	$list[$k]['customer_id_info']['customer_id'] = $v['customer_id'] ? : '';	
        }
        $data = [];
        $data['list'] = $list;
        $data['dataCount'] = $dataCount ? : 0;
        return $data ? : [];
    }

	/**
	 * 创建回款计划信息
	 * @author Michael_xu
	 * @param  
	 * @return                            
	 */	
	public function createData($param)
	{	
		if (!$param['contract_id']) {
			$this->error = '请先选择合同';
			return false;
		} else {
			$res = ContractModel::where(['contract_id' => $param['contract_id']])->value('check_status');
			if (6 == ContractModel::where(['contract_id' => $param['contract_id']])->value('check_status')) {
				$this->error = '合同已作废';
				return false;
			}
		}
		if ($param['remind'] > 90) {
			$this->error = '提前提醒最大时间为 90 天';
			return false;
		}
		// 自动验证
		$validate = validate($this->name);
		if (!$validate->check($param)) {
			$this->error = $validate->getError();
			return false;
		}
		if ($param['file_ids']) $param['file'] = arrayToString($param['file_ids']); //附件
		//期数规则（1,2,3..）
		$maxNum = db('crm_receivables_plan')->where(['contract_id' => $param['contract_id']])->max('num');
		$param['num'] = $maxNum ? $maxNum+1 : 1;
		//提醒日期
		$param['remind_date'] = $param['remind'] ? date('Y-m-d',strtotime($param['return_date'])-86400*$param['remind']) : $param['return_date'];
		if ($this->data($param)->allowField(true)->save()) {
			$data = [];
			$data['plan_id'] = $this->plan_id;
			return $data;
		} else {
			$this->error = '添加失败';
			return false;
		}			
	}

	/**
	 * 编辑回款计划
	 * @author Michael_xu
	 * @param  
	 * @return                            
	 */	
	public function updateDataById($param, $plan_id = '')
	{
		$dataInfo = $this->getDataById($plan_id);
		if (!$dataInfo) {
			$this->error = '数据不存在或已删除';
			return false;
		}
		$param['plan_id'] = $plan_id;
		//过滤不能修改的字段
		$unUpdateField = ['num','create_user_id','is_deleted','delete_time','delete_user_id'];
		foreach ($unUpdateField as $v) {
			unset($param[$v]);
		}
		
		// 自动验证
		$validate = validate($this->name);
		if (!$validate->check($param)) {
			$this->error = $validate->getError();
			return false;
		}
		if ($param['file_ids']) $param['file'] = arrayToString($param['file_ids']); //附件
		//提醒日期
		$param['remind_date'] = $param['remind'] ? date('Y-m-d',strtotime($param['return_date'])-86400*$param['remind']) : $param['return_date'];		
		if ($this->allowField(true)->save($param, ['plan_id' => $plan_id])) {
			$data = [];
			$data['plan_id'] = $plan_id;
			return $data;
		} else {
			$this->error = '编辑失败';
			return false;
		}					
	}

	/**
     * 回款计划数据
     * @param  $id 回款计划ID
     * @return 
     */	
   	public function getDataById($id = '')
   	{   		
   		$map['plan_id'] = $id;
		$dataInfo = $this->where($map)->find();
		if (!$dataInfo) {
			$this->error = '暂无此数据';
			return false;
		}
		$userModel = new \app\admin\model\User();
		$dataInfo['create_user_info'] = $userModel->getUserById($dataInfo['create_user_id']);
		$dataInfo['plan_id'] = $id;
		return $dataInfo;
   	}

	//模拟自定义字段返回
	public function getField()
	{	
		$field_arr = [
			'0' => [
				'field' => 'customer_id',
				'name' => '客户名称',
				'form_type' => 'customer',
				'setting' => []
			],
			'1' => [
				'field' => 'contract_id',
				'name' => '合同名称',
				'form_type' => 'contract',
				'setting' => []
			],	
			'2' => [
				'field' => 'money',
				'name' => '计划回款金额',
				'form_type' => 'floatnumber',
				'setting' => []
			],
			'3' => [
				'field' => 'return_date',
				'name' => '计划回款日期',
				'form_type' => 'date',
				'setting' => []
			],
			'4' => [
				'field' => 'return_type',
				'name' => '计划回款方式',
				'form_type' => 'select',
				'setting' => '支付宝\n微信\n转账'
			],
			'5' => [
				'field' => 'remind',
				'name' => '提前几日提醒',
				'form_type' => 'number',
				'setting' => []
			],			
			'6' => [
				'field' => 'remark',
				'name' => '备注',
				'form_type' => 'textarea',
				'setting' => []
			],			
			'7' => [
				'field' => 'file',
				'name' => '附件',
				'form_type' => 'file',
				'setting' => []
			]
		];
		return $field_arr;
	} 	  	
}