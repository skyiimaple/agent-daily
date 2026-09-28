<template>
  <div class="wg">
    <!-- 表单 -->
    <a-row :gutter="16" class="select-form">
      <a-col :span="12">
        <a-select
          v-model:value="productSelectedList"
          mode="multiple"
          style="width: 100%"
          placeholder="选择产品项目"
          :options="productOptionList"
          :allowClear="true"
        ></a-select>
      </a-col>
      <a-col :span="12">
        <a-select
          v-model:value="memberSelectedList"
          mode="multiple"
          style="width: 100%"
          placeholder="选择团队成员"
          :options="memberOptionList"
          :allowClear="true"
        ></a-select>
      </a-col>
    </a-row>
    <div class="btn-wrap">
      <a-button type="primary" @click="reset()">重置</a-button>
    </div>
    <!-- 输入框 -->
    <div class="text-input">
      <a-textarea
        v-model:value="inputData"
        placeholder="请复制粘贴表格数据（注意：除了备注其它均不能为空！）"
        show-count
        :auto-size="{ minRows: 10 }"
      ></a-textarea>
    </div>
    <div class="btn-wrap">
      <a-button v-if="inputData" @click="inputData = ''" class="btn-clear">清空</a-button>
      <a-button type="primary" @click="formatOriginData()">格式化</a-button>
    </div>
    <!-- 输出框 -->
    <div class="text-input">
      <a-textarea v-model:value="outputData" placeholder="等待生成..." show-count :auto-size="{ minRows: 10 }"></a-textarea>
    </div>
    <div class="btn-wrap">
      <a-button v-if="outputData" @click="outputData = ''" class="btn-clear">清空</a-button>
      <a-button type="primary" @click="copyResult()">复制</a-button>
    </div>
  </div>
  <a-back-top style="margin-bottom: 5%" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { countBy, groupBy, maxBy, orderBy } from 'lodash-es';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

interface OptionType {
  label: string;
  value: string;
}

/* 输入数据 */
const inputData = ref<string>(``);
/* 输出数据 */
const outputData = ref<string>('');

const memberSelectedList = ref<string[]>([]);
const memberOptionList = ref<OptionType[]>([]);

const productSelectedList = ref<string[]>([]);
const productOptionList = ref<OptionType[]>([]);

/**
 * 字段
 */
const keyList = ['product', 'version', 'releaseDate', 'module', 'task', 'person', 'costPlan', 'costTotal', 'process', 'status', 'effect'];

/**
 * 产品
 */
const productMap = {
  YING: '慧盈业财平台',
  CRM: '慧算账运营平台',
  SQAP: '服务质量分析平台',
  IDP: '慧眼数据平台',
  HSZ: '慧算账官网',
  CP: '云手机',
  SATP: '慧算账财税业务平台',
};

/**
 * 成员
 */
const MemberDefaultList = ['苏子枫'];

/**
 * 类型定义
 */
interface WeeklyItem {
  /** 产品 */
  product: string;
  /** 版本 */
  version: string;
  /** 发布时间 */
  releaseDate: string;
  /** 涉及模块 */
  module: string;
  /** 任务名称 */
  task: string;
  /** 负责人 */
  person: string;
  /** 任务状态 */
  status: string;
  /** 进度 */
  process: string;
  /** 预计消耗时间 */
  costPlan: string | number;
  /** 已投入时间 */
  costTotal: string | number;
  /** 产出 */
  effect: string;
  /** 备注 */
  remark: string;
}

/**
 * 格式化处理
 */
const formatOriginData = () => {
  // console.log(memberSelectedList.value);
  // console.log(productSelectedList.value);

  if (!(memberSelectedList.value && memberSelectedList.value.length)) {
    message.error('请选择团队成员');
    return;
  }
  if (!(productSelectedList.value && productSelectedList.value.length)) {
    message.error('请选择产品项目');
    return;
  }

  if (!inputData.value) {
    message.error('请输入');
    return;
  }

  try {
    // 处理行数据
    const originList = inputData.value.split('\n').filter(Boolean); // 过滤空行
    // 处理字段数据
    const originList2: WeeklyItem[] = originList.map((item) => {
      const itemList = item.split(/\t+/);
      return keyList.reduce((obj, key, i) => {
        obj[key as keyof WeeklyItem] = itemList[i] || '';
        return obj;
      }, {} as WeeklyItem);
    });
    // 输出文本
    outputData.value = convertToResult(originList2);
  } catch (e) {
    console.error(e);
    message.error(`发生错误：${e}`);
  }
};

/**
 * 数据转文本
 * @param list
 */
const convertToResult = (list: WeeklyItem[]) => {
  let res = '';

  // 选择超过 1 人，才生成团队周报
  if (memberSelectedList.value.length > 1) {
    // 团队周报
    res += buildTeamWeekly(list);
  }
  // 个人周报
  res += buildPersonWeekly(list);

  // console.log(res);

  return res;
};

/**
 * 构建团队周报
 * @param list
 */
const buildTeamWeekly = (list: WeeklyItem[]) => {
  let res = '';
  res += `----------\n`;
  res += '业财前端部：\n';
  res += getWeeklySummary(list);
  res += '\n';
  return res;
};

/**
 * 构建个人周报
 * @param list
 */
const buildPersonWeekly = (list: WeeklyItem[]) => {
  let _memberList: string[] = [];
  memberSelectedList.value.map((ms) => {
    _memberList.push(ms);
  });

  let res = '';
  _memberList.forEach((name) => {
    const nameList = list.filter((t) => t.person.includes(name));
    res += `\n----------\n`;
    res += `${name}：\n`;
    res += getWeeklySummary(nameList) + '\n';
  });
  return res;
};

/**
 * 获取周总结
 * @param list
 */
const getWeeklySummary = (list: WeeklyItem[]) => {
  let res = '本周总结：';

  // 选中的产品项目
  const _productMap = productSelectedList.value.reduce((map: Record<string, string>, item) => {
    map[item] = item;
    return map;
  }, {});

  // 按版本排序
  list = orderBy(list, 'version');

  // 产品
  let pMap = groupBy(list, 'product');
  Object.keys(pMap).forEach((p) => {
    if (Object.keys(_productMap).includes(p)) {
      res += `\n${p}（${productMap[p as keyof typeof productMap]}）：\n`;
      // 版本
      let vMap = groupBy(pMap[p], 'version');
      Object.keys(vMap).forEach((v) => {
        // 格式化日期
        let _dateFormat = dayjs(vMap[v][0].releaseDate).format('YYYY-MM-DD');
        _dateFormat = _dateFormat === 'Invalid Date' ? vMap[v][0].releaseDate : _dateFormat;
        res += `- v${v}（${_dateFormat}）：${getVersionSummary(vMap[v])}\n`;
        // 任务
        vMap[v].map((t) => {
          res += `  - ${t.task}：${t.status}（${t.process}），ROI：预计 ${t.costPlan} 人天，已投入 ${t.costTotal} 人天， 预计产出：${t.effect}`;
          if (t.remark && t.remark.length > 1) {
            res += ` // ${t.remark}\n`;
          } else {
            res += '\n';
          }
        });
      });
    }
  });

  res += `\n下周计划：\n`;
  res += `- 以上未完成任务持续进行`;
  return res;
};

/**
 * 获取版本总结
 * @param list
 */
const getVersionSummary = (list: WeeklyItem[]) => {
  let moduleList: any[] = [];
  list.map((t) => {
    moduleList.push(t.module);
  });
  const totalCostPlan = getCostByKey(list, 'costPlan');
  const totalCostTotal = getCostByKey(list, 'costTotal');
  const totalProcess = getTotalProcess(list);
  const totalStatus = getTotalStatus(list);
  return `${Array.from(new Set(moduleList)).join('、')}（${totalStatus}（${totalProcess}），预计 ${totalCostPlan} 人天，已投入 ${totalCostTotal} 人天）`;
};

/**
 * 根据字段名获取总时间
 */
const getCostByKey = (list: WeeklyItem[], key: keyof Pick<WeeklyItem, 'costPlan' | 'costTotal'>): number => {
  return list.reduce((sum, item) => {
    const value = Number(item[key]);
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);
};

/**
 * 获取总进度
 */
const getTotalProcess = (list: WeeklyItem[]): string => {
  const totalProcess = list.reduce((sum, item) => {
    const p = parseInt(item.process.replace('%', '')) || 0;
    return sum + p;
  }, 0);
  return `${Math.round(totalProcess / list.length)}%`;
};

/**
 * 获取总状态
 */
const getTotalStatus = (list: WeeklyItem[]): string => {
  const statusList = list.map((item) => item.status);
  const countObj = countBy(statusList);
  return maxBy(Object.entries(countObj), ([_, count]) => count)?.[0] || '';
};

/**
 * 复制
 */
const copyResult = () => {
  if (!outputData.value) {
    message.warning('无内容');
    return;
  }
  navigator.clipboard.writeText(outputData.value);
  message.success('已复制');
};

const reset = () => {
  // 产品项目
  productSelectedList.value = [];
  productOptionList.value = [];
  Object.keys(productMap).map((k: string) => {
    const item = {
      label: productMap[k as keyof typeof productMap],
      value: k,
    };
    productSelectedList.value.push(k);
    productOptionList.value.push(item);
  });

  // 团队成员
  memberSelectedList.value = [];
  memberOptionList.value = [];
  MemberDefaultList.map((m: string) => {
    const item = {
      label: m,
      value: m,
    };
    memberSelectedList.value.push(m);
    memberOptionList.value.push(item);
  });
};

onMounted(() => {
  reset();
});
</script>

<style>
.wg {
  padding: 24px;
}
.select-form {
  margin-bottom: 16px;
}
.btn-wrap {
  margin: 16px 0 16px 0;
  text-align: right;
}
.btn-clear {
  margin-right: 16px;
}
.text-input {
  margin-bottom: 24px;
}
</style>
