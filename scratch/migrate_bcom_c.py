import pandas as pd
import json
import sys

def migrate():
    file_path = 'excel/II SEM B.COM C (1).xlsx'
    
    # 1. Load data
    xl = pd.ExcelFile(file_path)
    df_attendance = xl.parse('II SEM C', header=3)
    df_marks = xl.parse('Internal Marks Final ', header=3)
    
    # 2. Subject Mappings (AFA, KAN, ENG, BO, HRM, QTB, EVA)
    subjects = {
        'KAN': {'code': 'BCOMLANG', 'id': '70318d3f-0114-4286-982c-8fddc6e5614f'},
        'ENG': {'code': 'BCOMENG',  'id': 'd6cffd86-ac8a-4afb-9eb8-6e1dc3a23462'},
        'AFA': {'code': 'BCOM1',    'id': '784bd6b2-d1af-466d-88e8-516e742c3a11'},
        'BO':  {'code': 'BCOMBO',   'id': '2277aa20-d4d0-4052-ac6e-6a53c50f429a'},
        'HRM': {'code': 'BCOMHRM',  'id': 'cd9a773c-79d7-4fe6-9aaf-7651cd0a88a0'},
        'QTB': {'code': 'BCOMQTB',  'id': '7e509138-232d-4c73-a8c4-5030d781eaf1'},
        'EVA': {'code': 'BCOMEVS',  'id': 'cb2f499c-2669-4e5d-b166-af113148411e'}
    }
    
    # Clean column names for Marks
    df_marks.columns = [c.strip() if isinstance(c, str) else c for c in df_marks.columns]
    
    # Get all students from marks sheet
    students = []
    initial_attendance = []
    student_marks = []
    
    # We need student IDs from the database to link them.
    # But we can also use Reg Number as the link in our upsert.
    # However, student_marks and initial_attendance use student_id (UUID).
    # So I first need a map of Reg Number -> Student ID.
    
    # For now, I'll generate the SQL commands or a JSON for the LLM to execute via MCP.
    # Actually, I'll just print a JSON that can be processed.
    
    results = {
        "attendance": [],
        "marks": []
    }
    
    # Mapping for attendance columns (TC, TP)
    att_col_map = {
        'KAN': 3,
        'ENG': 6,
        'AFA': 9,
        'BO': 12,
        'HRM': 15,
        'QTB': 18,
        'EVA': 21
    }
    
    for idx, row in df_attendance.iterrows():
        reg = str(row.iloc[1]).strip()
        if reg == 'nan' or not reg or reg == 'Reg Number': continue
        
        for subj, start_idx in att_col_map.items():
            try:
                tc = row.iloc[start_idx]
                tp = row.iloc[start_idx + 1]
                if pd.isna(tc) or pd.isna(tp): continue
                
                results["attendance"].append({
                    "reg_number": reg,
                    "subject_code": subjects[subj]['code'],
                    "tc": int(tc),
                    "tp": int(tp)
                })
            except:
                continue
            
    # Mapping for marks columns
    marks_col_map = {
        'KAN': 3,
        'ENG': 4,
        'AFA': 5,
        'BO': 6,
        'HRM': 7,
        'QTB': 8,
        'EVA': 9
    }

    for idx, row in df_marks.iterrows():
        reg = str(row.iloc[1]).strip()
        if reg == 'nan' or not reg or reg == 'Reg Number': continue
        
        for subj, col_idx in marks_col_map.items():
            try:
                val = row.iloc[col_idx]
                if pd.isna(val): continue
                
                results["marks"].append({
                    "reg_number": reg,
                    "subject_id": subjects[subj]['id'],
                    "cia1": float(val)
                })
            except:
                continue
            
    print(json.dumps(results))

            
    with open('scratch/migration_data.json', 'w', encoding='utf-8') as f:
        json.dump(results, f)
    print("Migration data written to scratch/migration_data.json")

if __name__ == "__main__":
    migrate()
