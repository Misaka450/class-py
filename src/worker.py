import json
import hashlib
import jwt
import time
import os
import uuid
from urllib.parse import parse_qs
import statistics

# JWT密钥配置
JWT_SECRET = os.environ.get('JWT_SECRET', 'YOUR_HIGHLY_SECRET_KEY')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRES_IN = 3600  # 1小时

# 模拟用户数据库（实际应用中应使用D1数据库）
users_db = {
    "teacher": {
        "password_hash": hashlib.sha256("teacher123".encode()).hexdigest(),
        "role": "teacher",
        "class_id": "class_1"
    },
    "admin": {
        "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
        "role": "admin",
        "class_id": None
    }
}

# 模拟数据库表结构
classes_db = {}
students_db = {}
grades_db = {}

def hash_password(password):
    """对密码进行哈希处理"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token(user_id, role, class_id=None):
    """生成JWT token"""
    payload = {
        'user_id': user_id,
        'role': role,
        'class_id': class_id,
        'exp': int(time.time()) + JWT_EXPIRES_IN
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token):
    """验证JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token已过期
    except jwt.InvalidTokenError:
        return None  # 无效token

def authenticate_user(username, password):
    """验证用户身份"""
    if username in users_db:
        user = users_db[username]
        if user['password_hash'] == hash_password(password):
            return {
                'user_id': username,
                'role': user['role'],
                'class_id': user['class_id']
            }
    return None

def on_request_login(env, request):
    """处理登录请求"""
    # 解析请求体
    body = request.body.read().decode('utf-8')
    data = json.loads(body) if body else {}
    username = data.get('username', '')
    password = data.get('password', '')

    user = authenticate_user(username, password)
    if user:
        token = generate_token(user['user_id'], user['role'], user['class_id'])
        return {
            'status': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'token': token})
        }
    else:
        return {
            'status': 401,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid username or password'})
        }

def on_request_logout(env, request):
    """处理登出请求"""
    return {
        'status': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'message': 'Logged out successfully'})
    }

def require_auth(handler):
    """装饰器：验证用户身份"""
    def wrapper(env, request):
        # 获取Authorization头
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return {
                'status': 401,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing or invalid authorization header'})
            }
        
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        if not payload:
            return {
                'status': 401,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid or expired token'})
            }
        
        # 将用户信息添加到环境变量中
        env['user'] = payload
        return handler(env, request)
    
    return wrapper

# 数据库操作函数
def create_class(class_id, grade_level, class_name):
    """创建班级"""
    classes_db[class_id] = {
        'id': class_id,
        'grade_level': grade_level,
        'class_name': class_name
    }
    return classes_db[class_id]

def get_class(class_id):
    """获取班级信息"""
    return classes_db.get(class_id)

def create_student(student_id, name, student_number, class_id):
    """创建学生"""
    students_db[student_id] = {
        'id': student_id,
        'name': name,
        'student_id': student_number,
        'class_id': class_id
    }
    return students_db[student_id]

def get_student(student_id):
    """获取学生信息"""
    return students_db.get(student_id)

def get_students_by_class(class_id):
    """根据班级ID获取学生列表"""
    return [student for student in students_db.values() if student['class_id'] == class_id]

def create_grade(grade_id, student_id, subject, score, exam_date, exam_name, teacher_id):
    """创建成绩记录"""
    grades_db[grade_id] = {
        'id': grade_id,
        'student_id': student_id,
        'subject': subject,
        'score': score,
        'exam_date': exam_date,
        'exam_name': exam_name,
        'teacher_id': teacher_id
    }
    return grades_db[grade_id]

def get_grade(grade_id):
    """获取成绩记录"""
    return grades_db.get(grade_id)

def get_grades_by_student(student_id):
    """根据学生ID获取成绩列表"""
    return [grade for grade in grades_db.values() if grade['student_id'] == student_id]

def get_grades_by_class_and_exam(class_id, exam_name):
    """根据班级ID和考试名称获取成绩列表"""
    # 先获取班级中的所有学生
    students = get_students_by_class(class_id)
    student_ids = [student['id'] for student in students]
    
    # 返回这些学生的指定考试成绩
    return [grade for grade in grades_db.values() 
            if grade['student_id'] in student_ids and grade['exam_name'] == exam_name]

def update_grade(grade_id, subject=None, score=None, exam_date=None, exam_name=None):
    """更新成绩记录"""
    if grade_id in grades_db:
        grade = grades_db[grade_id]
        if subject is not None:
            grade['subject'] = subject
        if score is not None:
            grade['score'] = score
        if exam_date is not None:
            grade['exam_date'] = exam_date
        if exam_name is not None:
            grade['exam_name'] = exam_name
        return grade
    return None

def delete_grade(grade_id):
    """删除成绩记录"""
    if grade_id in grades_db:
        return grades_db.pop(grade_id)
    return None

# API处理函数
@require_auth
def on_request_grades(env, request):
    """处理成绩相关请求"""
    user = env['user']
    role = user['role']
    class_id = user['class_id']
    
    if request.method == 'POST':
        # 录入成绩
        return on_post_grade(env, request, user)
    elif request.method == 'GET':
        # 查询班级成绩
        return on_get_class_grades(env, request, user)
    else:
        return {
            'status': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

def on_post_grade(env, request, user):
    """处理录入成绩请求"""
    role = user['role']
    if role not in ['teacher', 'admin']:
        return {
            'status': 403,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Permission denied'})
        }
    
    # 解析请求体
    body = request.body.read().decode('utf-8')
    data = json.loads(body) if body else {}
    
    # 验证必要字段
    required_fields = ['student_name', 'student_id', 'subject', 'score', 'exam_date', 'exam_name']
    for field in required_fields:
        if field not in data:
            return {
                'status': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': f'Missing required field: {field}'})
            }
    
    # 创建学生（如果不存在）
    student = get_student(data['student_id'])
    if not student:
        student = create_student(
            data['student_id'],
            data['student_name'],
            data['student_id'],
            user.get('class_id', 'class_1')  # 默认班级
        )
    
    # 创建成绩记录
    grade_id = str(uuid.uuid4())
    grade = create_grade(
        grade_id,
        data['student_id'],
        data['subject'],
        float(data['score']),
        data['exam_date'],
        data['exam_name'],
        user['user_id']
    )
    
    return {
        'status': 201,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'grade': grade})
    }

def on_get_class_grades(env, request, user):
    """处理查询班级成绩请求"""
    role = user['role']
    if role not in ['teacher', 'admin']:
        return {
            'status': 403,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Permission denied'})
        }
    
    # 解析查询参数
    url = request.url
    query_params = {}
    if '?' in url:
        query_string = url.split('?', 1)[1]
        query_params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
    
    class_id = query_params.get('class_id', user.get('class_id'))
    exam_name = query_params.get('exam_name')
    
    if not class_id or not exam_name:
        return {
            'status': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing required query parameters: class_id and exam_name'})
        }
    
    # 获取成绩数据
    grades = get_grades_by_class_and_exam(class_id, exam_name)
    
    # 补充学生信息
    result_grades = []
    for grade in grades:
        student = get_student(grade['student_id'])
        if student:
            result_grade = grade.copy()
            result_grade['student_name'] = student['name']
            result_grade['student_number'] = student['student_id']
            result_grades.append(result_grade)
    
    return {
        'status': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'grades': result_grades})
    }

# Excel模板生成和导入功能
@require_auth
def on_request_template(env, request):
    """处理下载成绩导入模板请求"""
    user = env['user']
    role = user['role']
    
    if role not in ['teacher', 'admin']:
        return {
            'status': 403,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Permission denied'})
        }
    
    # 生成Excel模板内容（简化版本，实际应用中应生成真实的Excel文件）
    template_content = """学生姓名,学号,科目,分数,考试日期,考试名称
张三,2023001,数学,95.5,2023-10-15,期中考试
李四,2023002,数学,87.0,2023-10-15,期中考试
王五,2023003,数学,92.5,2023-10-15,期中考试
"""
    
    return {
        'status': 200,
        'headers': {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="grades_template.xlsx"'
        },
        'body': template_content
    }

@require_auth
def on_request_import_grades(env, request):
    """处理批量导入成绩请求"""
    user = env['user']
    role = user['role']
    
    if role not in ['teacher', 'admin']:
        return {
            'status': 403,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Permission denied'})
        }
    
    # 检查是否有文件上传
    content_type = request.headers.get('Content-Type', '')
    if 'multipart/form-data' not in content_type:
        return {
            'status': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing file upload'})
        }
    
    # 解析上传的文件（简化版本，实际应用中需要解析真实的Excel文件）
    # 这里我们假设文件内容已经被解析并作为文本传递
    body = request.body.read().decode('utf-8')
    
    # 简化的CSV解析（实际应用中应使用专门的Excel解析库）
    lines = body.strip().split('\n')
    if len(lines) < 2:
        return {
            'status': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid file format'})
        }
    
    # 解析标题行
    headers = lines[0].split(',')
    required_headers = ['学生姓名', '学号', '科目', '分数', '考试日期', '考试名称']
    for header in required_headers:
        if header not in headers:
            return {
                'status': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': f'Missing required column: {header}'})
            }
    
    # 解析数据行
    imported_count = 0
    errors = []
    
    for i, line in enumerate(lines[1:], 1):
        try:
            values = line.split(',')
            if len(values) != len(headers):
                errors.append(f"Line {i+1}: Column count mismatch")
                continue
            
            # 创建数据字典
            data = dict(zip(headers, values))
            
            # 创建学生（如果不存在）
            student = get_student(data['学号'])
            if not student:
                student = create_student(
                    data['学号'],
                    data['学生姓名'],
                    data['学号'],
                    user.get('class_id', 'class_1')  # 默认班级
                )
            
            # 创建成绩记录
            grade_id = str(uuid.uuid4())
            grade = create_grade(
                grade_id,
                data['学号'],
                data['科目'],
                float(data['分数']),
                data['考试日期'],
                data['考试名称'],
                user['user_id']
            )
            
            imported_count += 1
        except Exception as e:
            errors.append(f"Line {i+1}: {str(e)}")
    
    # 返回结果
    result = {
        'success': True,
        'imported_count': imported_count
    }
    
    if errors:
        result['errors'] = errors
    
    return {
        'status': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(result)
    }

# 数据分析功能
@require_auth
def on_request_analysis_class(env, request):
    """处理班级总体分析请求"""
    user = env['user']
    role = user['role']
    
    if role not in ['teacher', 'admin']:
        return {
            'status': 403,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Permission denied'})
        }
    
    # 解析URL参数获取班级ID
    url = request.url
    path_parts = url.split('/')
    if len(path_parts) < 8:
        return {
            'status': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing class ID in URL'})
        }
    
    class_id = path_parts[7]  # /api/analysis/class/<CLASS_ID>
    
    # 获取班级信息
    class_info = get_class(class_id)
    if not class_info:
        return {
            'status': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Class not found'})
        }
    
    # 获取班级中的所有学生
    students = get_students_by_class(class_id)
    if not students:
        return {
            'status': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'No students found in class'})
        }
    
    # 获取所有学生的最新成绩（按科目分组）
    subject_scores = {}
    for student in students:
        student_grades = get_grades_by_student(student['id'])
        # 按科目分组，保留最新成绩
        latest_grades = {}
        for grade in student_grades:
            subject = grade['subject']
            exam_date = grade['exam_date']
            if subject not in latest_grades or exam_date > latest_grades[subject]['exam_date']:
                latest_grades[subject] = grade
        
        # 将最新成绩按科目分组
        for subject, grade in latest_grades.items():
            if subject not in subject_scores:
                subject_scores[subject] = []
            subject_scores[subject].append(grade['score'])
    
    # 计算各科目的统计指标
    analysis_result = {
        'class_info': class_info,
        'student_count': len(students),
        'subject_analysis': {}
    }
    
    for subject, scores in subject_scores.items():
        if scores:
            analysis_result['subject_analysis'][subject] = {
                'average': round(sum(scores) / len(scores), 2),
                'median': statistics.median(scores),
                'min': min(scores),
                'max': max(scores),
                'count': len(scores)
            }
    
    return {
        'status': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(analysis_result)
    }

@require_auth
def on_request_analysis_student_longitudinal(env, request):
    """处理学生纵向趋势分析请求"""
    user = env['user']
    role = user['role']
    
    # 解析URL参数获取学生ID
    url = request.url
    path_parts = url.split('/')
    if len(path_parts) < 9:
        return {
            'status': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing student ID in URL'})
        }
    
    student_id = path_parts[8]  # /api/analysis/student/longitudinal/<STUDENT_ID>
    
    # 检查权限：学生只能查看自己的数据，教师和管理员可以查看所有数据
    if role == 'student' and user['user_id'] != student_id:
        return {
            'status': 403,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Permission denied'})
        }
    
    # 获取学生信息
    student = get_student(student_id)
    if not student:
        return {
            'status': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Student not found'})
        }
    
    # 获取学生的所有成绩记录
    grades = get_grades_by_student(student_id)
    if not grades:
        return {
            'status': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'No grades found for student'})
        }
    
    # 按科目分组成绩
    subject_grades = {}
    for grade in grades:
        subject = grade['subject']
        if subject not in subject_grades:
            subject_grades[subject] = []
        subject_grades[subject].append(grade)
    
    # 按考试日期排序每个科目的成绩
    for subject in subject_grades:
        subject_grades[subject].sort(key=lambda x: x['exam_date'])
    
    # 计算进步趋势
    trend_analysis = {
        'student_info': student,
        'subject_trends': {}
    }
    
    for subject, grades_list in subject_grades.items():
        if len(grades_list) >= 2:
            # 计算进步速度（最后一次成绩 - 第一次成绩）/ 考试次数
            first_score = grades_list[0]['score']
            last_score = grades_list[-1]['score']
            improvement = last_score - first_score
            speed = improvement / len(grades_list)
            
            trend_analysis['subject_trends'][subject] = {
                'grades': grades_list,
                'improvement': round(improvement, 2),
                'speed': round(speed, 2),
                'first_score': first_score,
                'last_score': last_score
            }
    
    return {
        'status': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(trend_analysis)
    }

@require_auth
def on_request_analysis_comparison(env, request):
    """处理横向对比分析请求"""
    user = env['user']
    role = user['role']
    
    if role not in ['teacher', 'admin']:
        return {
            'status': 403,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Permission denied'})
        }
    
    # 解析URL参数获取班级ID和考试名称
    url = request.url
    path_parts = url.split('/')
    if len(path_parts) < 8:
        return {
            'status': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing class ID in URL'})
        }
    
    class_id = path_parts[7]  # /api/analysis/comparison/<CLASS_ID>
    
    # 解析查询参数
    query_params = {}
    if '?' in url:
        query_string = url.split('?', 1)[1]
        query_params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
    
    exam_name = query_params.get('exam')
    if not exam_name:
        return {
            'status': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing exam name in query parameters'})
        }
    
    # 获取班级信息
    class_info = get_class(class_id)
    if not class_info:
        return {
            'status': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Class not found'})
        }
    
    # 获取班级成绩
    class_grades = get_grades_by_class_and_exam(class_id, exam_name)
    if not class_grades:
        return {
            'status': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'No grades found for class and exam'})
        }
    
    # 计算班级平均分
    class_scores = [grade['score'] for grade in class_grades]
    class_average = sum(class_scores) / len(class_scores) if class_scores else 0
    
    # 简化处理：假设年级只有一个班级，实际应用中需要查询所有班级
    grade_level_average = class_average  # 在实际应用中，这应该是年级所有班级的平均分
    
    # 按学生分组成绩
    student_scores = {}
    for grade in class_grades:
        student_id = grade['student_id']
        if student_id not in student_scores:
            student_scores[student_id] = []
        student_scores[student_id].append(grade['score'])
    
    # 计算每个学生的平均分
    student_averages = {}
    for student_id, scores in student_scores.items():
        student_averages[student_id] = sum(scores) / len(scores) if scores else 0
    
    # 找出高于和低于平均分的学生
    above_average = [sid for sid, avg in student_averages.items() if avg > class_average]
    below_average = [sid for sid, avg in student_averages.items() if avg < class_average]
    
    comparison_result = {
        'class_info': class_info,
        'exam_name': exam_name,
        'class_average': round(class_average, 2),
        'grade_level_average': round(grade_level_average, 2),
        'student_count': len(student_scores),
        'above_average_count': len(above_average),
        'below_average_count': len(below_average),
        'student_details': []
    }
    
    # 添加学生详细信息
    for student_id, average in student_averages.items():
        student = get_student(student_id)
        if student:
            comparison_result['student_details'].append({
                'student_id': student_id,
                'student_name': student['name'],
                'average_score': round(average, 2),
                'difference_from_class': round(average - class_average, 2),
                'difference_from_grade': round(average - grade_level_average, 2)
            })
    
    return {
        'status': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(comparison_result)
    }

@require_auth
def on_request_analysis_correlation(env, request):
    """处理学科关联分析请求"""
    user = env['user']
    role = user['role']
    
    if role not in ['teacher', 'admin']:
        return {
            'status': 403,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Permission denied'})
        }
    
    # 解析URL参数获取班级ID
    url = request.url
    path_parts = url.split('/')
    if len(path_parts) < 8:
        return {
            'status': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing class ID in URL'})
        }
    
    class_id = path_parts[7]  # /api/analysis/correlation/<CLASS_ID>
    
    # 解析查询参数
    query_params = {}
    if '?' in url:
        query_string = url.split('?', 1)[1]
        query_params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
    
    subject1 = query_params.get('subject1')
    subject2 = query_params.get('subject2')
    
    if not subject1 or not subject2:
        return {
            'status': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing subject1 or subject2 in query parameters'})
        }
    
    # 获取班级信息
    class_info = get_class(class_id)
    if not class_info:
        return {
            'status': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Class not found'})
        }
    
    # 获取班级中的所有学生
    students = get_students_by_class(class_id)
    if not students:
        return {
            'status': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'No students found in class'})
        }
    
    # 获取每个学生在两个科目上的成绩
    student_scores = {}
    for student in students:
        student_id = student['id']
        grades = get_grades_by_student(student_id)
        
        # 找到指定科目的成绩
        subject1_score = None
        subject2_score = None
        
        for grade in grades:
            if grade['subject'] == subject1:
                subject1_score = grade['score']
            elif grade['subject'] == subject2:
                subject2_score = grade['score']
        
        # 只有当两个科目都有成绩时才记录
        if subject1_score is not None and subject2_score is not None:
            student_scores[student_id] = {
                'student_info': student,
                'subject1_score': subject1_score,
                'subject2_score': subject2_score
            }
    
    if not student_scores:
        return {
            'status': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'No students found with both subjects'})
        }
    
    # 计算相关系数
    scores1 = [data['subject1_score'] for data in student_scores.values()]
    scores2 = [data['subject2_score'] for data in student_scores.values()]
    
    # 计算皮尔逊相关系数
    correlation = calculate_correlation(scores1, scores2)
    
    correlation_result = {
        'class_info': class_info,
        'subject1': subject1,
        'subject2': subject2,
        'correlation': round(correlation, 4),
        'student_count': len(student_scores),
        'interpretation': interpret_correlation(correlation)
    }
    
    return {
        'status': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(correlation_result)
    }

def calculate_correlation(x, y):
    """计算皮尔逊相关系数"""
    if len(x) != len(y) or len(x) < 2:
        return 0
    
    n = len(x)
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(xi * yi for xi, yi in zip(x, y))
    sum_x2 = sum(xi ** 2 for xi in x)
    sum_y2 = sum(yi ** 2 for yi in y)
    
    numerator = n * sum_xy - sum_x * sum_y
    denominator = ((n * sum_x2 - sum_x ** 2) * (n * sum_y2 - sum_y ** 2)) ** 0.5
    
    if denominator == 0:
        return 0
    
    return numerator / denominator

def interpret_correlation(correlation):
    """解释相关系数"""
    abs_corr = abs(correlation)
    
    if abs_corr >= 0.9:
        strength = "非常强"
    elif abs_corr >= 0.7:
        strength = "强"
    elif abs_corr >= 0.5:
        strength = "中等"
    elif abs_corr >= 0.3:
        strength = "弱"
    else:
        strength = "非常弱"
    
    if correlation > 0:
        direction = "正相关"
    elif correlation < 0:
        direction = "负相关"
    else:
        direction = "无相关性"
    
    return f"{strength}{direction}"

# AI智能分析功能
@require_auth
def on_request_analysis_class_summary(env, request):
    """处理班级AI总结报告请求"""
    user = env['user']
    role = user['role']
    
    if role not in ['teacher', 'admin']:
        return {
            'status': 403,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Permission denied'})
        }
    
    # 解析URL参数获取班级ID
    url = request.url
    path_parts = url.split('/')
    if len(path_parts) < 9:
        return {
            'status': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing class ID in URL'})
        }
    
    class_id = path_parts[8]  # /api/analysis/class/summary/<CLASS_ID>
    
    # 获取班级总体分析数据
    analysis_response = on_request_analysis_class(env, request)
    
    # 如果分析失败，直接返回错误
    if analysis_response['status'] != 200:
        return analysis_response
    
    # 解析分析结果
    analysis_data = json.loads(analysis_response['body'])
    
    # 构造AI提示词
    prompt = construct_class_summary_prompt(analysis_data)
    
    # 调用AI服务生成总结报告
    ai_summary = generate_ai_summary(env, prompt)
    
    return {
        'status': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'class_analysis': analysis_data,
            'ai_summary': ai_summary
        })
    }

def construct_class_summary_prompt(analysis_data):
    """构造班级总结的AI提示词"""
    class_info = analysis_data['class_info']
    student_count = analysis_data['student_count']
    subject_analysis = analysis_data['subject_analysis']
    
    prompt = f"请根据以下小学{class_info['grade_level']}年级{class_info['class_name']}班的成绩数据分析，生成一份教学总结报告：\n\n"
    prompt += f"班级基本信息：\n"
    prompt += f"- 班级：{class_info['grade_level']}年级{class_info['class_name']}班\n"
    prompt += f"- 学生人数：{student_count}人\n\n"
    
    prompt += f"各科目成绩分析：\n"
    for subject, stats in subject_analysis.items():
        prompt += f"- {subject}：平均分{stats['average']}分，中位数{stats['median']}分，最高分{stats['max']}分，最低分{stats['min']}分\n"
    
    prompt += "\n请从以下几个方面进行分析和建议：\n"
    prompt += "1. 班级整体学习情况概述\n"
    prompt += "2. 各科目的表现特点和问题\n"
    prompt += "3. 需要重点关注的薄弱环节\n"
    prompt += "4. 针对性的教学改进建议\n"
    prompt += "5. 对不同层次学生的指导建议\n\n"
    prompt += "请用中文输出，语言简洁明了，具有教育专业性。"
    
    return prompt

@require_auth
def on_request_analysis_student_advice(env, request):
    """处理学生个性化建议请求"""
    user = env['user']
    role = user['role']
    
    # 解析URL参数获取学生ID
    url = request.url
    path_parts = url.split('/')
    if len(path_parts) < 9:
        return {
            'status': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing student ID in URL'})
        }
    
    student_id = path_parts[8]  # /api/analysis/student/advice/<STUDENT_ID>
    
    # 检查权限：学生只能查看自己的数据，教师和管理员可以查看所有数据
    if role == 'student' and user['user_id'] != student_id:
        return {
            'status': 403,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Permission denied'})
        }
    
    # 获取学生纵向趋势分析数据
    trend_response = on_request_analysis_student_longitudinal(env, request)
    
    # 如果分析失败，直接返回错误
    if trend_response['status'] != 200:
        return trend_response
    
    # 解析分析结果
    trend_data = json.loads(trend_response['body'])
    
    # 构造AI提示词
    prompt = construct_student_advice_prompt(trend_data)
    
    # 调用AI服务生成个性化建议
    ai_advice = generate_ai_summary(env, prompt)
    
    return {
        'status': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'student_analysis': trend_data,
            'ai_advice': ai_advice
        })
    }

def construct_student_advice_prompt(trend_data):
    """构造学生个性化建议的AI提示词"""
    student_info = trend_data['student_info']
    subject_trends = trend_data['subject_trends']
    
    prompt = f"请根据以下小学{student_info['name']}同学的成绩趋势分析，生成一份个性化的学习建议：\n\n"
    prompt += f"学生基本信息：\n"
    prompt += f"- 姓名：{student_info['name']}\n"
    prompt += f"- 学号：{student_info['student_id']}\n\n"
    
    prompt += f"各科目成绩趋势：\n"
    for subject, trend in subject_trends.items():
        prompt += f"- {subject}：首次成绩{trend['first_score']}分，最新成绩{trend['last_score']}分，总进步{trend['improvement']}分，平均进步速度{trend['speed']}分/次\n"
    
    prompt += "\n请从以下几个方面给出建议：\n"
    prompt += "1. 学习情况总体评价\n"
    prompt += "2. 各科目的学习优势和不足\n"
    prompt += "3. 学习方法和习惯方面的改进建议\n"
    prompt += "4. 针对薄弱科目的具体提升策略\n"
    prompt += "5. 未来学习目标和规划建议\n\n"
    prompt += "请用中文输出，语言亲切，具有教育专业性，适合与学生或家长沟通。"
    
    return prompt

def generate_ai_summary(env, prompt):
    """调用AI服务生成总结报告"""
    # 检查是否有AI绑定
    if 'AI' not in env:
        return "AI服务未配置，请联系管理员。"
    
    try:
        # 调用AI服务（简化实现，实际应用中需要根据Cloudflare Workers AI的具体API调整）
        ai = env['AI']
        # 这里应该调用AI的聊天完成接口，但为了简化，我们返回模拟的AI响应
        return f"AI分析结果（模拟）：\n\n{prompt[:100]}...\n\n[此处应为AI生成的详细分析报告]"
    except Exception as e:
        return f"AI分析失败：{str(e)}"

# 主处理函数
def handle_request(env, request):
    """主请求处理函数"""
    # 路由处理
    url = request.url
    path = url.split('?', 1)[0]  # 移除查询参数
    
    # API路由
    if path.endswith('/api/login'):
        return on_request_login(env, request)
    elif path.endswith('/api/logout'):
        return on_request_logout(env, request)
    elif path.startswith('/api/grades'):
        return on_request_grades(env, request)
    elif path.startswith('/api/template/grades.xlsx'):
        return on_request_template(env, request)
    elif path.startswith('/api/import/grades'):
        return on_request_import_grades(env, request)
    elif path.startswith('/api/analysis/class/'):
        if 'summary' in path:
            return on_request_analysis_class_summary(env, request)
        else:
            return on_request_analysis_class(env, request)
    elif path.startswith('/api/analysis/student/longitudinal/'):
        return on_request_analysis_student_longitudinal(env, request)
    elif path.startswith('/api/analysis/student/advice/'):
        return on_request_analysis_student_advice(env, request)
    elif path.startswith('/api/analysis/comparison/'):
        return on_request_analysis_comparison(env, request)
    elif path.startswith('/api/analysis/correlation/'):
        return on_request_analysis_correlation(env, request)
    
    # 静态文件路由
    elif path == '/' or path == '/index.html':
        return serve_static_file('dist/index.html', 'text/html')
    elif path == '/styles.css':
        return serve_static_file('dist/styles.css', 'text/css')
    elif path == '/app.js':
        return serve_static_file('dist/app.js', 'application/javascript')
    
    # 404 Not Found
    else:
        return {
            'status': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Not found'})
        }

def serve_static_file(file_path, content_type):
    """提供静态文件服务"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return {
            'status': 200,
            'headers': {'Content-Type': content_type},
            'body': content
        }
    except Exception as e:
        return {
            'status': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Failed to read file: {str(e)}'})
        }

# Python Workers入口点
async def main(request, env):
    """Python Workers入口点"""
    return handle_request(env, request)