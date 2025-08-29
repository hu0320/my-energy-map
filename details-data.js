const detailsData = {
  p01: {
    status: "运营中",
    owner: "国家电力投资集团",
    commission_year: 2020,
    details:
      "位于甘肃省，是西北地区大型光伏发电项目之一，利用丰富的太阳能资源发电。",
  },
  p02: {
    status: "运营中",
    owner: "中国华能集团",
    commission_year: 2018,
    details:
      "坐落于内蒙古高原，拥有数百台大型风力发电机组，为华北电网提供清洁能源。",
  },
  p03: {
    status: "运营中",
    owner: "大唐集团",
    commission_year: 2015,
    details:
      "一个现代化的大型燃煤电厂，采用了超超临界技术以提高效率并减少排放。",
  },
  p04: {
    status: "在建",
    owner: "光大环境",
    commission_year: 2024,
    details: "利用农作物秸秆等生物质废料进行发电，有助于解决农业废弃物问题。",
  },
  s01: {
    status: "运营中",
    owner: "河钢集团",
    commission_year: 2008,
    details:
      "中国北方重要的钢铁生产基地，产品广泛应用于建筑、汽车和家电等行业。",
  },
  s02: {
    status: "技术改造中",
    owner: "宝武钢铁集团",
    commission_year: 1995,
    details: "历史悠久的钢铁企业，目前正进行大规模的技术升级和绿色改造。",
  },
  c01: {
    status: "运营中",
    owner: "海螺水泥",
    commission_year: 2010,
    details: "采用先进的新型干法水泥生产线，是华东地区重要的建材供应商。",
  },
  c02: {
    status: "停产",
    owner: "华润水泥",
    commission_year: 2005,
    details: "因环保政策调整，该生产线目前处于停产状态，等待后续处理。",
  },
};

// 我们还需要保留颜色定义，可以放在任何一个数据文件里，或者单独放
const typeColors = {
  // 电力部门
  太阳能: "#f9951cff", // 黄色
  风能: "#56a0d3", // 蓝色
  煤电: "#f5d31066", // 灰色
  生物质能: "#228b22", // 绿色
  // 其他部门
  粗钢: "#82A683", // 银色
  水泥: "#DEB887", // 棕色
};
