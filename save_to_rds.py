# save_to_rds.py
import pymysql
import csv

DB_CONFIG = {
    'host': 'database-1.cj24wem202yj.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'tripleS1234!',
    'database': 'fooddb',
    'charset': 'utf8mb4'
}

def create_table():
    conn = pymysql.connect(**DB_CONFIG)
    with conn.cursor() as cur:
        # 테이블 생성
        cur.execute("""
            CREATE TABLE IF NOT EXISTS sales_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sale_date DATE NOT NULL,
                weekday VARCHAR(10),
                menu_name VARCHAR(50) NOT NULL,
                quantity INT NOT NULL,
                temperature DECIMAL(4,1),
                is_event TINYINT DEFAULT 0,
                INDEX idx_date (sale_date),
                INDEX idx_menu (menu_name),
                INDEX idx_date_menu (sale_date, menu_name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)
    conn.commit()
    conn.close()
    print("✅ 테이블 생성 완료")

def insert_from_csv(csv_file="sales_daily_2024.csv"):
    conn = pymysql.connect(**DB_CONFIG)
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    # 배치 인서트 (1000개씩)
    batch_size = 1000
    with conn.cursor() as cur:
        for i in range(0, len(rows), batch_size):
            batch = rows[i:i+batch_size]
            values = []
            for row in batch:
                values.append((
                    row['date'],
                    row['weekday'],
                    row['menu'],
                    int(row['sales']),
                    float(row['temp']),
                    int(row['event'])
                ))
            
            cur.executemany("""
                INSERT INTO sales_history 
                (sale_date, weekday, menu_name, quantity, temperature, is_event)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, values)
            
            print(f"✅ {i + len(batch)}/{len(rows)} 저장 완료")
    
    conn.commit()
    conn.close()
    print(f"✅ 전체 {len(rows)}개 레코드 저장 완료")

if __name__ == "__main__":
    create_table()
    insert_from_csv()