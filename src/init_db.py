#!/usr/bin/env python3
"""
数据库初始化脚本
用于创建D1数据库表结构
"""

import sqlite3
import os

# 创建表的SQL语句
CREATE_TABLES_SQL = """
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    class_id TEXT
);

-- 创建班级表
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    grade_level INTEGER NOT NULL,
    class_name TEXT NOT NULL
);

-- 创建学生表
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    student_number TEXT UNIQUE NOT NULL,
    class_id TEXT NOT NULL
);

-- 创建成绩表
CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    score REAL NOT NULL,
    exam_date TEXT NOT NULL,
    exam_name TEXT NOT NULL,
    teacher_id TEXT NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
"""

def init_database():
    """初始化数据库"""
    # 连接到D1数据库（在本地使用SQLite进行测试）
    conn = sqlite3.connect('class_py_test.db')
    cursor = conn.cursor()
    
    # 执行创建表的SQL
    cursor.executescript(CREATE_TABLES_SQL)
    
    # 插入测试数据
    insert_test_data(cursor)
    
    # 提交更改并关闭连接
    conn.commit()
    conn.close()
    
    print("数据库初始化完成！")

def insert_test_data(cursor):
    """插入测试数据"""
    # 插入测试班级
    cursor.execute("""
        INSERT OR IGNORE INTO classes (id, grade_level, class_name) 
        VALUES (?, ?, ?)
    """, ("class_1", 3, "三年级一班"))
    
    cursor.execute("""
        INSERT OR IGNORE INTO classes (id, grade_level, class_name) 
        VALUES (?, ?, ?)
    """, ("class_2", 3, "三年级二班"))
    
    # 插入测试学生
    cursor.execute("""
        INSERT OR IGNORE INTO students (id, name, student_number, class_id) 
        VALUES (?, ?, ?, ?)
    """, ("student_1", "张小明", "2023001", "class_1"))
    
    cursor.execute("""
        INSERT OR IGNORE INTO students (id, name, student_number, class_id) 
        VALUES (?, ?, ?, ?)
    """, ("student_2", "李小红", "2023002", "class_1"))
    
    cursor.execute("""
        INSERT OR IGNORE INTO students (id, name, student_number, class_id) 
        VALUES (?, ?, ?, ?)
    """, ("student_3", "王小刚", "2023003", "class_1"))
    
    # 插入测试成绩
    cursor.execute("""
        INSERT OR IGNORE INTO grades (id, student_id, subject, score, exam_date, exam_name, teacher_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, ("grade_1", "student_1", "数学", 95.0, "2023-06-15", "期中考试", "teacher"))
    
    cursor.execute("""
        INSERT OR IGNORE INTO grades (id, student_id, subject, score, exam_date, exam_name, teacher_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, ("grade_2", "student_1", "语文", 88.0, "2023-06-15", "期中考试", "teacher"))
    
    cursor.execute("""
        INSERT OR IGNORE INTO grades (id, student_id, subject, score, exam_date, exam_name, teacher_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, ("grade_3", "student_1", "英语", 92.0, "2023-06-15", "期中考试", "teacher"))
    
    cursor.execute("""
        INSERT OR IGNORE INTO grades (id, student_id, subject, score, exam_date, exam_name, teacher_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, ("grade_4", "student_2", "数学", 87.0, "2023-06-15", "期中考试", "teacher"))
    
    cursor.execute("""
        INSERT OR IGNORE INTO grades (id, student_id, subject, score, exam_date, exam_name, teacher_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, ("grade_5", "student_2", "语文", 90.0, "2023-06-15", "期中考试", "teacher"))
    
    cursor.execute("""
        INSERT OR IGNORE INTO grades (id, student_id, subject, score, exam_date, exam_name, teacher_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, ("grade_6", "student_2", "英语", 85.0, "2023-06-15", "期中考试", "teacher"))

if __name__ == "__main__":
    init_database()