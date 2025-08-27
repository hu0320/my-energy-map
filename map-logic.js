// 1. 初始化地图和底图
const map = L.map("map", {
  minZoom: 2,
  maxZoom: 18,
  maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
  maxBoundsViscosity: 1.0,
}).setView([35.8617, 104.1954], 5);

const tiandituKey = "3767d31e6dfc63797664e73af20dbbd7";
L.tileLayer(
  `https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${tiandituKey}`,
  { attribution: "天地图" }
).addTo(map);
L.tileLayer(
  `https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${tiandituKey}`,
  { attribution: "天地图" }
).addTo(map);

// 2. 获取页面上的HTML元素
const departmentSelect = document.getElementById("department-select");
const typeFiltersContainer = document.getElementById("type-filters");
let dataLayer = L.layerGroup().addTo(map);

// 3. 核心绘图函数
function renderMap() {
  dataLayer.clearLayers();
  const selectedDepartment = departmentSelect.value;
  const departmentData = geoData[selectedDepartment];
  const checkedTypes = Array.from(
    document.querySelectorAll("#type-filters .type-checkbox:checked")
  ).map((input) => input.value);

  if (!departmentData) return;

  departmentData.forEach((point) => {
    if (checkedTypes.includes(point.type)) {
      const color = typeColors[point.type] || "#ff0000";
      const radius = point.capacity * 30;
      const circle = L.circle(point.coords, {
        radius: radius,
        color: color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.4,
      }).addTo(dataLayer);

      // --- 核心改动：从 "click" 改为 "mouseover" 和 "mouseout" ---

      // a. 定义悬浮时弹窗的简要内容
      const popupContent = `<b>${point.name}</b><br>类型: ${point.type}<br>产能: ${point.capacity}`;

      // b. 将内容绑定到圆点上
      circle.bindPopup(popupContent);

      // c. 添加鼠标悬浮事件，当鼠标进入圆点区域时，打开弹窗
      circle.on("mouseover", function (e) {
        this.openPopup();
      });

      // d. 添加鼠标移出事件，当鼠标离开时，关闭弹窗
      circle.on("mouseout", function (e) {
        this.closePopup();
      });
    }
  });
}

// 4. 更新筛选框并绑定所有事件的函数 (保持不变)
function updateFiltersAndEvents() {
  const selectedDepartment = departmentSelect.value;
  const departmentData = geoData[selectedDepartment];

  typeFiltersContainer.innerHTML = "";
  if (!departmentData) return;

  const selectAllHTML = `<div class="filter-item select-all-container"><label id="select-all-label"><input type="checkbox" id="select-all" checked>全选</label></div>`;
  typeFiltersContainer.innerHTML = selectAllHTML;

  const types = [...new Set(departmentData.map((p) => p.type))];

  types.forEach((type) => {
    const color = typeColors[type] || "#ff0000";
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
}

// 5. 绑定下拉菜单的事件监听
departmentSelect.addEventListener("change", () => {
  updateFiltersAndEvents();
  renderMap();
});

// 6. 页面首次加载时
function initialLoad() {
  updateFiltersAndEvents();
  renderMap();
}

initialLoad();
