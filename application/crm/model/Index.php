<?php
// +----------------------------------------------------------------------
// | Description: CRM工作台
// +----------------------------------------------------------------------
// | Author:  Jerry_yan | yanjialin@tiefu66.com
// +----------------------------------------------------------------------
namespace app\crm\model;

use think\Db;
use app\admin\model\Common;
use think\Request;
use think\Validate;
use think\helper\Time;

class Index extends Common
{
	/**
	 * 销售简报
	 * @author Jerry_yan
	 * @param  
	 * @return                            
	 */	
	public function getSalesData($param)
	{
		$where = array();
		$start_time = $param['start_time'];
		$where['create_time'] = Time::today();
	}
} 		