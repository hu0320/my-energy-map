import pandas as pd
import json

def get_simplified_type(fuel_string):
    """根据输入的燃料描述字符串，返回简化的中文类型。"""
    if not isinstance(fuel_string, str):
        return "未知"
    
    fuel_lower = fuel_string.lower()
    
    if "solar" in fuel_lower:
        return "太阳能"
    elif "wind" in fuel_lower:
        return "风能"
    elif "coal" in fuel_lower:
        return "煤电"
    elif "bioenergy" in fuel_lower or "biomass" in fuel_lower:
        return "生物质能"
    else:
        return "其他"

try:
    # 读取CSV文件，并跳过格式错误的行
    df = pd.read_csv("source_data.csv", on_bad_lines='skip')

    # 移除关键信息不完整的行
    df.dropna(subset=['Latitude', 'Longitude', 'Capacity (MW)', 'Fuel'], inplace=True)

    # 创建一个新的DataFrame，只包含我们需要的列
    result_df = pd.DataFrame()
    
    # 严格按照要求的命名和顺序生成数据
    result_df['id'] = 'p' + (df.index + 1).astype(str).str.zfill(4)
    result_df['type'] = df['Fuel'].apply(get_simplified_type)
    result_df['capacity'] = df['Capacity (MW)']
    result_df['coords'] = df.apply(lambda row: [row['Latitude'], row['Longitude']], axis=1)
    
    # 将处理好的数据转换为字典列表
    output_list = result_df.to_dict(orient='records')
    
    # 构建最终的 geoData 结构
    final_structure = {
        "power": output_list,
        "steel": [],
        "cement": []
    }
    
    # 将Python字典转换为格式化的JSON字符串
    json_string = json.dumps(final_structure, indent=2, ensure_ascii=False)
    
    # 组合成最终的JavaScript变量声明
    output_for_js = "const geoData = " + json_string + ";"
    
    # 打印最终结果到终端
    save(output_for_js)

except FileNotFoundError:
    print("错误：找不到 source_data.csv 文件。请确保它和脚本在同一个文件夹中。")
except KeyError as e:
    print(f"错误：CSV文件中缺少必要的列: {e}。请检查您的CSV标题行是否正确。")
except Exception as e:
    print(f"处理过程中发生错误: {e}")