const map = L.map("map", {
  maxZoom: 18,
  maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
  maxBoundsViscosity: 1.0,
  zoomControl: false,
  attributionControl: false,
}).setView([35.8617, 104.1954], 5);

L.control
  .zoom({
    position: "topright",
  })
  .addTo(map);

L.control
  .scale({
    position: "bottomleft",
    metric: true,
    imperial: false,
  })
  .addTo(map);

const tiandituKey = "3767d31e6dfc63797664e73af20dbbd7";
L.tileLayer(
  `https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${tiandituKey}`,
  { attribution: "" }
).addTo(map);
L.tileLayer(
  `https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${tiandituKey}`,
  { attribution: "" }
).addTo(map);

const typeColors = {
  // 电力部门
  太阳能: "#f9951cff",
  风能: "#56a0d3",
  煤电: "#f5d31066",
  生物质能: "#228b22",
  // 其他部门
  粗钢: "#82A683",
  水泥: "#DEB887",
};

const departmentSelect = document.getElementById("department-select");
const typeFiltersContainer = document.getElementById("type-filters");
const totalCountEl = document.getElementById("total-count");
const legendTitleEl = document.getElementById("legend-title");
const legendUnitEl = document.getElementById("legend-unit");
const filterTitleEl = document.getElementById("filter-title");
let dataLayer = L.layerGroup().addTo(map);

// 数据加载的映射和缓存
const dataLoaders = {
  power: () => import("./data/powerData.js").then((m) => m.powerData),
  steel: () => import("./data/steelData.js").then((m) => m.steelData),
  cement: () => import("./data/cementData.js").then((m) => m.cementData),
};
const loadedDataCache = {};
let currentDepartmentData = [];

function renderMap() {
  dataLayer.clearLayers();
  const selectedDepartment = departmentSelect.value;
  const departmentData = currentDepartmentData;
  const checkedTypes = Array.from(
    document.querySelectorAll("#type-filters .type-checkbox:checked")
  ).map((input) => input.value);

  if (!departmentData || departmentData.length === 0) {
    totalCountEl.textContent = 0;
    return;
  }

  const visibleData = departmentData.filter((point) =>
    checkedTypes.includes(point.type)
  );
  totalCountEl.textContent = visibleData.length;

  if (selectedDepartment === "power") {
    legendTitleEl.textContent = "发电容量";
    legendUnitEl.textContent = "单位:  兆瓦(MW)";
  } else if (selectedDepartment === "cement") {
    legendTitleEl.textContent = "水泥产能";
    legendUnitEl.textContent = "单位: 百万吨/年";
  } else if (selectedDepartment === "steel") {
    legendTitleEl.textContent = "钢铁产能";
    legendUnitEl.textContent = "单位: 千吨/年 (ttpa)";
  }

  visibleData.forEach((point) => {
    if (
      point.coords &&
      Array.isArray(point.coords) &&
      point.coords.length === 2
    ) {
      const color = typeColors[point.type] || "#0578e4ff";
      let radiusMultiplier = 30;

      if (selectedDepartment === "cement") {
        radiusMultiplier = 4000;
      } else if (selectedDepartment === "steel") {
        radiusMultiplier = 5;
      }
      const radius = point.capacity * radiusMultiplier;

      const wgsCoords = point.coords;
      const gcjCoordsArray = coordtransform.wgs84togcj02(
        wgsCoords[1],
        wgsCoords[0]
      );
      const leafletCoords = [gcjCoordsArray[1], gcjCoordsArray[0]];

      const circle = L.circle(leafletCoords, {
        radius: radius,
        color: color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.5,
      }).addTo(dataLayer);

      const popupContent = `<b>${point.name}</b><br>类型: ${point.type}<br>产能: ${point.capacity}`;
      circle.bindPopup(popupContent);
      circle.on("mouseover", function (e) {
        this.openPopup();
      });
      circle.on("mouseout", function (e) {
        this.closePopup();
      });
    } else {
      console.warn("跳过一个无效坐标的数据点:", point);
    }
  });
}

async function updateFiltersAndEvents() {
  const selectedDepartment = departmentSelect.value;
  let departmentData;

  // 检查缓存，如果已加载，则直接使用
  if (loadedDataCache[selectedDepartment]) {
    departmentData = loadedDataCache[selectedDepartment];
  } else {
    // 动态导入数据，并缓存
    try {
      departmentData = await dataLoaders[selectedDepartment]();
      loadedDataCache[selectedDepartment] = departmentData;
      console.log(`成功加载并缓存 ${selectedDepartment} 部门数据.`);
    } catch (error) {
      console.error(`加载 ${selectedDepartment} 部门数据失败:`, error);
      departmentData = [];
    }
  }

  currentDepartmentData = departmentData;

  typeFiltersContainer.innerHTML = "";
  if (!departmentData || departmentData.length === 0) {
    return;
  }

  filterTitleEl.textContent =
    selectedDepartment === "power" ? "燃料类型" : "类型筛选";
  const selectAllHTML = `<div class="filter-item select-all-container"><label><input type="checkbox" id="select-all" checked>全选</label></div>`;
  typeFiltersContainer.innerHTML = selectAllHTML;
  const types = [...new Set(departmentData.map((p) => p.type))];
  types.forEach((type) => {
    const color = typeColors[type] || "#0578e4ff";
    const filterItem = document.createElement("div");
    filterItem.className = "filter-item";
    filterItem.innerHTML = `<label><input type="checkbox" class="type-checkbox" value="${type}" checked><span class="color-box" style="background-color: ${color};"></span>${type}</label>`;
    typeFiltersContainer.appendChild(filterItem);
  });

  const selectAllCheckbox = document.getElementById("select-all");
  const typeCheckboxes = document.querySelectorAll(".type-checkbox");
  selectAllCheckbox.addEventListener("change", () => {
    typeCheckboxes.forEach((checkbox) => {
      checkbox.checked = selectAllCheckbox.checked;
    });
    renderMap();
  });
  typeCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      selectAllCheckbox.checked = Array.from(typeCheckboxes).every(
        (cb) => cb.checked
      );
      renderMap();
    });
  });

  // 确保在数据加载和筛选器更新后才调用 renderMap
  renderMap();
}

departmentSelect.addEventListener("change", () => {
  updateFiltersAndEvents();
});

function initialLoad() {
  updateFiltersAndEvents();
}
initialLoad();
