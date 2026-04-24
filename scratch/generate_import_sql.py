import json

def generate_sql():
    with open('scratch/migration_data.json', 'r') as f:
        data = json.load(f)
    
    # Student map (from the output above)
    student_list = [
        {"id":"0b93f81b-2d84-4433-9a5a-5f407e9af233","roll_number":"U03FS25C0124"},
        {"id":"ec65c92b-4164-4131-a39d-e1b1538ec86c","roll_number":"U03FS25C0125"},
        {"id":"ca30c867-f1ac-422f-b588-12de36eff7ff","roll_number":"U03FS25C0126"},
        {"id":"4d45202e-e4df-4046-9996-77818e64372a","roll_number":"U03FS25C0127"},
        {"id":"e6840cdd-c038-4645-904d-e5e61c34ffbb","roll_number":"U03FS25C0128"},
        {"id":"0673e2bf-1b87-45e2-9578-9094537de6ee","roll_number":"U03FS25C0129"},
        {"id":"0816a967-aa08-41f7-a843-d69be62de9ea","roll_number":"U03FS25C0130"},
        {"id":"5f8f37b7-9063-4a5c-b919-533249005730","roll_number":"U03FS25C0131"},
        {"id":"637bf05e-ad65-473a-bc50-8da7659a0708","roll_number":"U03FS25C0132"},
        {"id":"b5064479-75eb-402f-af15-a9487a4b1176","roll_number":"U03FS25C0133"},
        {"id":"dab623c7-65c9-49e1-affe-e9017a5569a6","roll_number":"U03FS25C0134"},
        {"id":"1e300135-a02e-4896-9b36-466d92b48e5f","roll_number":"U03FS25C0135"},
        {"id":"e8538b25-128c-4b5e-9da2-21eec85e0e67","roll_number":"U03FS25C0136"},
        {"id":"7986171d-27d0-451f-b894-6f3b0e34d1e6","roll_number":"U03FS25C0137"},
        {"id":"2e15ddfa-4783-4933-ac8c-8697550e0e79","roll_number":"U03FS25C0138"},
        {"id":"e9cd2a70-31f5-4acf-8560-8de18cc0fa60","roll_number":"U03FS25C0139"},
        {"id":"b31af6e2-88e8-4935-895a-9e26a4a8360e","roll_number":"U03FS25C0140"},
        {"id":"07962e20-f23e-47b2-9ead-159e238097e2","roll_number":"U03FS25C0141"},
        {"id":"6cadbdbb-3efa-4e43-878e-0b60d9e0189b","roll_number":"U03FS25C0142"},
        {"id":"87aad901-c9dc-4d59-b793-6a3604858b26","roll_number":"U03FS25C0143"},
        {"id":"8fecd690-f84c-4d2a-8f46-6eb6ad913a6e","roll_number":"U03FS25C0144"},
        {"id":"4f86dc5a-b842-4c0d-95b0-61b4a583540d","roll_number":"U03FS25C0145"},
        {"id":"6ed5c746-5f6b-4970-bc11-bd3ca60c19e2","roll_number":"U03FS25C0146"},
        {"id":"f7aea0ae-81d6-4133-9390-ba7fd9bd4088","roll_number":"U03FS25C0147"},
        {"id":"ffb08ee4-2834-475c-b6c4-0ae345feabc1","roll_number":"U03FS25C0148"},
        {"id":"2ce44fe8-db90-45b8-9720-9911bf26b2ec","roll_number":"U03FS25C0149"},
        {"id":"39471ad9-2b4b-4b24-ad43-c5121c12ab78","roll_number":"U03FS25C0150"},
        {"id":"79aeba82-1786-45f4-a1de-5e8025ae6ef4","roll_number":"U03FS25C0151"},
        {"id":"2b396e07-0e7b-4951-af25-faadee507c8c","roll_number":"U03FS25C0152"},
        {"id":"59891d9f-415f-4abf-b57c-08c6b161719f","roll_number":"U03FS25C0153"},
        {"id":"9118ec54-ef5a-40fa-bedc-b407773daacc","roll_number":"U03FS25C0154"},
        {"id":"99734741-0506-4c25-a0f2-55def3d3d9cc","roll_number":"U03FS25C0155"},
        {"id":"6ccdf0ca-247e-42d4-9db6-5125b68ea12c","roll_number":"U03FS25C0156"},
        {"id":"f4c23b48-b092-4003-84fa-98f6c5f10100","roll_number":"U03FS25C0157"},
        {"id":"2cf85cee-e11a-4d28-a4a0-cff35a5a02d6","roll_number":"U03FS25C0158"},
        {"id":"78d27531-c10e-493c-afc4-f84c053da3ae","roll_number":"U03FS25C0159"},
        {"id":"6f086574-bd78-468e-a0aa-d0acfe5aa5ba","roll_number":"U03FS25C0160"},
        {"id":"9068c9e4-e871-4966-9c06-419a84f11238","roll_number":"U03FS25C0161"},
        {"id":"b52eb477-8e79-432c-90b7-bc3905350bfe","roll_number":"U03FS25C0162"},
        {"id":"cbe67291-6f8c-4576-8c35-d023da45cd00","roll_number":"U03FS25C0163"},
        {"id":"ece368b2-173b-4a01-a737-0f1465a475cc","roll_number":"U03FS25C0164"},
        {"id":"96f7eb3c-78b1-4a45-bfea-14d05c6a4511","roll_number":"U03FS25C0165"},
        {"id":"ba784e37-5bb5-40ee-801d-edab4510f97c","roll_number":"U03FS25C0166"},
        {"id":"6c5247a9-9b21-451d-bec3-099bdc17f864","roll_number":"U03FS25C0167"},
        {"id":"1b1aacaf-6d04-4ac0-93e1-5c4eaf2d279d","roll_number":"U03FS25C0168"},
        {"id":"e46bdfb7-08d3-4668-991d-623d3ba381e0","roll_number":"U03FS25C0169"},
        {"id":"6ca327ae-30fb-4b57-b7dd-b5b6089b356c","roll_number":"U03FS25C0170"},
        {"id":"32ff334a-b76e-471e-83a4-53424a9e5b82","roll_number":"U03FS25C0171"},
        {"id":"3f8a01a8-e399-4b51-82e2-21280b799571","roll_number":"U03FS25C0172"},
        {"id":"f2290112-e8dc-4cd6-9525-3028b6f15ef5","roll_number":"U03FS25C0173"}
    ]
    student_map = {s['roll_number']: s['id'] for s in student_list}
    
    sql_statements = []
    
    # 1. Attendance
    for att in data['attendance']:
        sid = student_map.get(att['reg_number'])
        if not sid: continue
        
        sql_statements.append(
            f"INSERT INTO student_initial_attendance (student_id, subject_code, tc, tp) "
            f"VALUES ('{sid}', '{att['subject_code']}', {att['tc']}, {att['tp']}) "
            f"ON CONFLICT (student_id, subject_code) DO UPDATE SET tc = EXCLUDED.tc, tp = EXCLUDED.tp;"
        )
        
    # 2. Marks
    for mark in data['marks']:
        sid = student_map.get(mark['reg_number'])
        if not sid: continue
        
        sql_statements.append(
            f"INSERT INTO student_marks (student_id, subject_id, cia1, updated_at) "
            f"VALUES ('{sid}', '{mark['subject_id']}', {mark['cia1']}, NOW()) "
            f"ON CONFLICT (student_id, subject_id) DO UPDATE SET cia1 = EXCLUDED.cia1, updated_at = NOW();"
        )
        
    with open('scratch/import_data.sql', 'w') as f:
        f.write("\n".join(sql_statements))

if __name__ == "__main__":
    generate_sql()
