# generate_yearly_sales_kimbap.py
import json
import random
import csv
from datetime import datetime, timedelta
from collections import defaultdict

# CSV에서 추출한 실제 메뉴
MENUS = [
    "원조김밥(줄)", "참치김밥(줄)", "치즈김밥(줄)",
    "라면(그릇)", "치즈라면(그릇)", "우동(그릇)",
    "떡볶이(접시)", "라볶이(접시)",
    "비빔냉면(그릇)", "물냉면(그릇)",
    "돈가스(접시)", "제육덮밥(그릇)", "오므라이스(그릇)",
    "만두(접시)", "어묵탕(그릇)"
]

# CSV 2달치 데이터 기반 평균 판매량
BASE_SALES = {
    "원조김밥(줄)": 48,
    "참치김밥(줄)": 38,
    "치즈김밥(줄)": 32,
    "라면(그릇)": 29,
    "치즈라면(그릇)": 23,
    "우동(그릇)": 19,
    "떡볶이(접시)": 28,
    "라볶이(접시)": 17,
    "비빔냉면(그릇)": 13,
    "물냉면(그릇)": 14,
    "돈가스(접시)": 21,
    "제육덮밥(그릇)": 19,
    "오므라이스(그릇)": 17,
    "만두(접시)": 15,
    "어묵탕(그릇)": 10
}

def generate_daily_sales(menu, date):
    """날짜/메뉴별 판매량 생성"""
    base = BASE_SALES[menu]
    dow = date.weekday()
    month = date.month
    
    # 1) 요일 가중치
    dow_mult = {
        0: 0.90,  # 월
        1: 0.95,  # 화
        2: 1.00,  # 수
        3: 1.00,  # 목
        4: 1.15,  # 금
        5: 1.30,  # 토
        6: 1.25   # 일
    }[dow]
    
    # 2) 계절 가중치
    season_mult = 1.0
    
    # 여름 (6-8월): 냉면↑, 뜨거운 음식↓
    if month in [6, 7, 8]:
        if "냉면" in menu:
            season_mult = 1.4
        elif "우동" in menu or "라면" in menu or "찌개" in menu:
            season_mult = 0.75
        elif "김밥" in menu:
            season_mult = 1.1
    
    # 겨울 (12-2월): 뜨거운 음식↑, 냉면↓
    elif month in [12, 1, 2]:
        if "냉면" in menu:
            season_mult = 0.6
        elif "우동" in menu or "라면" in menu or "어묵탕" in menu:
            season_mult = 1.35
        elif "떡볶이" in menu or "라볶이" in menu:
            season_mult = 1.2
    
    # 봄/가을 (3-5월, 9-11월): 평이
    else:
        season_mult = 1.0
    
    # 3) 랜덤 노이즈 (±12%)
    noise = random.uniform(0.88, 1.12)
    
    # 4) 이벤트 (월 1-2회 랜덤 특수일)
    event_mult = 1.0
    if random.random() < 0.05:  # 5% 확률로 이벤트
        event_mult = random.uniform(1.3, 1.6)
    
    result = base * dow_mult * season_mult * noise * event_mult
    return max(5, int(result))  # 최소 5개

def generate_yearly_data(year=2024):
    """1년치 일별 데이터 생성"""
    start_date = datetime(year, 1, 1)
    end_date = datetime(year, 12, 31)
    
    data = []
    current = start_date
    
    while current <= end_date:
        for menu in MENUS:
            qty = generate_daily_sales(menu, current)
            
            # 온도 생성 (계절별)
            month = current.month
            if month in [12, 1, 2]:      # 겨울
                temp = random.uniform(0, 10)
            elif month in [3, 4, 5]:     # 봄
                temp = random.uniform(10, 20)
            elif month in [6, 7, 8]:     # 여름
                temp = random.uniform(22, 32)
            else:                         # 가을
                temp = random.uniform(12, 22)
            
            # 이벤트 플래그 (공휴일 등)
            is_event = 1 if current.weekday() >= 5 and random.random() < 0.1 else 0
            
            data.append({
                "date": current.strftime("%Y-%m-%d"),
                "weekday": current.strftime("%a"),
                "menu": menu,
                "sales": qty,
                "temp": round(temp, 1),
                "event": is_event
            })
        
        current += timedelta(days=1)
    
    return data

def aggregate_weekly(daily_data):
    """주차별 집계"""
    weekly = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    
    for record in daily_data:
        date = datetime.strptime(record["date"], "%Y-%m-%d")
        year = date.year
        month = date.month
        week = (date.day - 1) // 7 + 1  # 1-5주차
        
        menu = record["menu"]
        qty = record["sales"]
        
        weekly[year][month][menu] = weekly[year][month].get(menu, {})
        weekly[year][month][menu][week] = weekly[year][month][menu].get(week, 0) + qty
    
    return weekly

def format_for_frontend(weekly_data):
    """프론트엔드 차트용 포맷"""
    result = {}
    
    for year, months in weekly_data.items():
        for month, menus in months.items():
            key = f"{year}-{month:02d}"
            result[key] = {}
            
            for menu, weeks in menus.items():
                # 주차별 리스트 [1주차, 2주차, 3주차, 4주차, 5주차]
                weekly_list = [weeks.get(w, 0) for w in range(1, 6)]
                result[key][menu] = weekly_list
    
    return result

def save_to_csv(daily_data, filename="sales_daily_2024.csv"):
    """CSV 파일로 저장"""
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['date', 'weekday', 'menu', 'sales', 'temp', 'event'])
        writer.writeheader()
        writer.writerows(daily_data)

# ========== 실행 ==========
if __name__ == "__main__":
    print("📊 1년치 판매 데이터 생성 중...")
    
    # 1) 일별 데이터 생성
    daily_sales = generate_yearly_data(2024)
    
    # 2) 주차별 집계
    weekly_sales = aggregate_weekly(daily_sales)
    
    # 3) 프론트엔드용 포맷
    frontend_data = format_for_frontend(weekly_sales)
    
    # 4) 파일 저장
    # JSON 저장
    with open("sales_yearly_2024.json", "w", encoding="utf-8") as f:
        json.dump(frontend_data, f, ensure_ascii=False, indent=2)
    
    # CSV 저장
    save_to_csv(daily_sales, "sales_daily_2024.csv")
    
    print("✅ 완료!")
    print(f"- 일별 데이터: {len(daily_sales)}개 레코드")
    print(f"- 월별 데이터: {len(frontend_data)}개월")
    print(f"- 메뉴 수: {len(MENUS)}개")
    print("- 파일: sales_yearly_2024.json, sales_daily_2024.csv")
