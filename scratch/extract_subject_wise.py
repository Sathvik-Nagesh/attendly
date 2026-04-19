import pandas as pd
import re

def clean_name(name):
    if not isinstance(name, str): return name
    return re.sub(r'\s*\([a-zA-Z]\)\s*', '', name).strip()

def extract_subject_data():
    file_path = r'd:\Brandex\Clients Websites\Attendly\attendly\excel\II SEM B.COM C (1).xlsx'
    df = pd.read_excel(file_path, sheet_name='II SEM C', skiprows=4)
    
    # Mapping based on DB codes
    mapping = {
        'BCOMLANG': ('Kannada', 'Unnamed: 4'),
        'BCOMENG': ('English', 'Unnamed: 7'),
        'BCOM1': ('AFA', 'Unnamed: 10'),
        'BCOMBO': ('BO', 'Unnamed: 13'),
        'BCOMHRM': ('HRM', 'Unnamed: 16'),
        'BCOMQTB': ('QTB', 'Unnamed: 19'),
        'BCOMEVS': ('EVS', 'Unnamed: 22')
    }
    
    refined_data = []
    
    for _, row in df.iterrows():
        name = row['Students Name']
        reg = row['Reg Number ']
        
        if pd.isna(name) or str(name).strip() == "" or "Total" in str(name):
            continue
            
        student = {
            'name': clean_name(name),
            'roll': str(reg).strip(),
            'email': f"{str(reg).strip().lower()}@college.edu",
        }
        
        # Add subject-wise columns
        for code, (tc_col, tp_col) in mapping.items():
            tc_val = row[tc_col]
            tp_val = row[tp_col]
            student[f'tc_{code.lower()}'] = int(tc_val) if pd.notna(tc_val) else 0
            student[f'tp_{code.lower()}'] = int(tp_val) if pd.notna(tp_val) else 0
                
        refined_data.append(student)
        
    out_df = pd.DataFrame(refined_data)
    output_path = r'd:\Brandex\Clients Websites\Attendly\attendly\excel\institutional_roster_final.csv'
    out_df.to_csv(output_path, index=False)
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    extract_subject_data()
