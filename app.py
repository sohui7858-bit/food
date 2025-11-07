from flask import Flask, request, jsonify
from math import ceil
from statistics import mean
from collections import defaultdict
from datetime import date as _date
import pymysql

DB_HOST = 'database-1.cj24wem202yj.us-east-1.rds.amazonaws.com'
DB_USER = 'admin'
DB_PASS = 'tripleS1234!'
DB_NAME = 'fooddb'

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
app.config['JSONIFY_MIMETYPE'] = "application/json; charset=utf-8"

def get_conn(autocommit=False):
    return pymysql.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASS,
        database=DB_NAME, charset='utf8mb4', autocommit=autocommit
    )

# ---------- 발주 계산 ----------
def compute_ingredient_recommend(payload):
    sales7d       = payload.get("sales7d", {})
    recipes       = payload.get("recipes", {})
    stock_ing     = payload.get("stock_ingredient", {})
    package_meta  = payload.get("package_meta", {})
    safety_stock  = payload.get("safety_stock", {})
    lead_days     = int(payload.get("lead_days", 1) or 1)

    forecast = {m: (round(mean(v)) if v else 0) for m, v in sales7d.items()}
    daily_need = defaultdict(float)
    for menu, qty in forecast.items():
        if qty <= 0 or menu not in recipes: continue
        for ing, per_unit in recipes[menu].items():
            daily_need[ing] += float(per_unit) * qty
    need_total = {ing: amt * max(1, lead_days) for ing, amt in daily_need.items()}

    for ing, ss in (safety_stock or {}).items():
        have = float(stock_ing.get(ing, 0) or 0)
        gap = float(ss) - have
        if gap > 0:
            need_total[ing] = need_total.get(ing, 0.0) + gap

    recs = []
    for ing, need_amt in need_total.items():
        have_amt = float(stock_ing.get(ing, 0) or 0)
        order_amt = need_amt - have_amt
        if order_amt <= 0: continue
        pack = float(package_meta.get(ing, 1) or 1)
        if pack <= 0: pack = 1.0
        order_rounded = ceil(order_amt / pack) * pack
        recs.append({
            "item": ing, "have": round(have_amt,2), "need": round(need_amt,2),
            "order": round(order_rounded,2),
            "order_raw": round(order_amt,2),
            "pack_size": int(pack) if float(pack).is_integer() else pack
        })
    recs.sort(key=lambda x: x["order"], reverse=True)
    return recs, forecast

@app.route("/forecast", methods=["POST"])
def forecast_endpoint():
    payload = request.get_json(force=True, silent=True) or {}
    ingredient_recs, forecast = compute_ingredient_recommend(payload)
    menu_forecast = [{"item": m, "expected_sales": s} for m, s in forecast.items()]
    summary = "발주 권장 품목 없음" if not ingredient_recs else f"{len(ingredient_recs)}개 재료 발주 필요"
    compact = bool(payload.get("compact", False))
    if compact:
        ing_min = [{"item": r["item"], "have": r["have"], "need": r["need"], "order": r["order"]} for r in ingredient_recs]
        return jsonify({"summary": summary, "ingredient_recommend": ing_min, "menu_forecast": menu_forecast})
    return jsonify({"summary": summary, "menu_forecast": menu_forecast, "ingredient_recommend": ingredient_recs})

# ---------- 리포트 ----------
def _get_monthly_average(year, month, menu):
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT COALESCE(AVG(quantity), 0)
            FROM sales_history
            WHERE YEAR(sale_date)=%s AND MONTH(sale_date)=%s AND menu_name=%s
        """, (year, month, menu))
        row = cur.fetchone()
    conn.close()
    return round(row[0] if row else 0, 1)

@app.route("/report/monthly", methods=["GET"])
def report_monthly():
    year = int(request.args.get("year", 2024))
    month = int(request.args.get("month", 11))
    menu = request.args.get("menu", "원조김밥(줄)")
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT FLOOR((DAY(sale_date)-1)/7)+1 AS wk, SUM(quantity)
            FROM sales_history
            WHERE YEAR(sale_date)=%s AND MONTH(sale_date)=%s AND menu_name=%s
            GROUP BY wk ORDER BY wk
        """, (year, month, menu))
        rows = cur.fetchall()
    conn.close()
    weekly = [0]*5
    for wk,total in rows:
        if 1 <= wk <= 5: weekly[wk-1] = int(total or 0)
    return jsonify({"year":year,"month":month,"menu":menu,"weekly_sales":weekly})

@app.route("/report/comparison", methods=["GET"])
def report_comparison():
    year = int(request.args.get("year", 2024))
    month = int(request.args.get("month", 11))
    menu = request.args.get("menu", "원조김밥(줄)")
    current_avg = _get_monthly_average(year, month, menu)
    prev_month = month - 1 if month > 1 else 12
    prev_year = year if month > 1 else year - 1
    previous_avg = _get_monthly_average(prev_year, prev_month, menu)
    change_pct = ((current_avg - previous_avg)/previous_avg*100) if previous_avg>0 else 0.0
    return jsonify({
        "current_avg": current_avg,
        "previous_avg": previous_avg,
        "change_percent": round(change_pct,1),
        "message": f"전달 대비 평균 판매량이 {abs(change_pct):.1f}% {'늘었어요' if change_pct>0 else '줄었어요'}"
    })

@app.route("/report/menus", methods=["GET"])
def report_menus():
    menus = [
        "원조김밥(줄)", "참치김밥(줄)", "치즈김밥(줄)",
        "라면(그릇)", "치즈라면(그릇)", "우동(그릇)",
        "떡볶이(접시)", "라볶이(접시)",
        "비빔냉면(그릇)", "물냉면(그릇)",
        "돈가스(접시)", "제육덮밥(그릇)", "오므라이스(그릇)",
        "만두(접시)", "어묵탕(그릇)"
    ]
    return jsonify({"menus": menus})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True, use_reloader=False)
