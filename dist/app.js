// 全局变量
let currentPage = 1;
const itemsPerPage = 10;
let gradesData = [
    { id: 1, name: '张小明', studentId: '2023001', class: '三年级一班', subject: '数学', score: 95, examDate: '2023-06-15' },
    { id: 2, name: '李小红', studentId: '2023002', class: '三年级一班', subject: '语文', score: 88, examDate: '2023-06-15' },
    { id: 3, name: '王小刚', studentId: '2023003', class: '三年级一班', subject: '英语', score: 92, examDate: '2023-06-15' },
    { id: 4, name: '赵小丽', studentId: '2023004', class: '三年级一班', subject: '数学', score: 87, examDate: '2023-06-15' },
    { id: 5, name: '刘小强', studentId: '2023005', class: '三年级一班', subject: '语文', score: 90, examDate: '2023-06-15' },
    { id: 6, name: '陈小美', studentId: '2023006', class: '三年级一班', subject: '英语', score: 85, examDate: '2023-06-15' },
    { id: 7, name: '杨小军', studentId: '2023007', class: '三年级一班', subject: '数学', score: 93, examDate: '2023-06-15' },
    { id: 8, name: '黄小芳', studentId: '2023008', class: '三年级一班', subject: '语文', score: 89, examDate: '2023-06-15' },
    { id: 9, name: '周小华', studentId: '2023009', class: '三年级一班', subject: '英语', score: 88, examDate: '2023-06-15' },
    { id: 10, name: '吴小明', studentId: '2023010', class: '三年级一班', subject: '数学', score: 91, examDate: '2023-06-15' },
    { id: 11, name: '郑小红', studentId: '2023011', class: '三年级一班', subject: '语文', score: 86, examDate: '2023-06-15' },
    { id: 12, name: '孙小刚', studentId: '2023012', class: '三年级一班', subject: '英语', score: 90, examDate: '2023-06-15' }
];

// 用户认证和页面导航
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已登录
    const token = localStorage.getItem('authToken');
    if (token) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('current-user').textContent = '教师用户';
        loadGradesPage();
    }

    // 登录表单提交处理
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // 简单的认证检查（实际项目中应该发送到服务器验证）
        if ((username === 'teacher' && password === 'teacher123') || 
            (username === 'admin' && password === 'admin123')) {
            // 保存认证令牌
            localStorage.setItem('authToken', 'authenticated');
            // 显示主内容区域
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            document.getElementById('user-info').style.display = 'flex';
            document.getElementById('current-user').textContent = username === 'admin' ? '管理员' : '教师用户';
            // 加载默认页面
            loadGradesPage();
        } else {
            alert('用户名或密码错误！');
        }
    });

    // 退出登录
    document.getElementById('logout-link').addEventListener('click', function() {
        localStorage.removeItem('authToken');
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
        // 重置表单
        document.getElementById('login-form').reset();
    });

    // 导航链接事件监听
    document.getElementById('grades-link').addEventListener('click', function(e) {
        e.preventDefault();
        setActiveLink('grades-link');
        loadGradesPage();
    });

    document.getElementById('analysis-link').addEventListener('click', function(e) {
        e.preventDefault();
        setActiveLink('analysis-link');
        loadAnalysisPage();
    });

    document.getElementById('reports-link').addEventListener('click', function(e) {
        e.preventDefault();
        setActiveLink('reports-link');
        loadReportsPage();
    });
});

// 设置活动链接
function setActiveLink(activeId) {
    // 移除所有活动类
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    // 添加活动类到当前链接
    document.getElementById(activeId).classList.add('active');
}

// 加载成绩管理页面
function loadGradesPage() {
    document.getElementById('content-area').innerHTML = `
        <div class="page-header">
            <h2><i class="fas fa-book"></i> 成绩管理</h2>
            <div class="actions">
                <button id="add-grade-btn" class="primary"><i class="fas fa-plus"></i> 添加成绩</button>
                <button id="import-grades-btn" class="secondary"><i class="fas fa-file-import"></i> 批量导入</button>
            </div>
        </div>
        
        <div class="filters">
            <div class="custom-select">
                <select id="filter-class">
                    <option value="">所有班级</option>
                    <option value="三年级一班">三年级一班</option>
                    <option value="三年级二班">三年级二班</option>
                    <option value="四年级一班">四年级一班</option>
                </select>
            </div>
            <div class="custom-select">
                <select id="filter-subject">
                    <option value="">所有科目</option>
                    <option value="数学">数学</option>
                    <option value="语文">语文</option>
                    <option value="英语">英语</option>
                </select>
            </div>
            <input type="text" id="search-student" placeholder="搜索学生姓名...">
            <button id="apply-filters" class="primary"><i class="fas fa-filter"></i> 筛选</button>
            <button id="reset-filters" class="secondary"><i class="fas fa-redo"></i> 重置</button>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>学生姓名</th>
                        <th>学号</th>
                        <th>班级</th>
                        <th>科目</th>
                        <th>成绩</th>
                        <th>考试时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="grades-table-body">
                    <!-- 成绩数据将通过JavaScript动态填充 -->
                </tbody>
            </table>
        </div>
        
        <div class="pagination" id="pagination">
            <!-- 分页控件将通过JavaScript动态生成 -->
        </div>
    `;
    
    // 渲染成绩表格和分页控件
    renderGradesTable();
    renderPagination();
    
    // 添加事件监听器
    document.getElementById('add-grade-btn').addEventListener('click', showAddGradeModal);
    document.getElementById('import-grades-btn').addEventListener('click', showImportGradesModal);
    document.getElementById('apply-filters').addEventListener('click', applyGradeFilters);
    document.getElementById('reset-filters').addEventListener('click', resetGradeFilters);
}

// 渲染成绩表格
function renderGradesTable(data = gradesData) {
    const tableBody = document.getElementById('grades-table-body');
    tableBody.innerHTML = '';
    
    // 获取当前页的数据
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = data.slice(startIndex, endIndex);
    
    // 填充表格数据
    pageData.forEach(grade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${grade.name}</td>
            <td>${grade.studentId}</td>
            <td>${grade.class}</td>
            <td>${grade.subject}</td>
            <td>${grade.score}</td>
            <td>${grade.examDate}</td>
            <td>
                <button class="edit-btn" data-id="${grade.id}"><i class="fas fa-edit"></i> 编辑</button>
                <button class="delete-btn" data-id="${grade.id}"><i class="fas fa-trash"></i> 删除</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // 添加编辑和删除按钮事件监听器
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editGrade(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteGrade(id);
        });
    });
}

// 渲染分页控件
function renderPagination(data = gradesData) {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    let paginationHTML = '';
    
    // 上一页按钮
    if (currentPage > 1) {
        paginationHTML += `<button class="secondary" onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i> 上一页</button>`;
    } else {
        paginationHTML += `<button class="secondary" disabled><i class="fas fa-chevron-left"></i> 上一页</button>`;
    }
    
    // 页码信息
    paginationHTML += `<span>第 ${currentPage} 页，共 ${totalPages} 页</span>`;
    
    // 下一页按钮
    if (currentPage < totalPages) {
        paginationHTML += `<button class="secondary" onclick="changePage(${currentPage + 1})">下一页 <i class="fas fa-chevron-right"></i></button>`;
    } else {
        paginationHTML += `<button class="secondary" disabled>下一页 <i class="fas fa-chevron-right"></i></button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

// 切换页面
function changePage(page) {
    currentPage = page;
    renderGradesTable();
    renderPagination();
}

// 应用成绩筛选
function applyGradeFilters() {
    const searchTerm = document.getElementById('search-student').value.toLowerCase();
    const subjectFilter = document.getElementById('filter-subject').value;
    const classFilter = document.getElementById('filter-class').value;
    
    // 筛选数据
    let filteredData = gradesData.filter(grade => {
        const matchesSearch = !searchTerm || grade.name.toLowerCase().includes(searchTerm);
        const matchesSubject = !subjectFilter || grade.subject === subjectFilter;
        const matchesClass = !classFilter || grade.class === classFilter;
        return matchesSearch && matchesSubject && matchesClass;
    });
    
    // 重置为第一页
    currentPage = 1;
    
    // 重新渲染表格和分页
    renderGradesTable(filteredData);
    renderPagination(filteredData);
}

// 重置成绩筛选
function resetGradeFilters() {
    document.getElementById('search-student').value = '';
    document.getElementById('filter-subject').value = '';
    document.getElementById('filter-class').value = '';
    
    // 重置为第一页
    currentPage = 1;
    
    // 重新渲染表格和分页
    renderGradesTable();
    renderPagination();
}

// 显示添加成绩模态框
function showAddGradeModal() {
    // 创建模态框HTML
    const modalHTML = `
        <div class="modal" id="add-grade-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-plus"></i> 添加成绩</h3>
                    <span class="close" id="close-add-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="add-grade-form">
                        <div class="form-group">
                            <label for="student-name">学生姓名:</label>
                            <input type="text" id="student-name" required>
                        </div>
                        <div class="form-group">
                            <label for="student-id">学号:</label>
                            <input type="text" id="student-id" required>
                        </div>
                        <div class="form-group">
                            <label for="student-class">班级:</label>
                            <div class="custom-select">
                                <select id="student-class" required>
                                    <option value="三年级一班">三年级一班</option>
                                    <option value="三年级二班">三年级二班</option>
                                    <option value="四年级一班">四年级一班</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="subject">科目:</label>
                            <div class="custom-select">
                                <select id="subject" required>
                                    <option value="数学">数学</option>
                                    <option value="语文">语文</option>
                                    <option value="英语">英语</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="score">成绩:</label>
                            <input type="number" id="score" min="0" max="100" required>
                        </div>
                        <div class="form-group">
                            <label for="exam-date">考试时间:</label>
                            <input type="date" id="exam-date" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="primary">添加</button>
                            <button type="button" class="secondary" id="cancel-add">取消</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // 添加模态框到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 设置默认日期为今天
    document.getElementById('exam-date').valueAsDate = new Date();
    
    // 添加事件监听器
    document.getElementById('close-add-modal').addEventListener('click', closeAddGradeModal);
    document.getElementById('cancel-add').addEventListener('click', closeAddGradeModal);
    document.getElementById('add-grade-form').addEventListener('submit', addGrade);
    
    // 显示模态框
    document.getElementById('add-grade-modal').style.display = 'block';
}

// 关闭添加成绩模态框
function closeAddGradeModal() {
    const modal = document.getElementById('add-grade-modal');
    if (modal) {
        modal.remove();
    }
}

// 添加成绩
function addGrade(e) {
    e.preventDefault();
    
    // 获取表单数据
    const name = document.getElementById('student-name').value;
    const studentId = document.getElementById('student-id').value;
    const className = document.getElementById('student-class').value;
    const subject = document.getElementById('subject').value;
    const score = parseInt(document.getElementById('score').value);
    const examDate = document.getElementById('exam-date').value;
    
    // 创建新成绩记录
    const newGrade = {
        id: gradesData.length + 1,
        name: name,
        studentId: studentId,
        class: className,
        subject: subject,
        score: score,
        examDate: examDate
    };
    
    // 添加到数据数组
    gradesData.push(newGrade);
    
    // 关闭模态框
    closeAddGradeModal();
    
    // 重新渲染表格和分页
    renderGradesTable();
    renderPagination();
    
    alert('成绩添加成功！');
}

// 编辑成绩
function editGrade(id) {
    // 查找要编辑的成绩记录
    const grade = gradesData.find(g => g.id === id);
    if (!grade) return;
    
    // 创建模态框HTML
    const modalHTML = `
        <div class="modal" id="edit-grade-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> 编辑成绩</h3>
                    <span class="close" id="close-edit-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="edit-grade-form">
                        <input type="hidden" id="edit-grade-id" value="${grade.id}">
                        <div class="form-group">
                            <label for="edit-student-name">学生姓名:</label>
                            <input type="text" id="edit-student-name" value="${grade.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-student-id">学号:</label>
                            <input type="text" id="edit-student-id" value="${grade.studentId}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-student-class">班级:</label>
                            <div class="custom-select">
                                <select id="edit-student-class" required>
                                    <option value="三年级一班" ${grade.class === '三年级一班' ? 'selected' : ''}>三年级一班</option>
                                    <option value="三年级二班" ${grade.class === '三年级二班' ? 'selected' : ''}>三年级二班</option>
                                    <option value="四年级一班" ${grade.class === '四年级一班' ? 'selected' : ''}>四年级一班</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="edit-subject">科目:</label>
                            <div class="custom-select">
                                <select id="edit-subject" required>
                                    <option value="数学" ${grade.subject === '数学' ? 'selected' : ''}>数学</option>
                                    <option value="语文" ${grade.subject === '语文' ? 'selected' : ''}>语文</option>
                                    <option value="英语" ${grade.subject === '英语' ? 'selected' : ''}>英语</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="edit-score">成绩:</label>
                            <input type="number" id="edit-score" min="0" max="100" value="${grade.score}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-exam-date">考试时间:</label>
                            <input type="date" id="edit-exam-date" value="${grade.examDate}" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="primary">保存</button>
                            <button type="button" class="secondary" id="cancel-edit">取消</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // 添加模态框到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 添加事件监听器
    document.getElementById('close-edit-modal').addEventListener('click', closeEditGradeModal);
    document.getElementById('cancel-edit').addEventListener('click', closeEditGradeModal);
    document.getElementById('edit-grade-form').addEventListener('submit', saveGrade);
    
    // 显示模态框
    document.getElementById('edit-grade-modal').style.display = 'block';
}

// 关闭编辑成绩模态框
function closeEditGradeModal() {
    const modal = document.getElementById('edit-grade-modal');
    if (modal) {
        modal.remove();
    }
}

// 保存成绩修改
function saveGrade(e) {
    e.preventDefault();
    
    // 获取表单数据
    const id = parseInt(document.getElementById('edit-grade-id').value);
    const name = document.getElementById('edit-student-name').value;
    const studentId = document.getElementById('edit-student-id').value;
    const className = document.getElementById('edit-student-class').value;
    const subject = document.getElementById('edit-subject').value;
    const score = parseInt(document.getElementById('edit-score').value);
    const examDate = document.getElementById('edit-exam-date').value;
    
    // 查找并更新成绩记录
    const index = gradesData.findIndex(g => g.id === id);
    if (index !== -1) {
        gradesData[index] = {
            id: id,
            name: name,
            studentId: studentId,
            class: className,
            subject: subject,
            score: score,
            examDate: examDate
        };
    }
    
    // 关闭模态框
    closeEditGradeModal();
    
    // 重新渲染表格和分页
    renderGradesTable();
    renderPagination();
    
    alert('成绩更新成功！');
}

// 删除成绩
function deleteGrade(id) {
    if (confirm('确定要删除这条成绩记录吗？')) {
        // 从数据数组中移除记录
        gradesData = gradesData.filter(grade => grade.id !== id);
        
        // 重新渲染表格和分页
        renderGradesTable();
        renderPagination();
        
        alert('成绩记录已删除！');
    }
}

// 显示导入成绩模态框
function showImportGradesModal() {
    // 创建模态框HTML
    const modalHTML = `
        <div class="modal" id="import-grades-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-file-import"></i> 批量导入成绩</h3>
                    <span class="close" id="close-import-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="import-instructions">
                        <p>请下载模板文件，按照格式填写成绩数据后上传：</p>
                        <button id="download-template" class="secondary"><i class="fas fa-download"></i> 下载Excel模板</button>
                    </div>
                    <div class="form-group">
                        <label for="excel-file">选择Excel文件:</label>
                        <input type="file" id="excel-file" accept=".xlsx, .xls">
                    </div>
                    <div class="form-actions">
                        <button id="import-btn" class="primary">导入</button>
                        <button type="button" class="secondary" id="cancel-import">取消</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加模态框到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 添加事件监听器
    document.getElementById('close-import-modal').addEventListener('click', closeImportGradesModal);
    document.getElementById('cancel-import').addEventListener('click', closeImportGradesModal);
    document.getElementById('download-template').addEventListener('click', downloadTemplate);
    document.getElementById('import-btn').addEventListener('click', importGrades);
    
    // 显示模态框
    document.getElementById('import-grades-modal').style.display = 'block';
}

// 关闭导入成绩模态框
function closeImportGradesModal() {
    const modal = document.getElementById('import-grades-modal');
    if (modal) {
        modal.remove();
    }
}

// 下载Excel模板
function downloadTemplate() {
    // 创建模板数据
    const templateData = [
        ['学生姓名', '学号', '班级', '科目', '成绩', '考试时间'],
        ['张小明', '2023001', '三年级一班', '数学', 95, '2023-06-15'],
        ['李小红', '2023002', '三年级一班', '语文', 88, '2023-06-15']
    ];
    
    // 创建CSV内容
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    templateData.forEach(row => {
        csvContent += row.join(',') + '\n';
    });
    
    // 创建下载链接
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', '成绩导入模板.csv');
    document.body.appendChild(link);
    
    // 触发下载
    link.click();
    
    // 清理
    document.body.removeChild(link);
    
    alert('模板文件已下载，请按照格式填写数据后上传。');
}

// 导入成绩
function importGrades() {
    const fileInput = document.getElementById('excel-file');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('请选择要导入的Excel文件！');
        return;
    }
    
    // 检查文件类型
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        alert('请选择Excel文件（.xlsx, .xls）或CSV文件（.csv）！');
        return;
    }
    
    // 模拟文件处理过程
    alert(`文件"${file.name}"已选择，模拟导入过程完成。`);
    
    // 关闭模态框
    closeImportGradesModal();
    
    // 重新渲染表格和分页
    renderGradesTable();
    renderPagination();
}

// 加载数据分析页面
function loadAnalysisPage() {
    document.getElementById('content-area').innerHTML = `
        <div class="page-header">
            <h2><i class="fas fa-chart-line"></i> 数据分析</h2>
        </div>
        
        <div class="analysis-selector">
            <label for="analysis-class">选择班级：</label>
            <div class="custom-select">
                <select id="analysis-class">
                    <option value="">所有班级</option>
                    <option value="三年级一班">三年级一班</option>
                    <option value="三年级二班">三年级二班</option>
                    <option value="四年级一班">四年级一班</option>
                </select>
            </div>
        </div>
        
        <div class="tabs">
            <button class="tab-btn active" data-tab="class-analysis">班级总体分析</button>
            <button class="tab-btn" data-tab="student-trend">学生趋势分析</button>
            <button class="tab-btn" data-tab="cross-comparison">横向对比分析</button>
            <button class="tab-btn" data-tab="subject-correlation">学科关联分析</button>
        </div>
        
        <div id="class-analysis" class="tab-content active">
            <div class="chart-container">
                <div class="analysis-card">
                    <h3><i class="fas fa-chart-bar"></i> 各科目平均分对比</h3>
                    <div class="chart-wrapper">
                        <canvas id="subjectChart"></canvas>
                    </div>
                </div>
                
                <div class="analysis-card">
                    <h3><i class="fas fa-chart-line"></i> 成绩趋势分析</h3>
                    <div class="chart-wrapper">
                        <canvas id="trendChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="student-trend" class="tab-content">
            <div class="chart-container">
                <div class="analysis-card">
                    <h3><i class="fas fa-user-graduate"></i> 学生个体成绩趋势</h3>
                    <div class="chart-wrapper">
                        <canvas id="studentTrendChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="cross-comparison" class="tab-content">
            <div class="chart-container">
                <div class="analysis-card">
                    <h3><i class="fas fa-balance-scale"></i> 不同班级成绩对比</h3>
                    <div class="chart-wrapper">
                        <canvas id="crossClassChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="subject-correlation" class="tab-content">
            <div class="chart-container">
                <div class="analysis-card">
                    <h3><i class="fas fa-project-diagram"></i> 学科成绩关联性分析</h3>
                    <div class="chart-wrapper">
                        <canvas id="correlationChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加标签页切换事件
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有活动类
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // 添加活动类到当前按钮
            this.classList.add('active');
            
            // 显示对应的内容
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // 初始化图表
            initCharts();
        });
    });
    
    // 添加班级选择事件监听器
    document.getElementById('analysis-class').addEventListener('change', function() {
        initCharts();
    });
    
    // 初始化图表
    initCharts();
}

// 初始化图表
function initCharts() {
    // 获取选择的班级
    const selectedClass = document.getElementById('analysis-class').value;
    
    // 根据选择的班级过滤数据
    let filteredData = gradesData;
    if (selectedClass) {
        filteredData = gradesData.filter(grade => grade.class === selectedClass);
    }
    
    // 销毁已存在的图表实例
    if (window.subjectChart) window.subjectChart.destroy();
    if (window.trendChart) window.trendChart.destroy();
    if (window.studentTrendChart) window.studentTrendChart.destroy();
    if (window.crossClassChart) window.crossClassChart.destroy();
    if (window.correlationChart) window.correlationChart.destroy();
    
    // 计算各科目平均分
    const subjectScores = {
        '数学': [],
        '语文': [],
        '英语': []
    };
    
    filteredData.forEach(grade => {
        if (subjectScores[grade.subject]) {
            subjectScores[grade.subject].push(grade.score);
        }
    });
    
    const subjectAverages = {};
    for (const subject in subjectScores) {
        if (subjectScores[subject].length > 0) {
            const sum = subjectScores[subject].reduce((a, b) => a + b, 0);
            subjectAverages[subject] = sum / subjectScores[subject].length;
        } else {
            subjectAverages[subject] = 0;
        }
    }
    
    // 各科目平均分对比图表
    const subjectCtx = document.getElementById('subjectChart').getContext('2d');
    window.subjectChart = new Chart(subjectCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(subjectAverages),
            datasets: [{
                label: '平均分',
                data: Object.values(subjectAverages),
                backgroundColor: [
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(63, 55, 201, 0.7)',
                    'rgba(76, 201, 240, 0.7)'
                ],
                borderColor: [
                    'rgba(67, 97, 238, 1)',
                    'rgba(63, 55, 201, 1)',
                    'rgba(76, 201, 240, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: selectedClass ? `${selectedClass} - 各科目平均分对比` : '所有班级 - 各科目平均分对比',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
    
    // 成绩趋势分析图表（模拟数据）
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    window.trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
                label: '数学',
                data: [82, 85, 87, 84, 86, subjectAverages['数学'] || 85.5],
                borderColor: 'rgba(67, 97, 238, 1)',
                backgroundColor: 'rgba(67, 97, 238, 0.2)',
                tension: 0.3,
                fill: true
            }, {
                label: '语文',
                data: [78, 80, 82, 81, 83, subjectAverages['语文'] || 82.3],
                borderColor: 'rgba(63, 55, 201, 1)',
                backgroundColor: 'rgba(63, 55, 201, 0.2)',
                tension: 0.3,
                fill: true
            }, {
                label: '英语',
                data: [75, 77, 79, 78, 80, subjectAverages['英语'] || 78.9],
                borderColor: 'rgba(76, 201, 240, 1)',
                backgroundColor: 'rgba(76, 201, 240, 0.2)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: selectedClass ? `${selectedClass} - 成绩趋势分析` : '所有班级 - 成绩趋势分析',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
    
    // 学生个体成绩趋势图表（模拟数据）
    const studentTrendCtx = document.getElementById('studentTrendChart').getContext('2d');
    window.studentTrendChart = new Chart(studentTrendCtx, {
        type: 'line',
        data: {
            labels: ['期中考试', '月考1', '月考2', '月考3', '期末考试'],
            datasets: [{
                label: '张小明',
                data: [85, 88, 90, 87, 95],
                borderColor: 'rgba(67, 97, 238, 1)',
                backgroundColor: 'rgba(67, 97, 238, 0.2)',
                tension: 0.3,
                fill: true
            }, {
                label: '李小红',
                data: [80, 82, 85, 83, 88],
                borderColor: 'rgba(63, 55, 201, 1)',
                backgroundColor: 'rgba(63, 55, 201, 0.2)',
                tension: 0.3,
                fill: true
            }, {
                label: '王小刚',
                data: [78, 80, 82, 81, 92],
                borderColor: 'rgba(76, 201, 240, 1)',
                backgroundColor: 'rgba(76, 201, 240, 0.2)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: selectedClass ? `${selectedClass} - 学生个体成绩趋势` : '所有班级 - 学生个体成绩趋势',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
    
    // 不同班级成绩对比图表
    const classes = ['三年级一班', '三年级二班', '四年级一班'];
    const classAverages = {};
    
    classes.forEach(className => {
        const classData = gradesData.filter(grade => grade.class === className);
        if (classData.length > 0) {
            const subjectAverages = {
                '数学': [],
                '语文': [],
                '英语': []
            };
            
            classData.forEach(grade => {
                if (subjectAverages[grade.subject]) {
                    subjectAverages[grade.subject].push(grade.score);
                }
            });
            
            const averages = {};
            for (const subject in subjectAverages) {
                if (subjectAverages[subject].length > 0) {
                    const sum = subjectAverages[subject].reduce((a, b) => a + b, 0);
                    averages[subject] = sum / subjectAverages[subject].length;
                } else {
                    averages[subject] = 0;
                }
            }
            
            classAverages[className] = averages;
        }
    });
    
    const crossClassCtx = document.getElementById('crossClassChart').getContext('2d');
    window.crossClassChart = new Chart(crossClassCtx, {
        type: 'bar',
        data: {
            labels: classes,
            datasets: [{
                label: '数学',
                data: classes.map(cls => classAverages[cls] ? classAverages[cls]['数学'] : 0),
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 1
            }, {
                label: '语文',
                data: classes.map(cls => classAverages[cls] ? classAverages[cls]['语文'] : 0),
                backgroundColor: 'rgba(63, 55, 201, 0.7)',
                borderColor: 'rgba(63, 55, 201, 1)',
                borderWidth: 1
            }, {
                label: '英语',
                data: classes.map(cls => classAverages[cls] ? classAverages[cls]['英语'] : 0),
                backgroundColor: 'rgba(76, 201, 240, 0.7)',
                borderColor: 'rgba(76, 201, 240, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '不同班级成绩对比',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
    
    // 学科成绩关联性分析图表
    const correlationCtx = document.getElementById('correlationChart').getContext('2d');
    window.correlationChart = new Chart(correlationCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '数学 vs 语文',
                data: [
                    {x: 85, y: 82},
                    {x: 95, y: 90},
                    {x: 78, y: 75},
                    {x: 92, y: 88},
                    {x: 88, y: 85}
                ],
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderColor: 'rgba(67, 97, 238, 1)'
            }, {
                label: '数学 vs 英语',
                data: [
                    {x: 85, y: 78},
                    {x: 95, y: 85},
                    {x: 78, y: 72},
                    {x: 92, y: 82},
                    {x: 88, y: 80}
                ],
                backgroundColor: 'rgba(76, 201, 240, 0.7)',
                borderColor: 'rgba(76, 201, 240, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: selectedClass ? `${selectedClass} - 学科成绩关联性分析` : '所有班级 - 学科成绩关联性分析',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '数学成绩'
                    },
                    min: 70,
                    max: 100
                },
                y: {
                    title: {
                        display: true,
                        text: '其他科目成绩'
                    },
                    min: 70,
                    max: 100
                }
            }
        }
    });
}

// 加载报告生成页面
function loadReportsPage() {
    document.getElementById('content-area').innerHTML = `
        <div class="page-header">
            <h2><i class="fas fa-file-alt"></i> 报告生成</h2>
        </div>
        
        <div class="report-selector">
            <label for="report-type">报告类型：</label>
            <div class="custom-select">
                <select id="report-type">
                    <option value="student">个性化学生报告</option>
                    <option value="class">班级整体报告</option>
                </select>
            </div>
            
            <label for="report-class">选择班级：</label>
            <div class="custom-select">
                <select id="report-class">
                    <option value="三年级一班">三年级一班</option>
                    <option value="三年级二班">三年级二班</option>
                    <option value="四年级一班">四年级一班</option>
                </select>
            </div>
            
            <button id="generate-report" class="primary"><i class="fas fa-file-medical"></i> 生成报告</button>
        </div>
        
        <div id="report-preview" style="display: none;">
            <div class="actions">
                <button id="export-report" class="primary"><i class="fas fa-file-export"></i> 导出报告</button>
                <button id="print-report" class="secondary"><i class="fas fa-print"></i> 打印报告</button>
            </div>
            <div id="report-content"></div>
        </div>
    `;
    
    // 添加事件监听器
    document.getElementById('generate-report').addEventListener('click', function() {
        const reportType = document.getElementById('report-type').value;
        if (reportType === 'student') {
            generateStudentReport();
        } else {
            generateClassReport();
        }
    });
}

// 生成个性化学生报告
function generateStudentReport() {
    const reportContent = `
        <h2>张小明 - 个性化学习报告</h2>
        <div class="ai-summary">
            <h3><i class="fas fa-robot"></i> AI智能总结</h3>
            <p>张小明同学在本学期表现优秀，各科目成绩均衡发展，尤其在数学方面表现突出。建议继续保持当前学习状态，并在语文阅读理解方面加强训练。</p>
        </div>
        
        <div class="chart-container">
            <div class="analysis-card compact">
                <h3><i class="fas fa-chart-bar"></i> 各科目成绩对比</h3>
                <div class="chart-wrapper">
                    <canvas id="studentReportSubjectChart"></canvas>
                </div>
            </div>
            
            <div class="analysis-card compact">
                <h3><i class="fas fa-chart-line"></i> 成绩趋势分析</h3>
                <div class="chart-wrapper">
                    <canvas id="studentReportTrendChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="analysis-card">
            <h3><i class="fas fa-table"></i> 详细成绩记录</h3>
            <table>
                <thead>
                    <tr>
                        <th>科目</th>
                        <th>成绩</th>
                        <th>班级排名</th>
                        <th>年级排名</th>
                        <th>评价</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>数学</td>
                        <td>95</td>
                        <td>第1名</td>
                        <td>第5名</td>
                        <td><span class="positive">优秀</span></td>
                    </tr>
                    <tr>
                        <td>语文</td>
                        <td>88</td>
                        <td>第3名</td>
                        <td>第15名</td>
                        <td><span class="positive">良好</span></td>
                    </tr>
                    <tr>
                        <td>英语</td>
                        <td>92</td>
                        <td>第2名</td>
                        <td>第8名</td>
                        <td><span class="positive">优秀</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="ai-advice">
            <h3><i class="fas fa-lightbulb"></i> AI学习建议</h3>
            <p>针对张小明同学的学习情况，建议：</p>
            <ol>
                <li>继续保持数学学科的优势，可尝试参与数学竞赛活动</li>
                <li>加强语文阅读理解训练，建议每天阅读课外书籍30分钟</li>
                <li>英语方面可加强听力练习，推荐使用英语学习APP</li>
                <li>合理安排学习时间，注意劳逸结合</li>
            </ol>
        </div>
    `;
    
    document.getElementById('report-content').innerHTML = reportContent;
    document.getElementById('report-preview').style.display = 'block';
    
    // 创建各科目成绩对比图表
    const subjectCtx = document.getElementById('studentReportSubjectChart').getContext('2d');
    new Chart(subjectCtx, {
        type: 'bar',
        data: {
            labels: ['数学', '语文', '英语'],
            datasets: [{
                label: '成绩',
                data: [95, 88, 92],
                backgroundColor: [
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(63, 55, 201, 0.7)',
                    'rgba(76, 201, 240, 0.7)'
                ],
                borderColor: [
                    'rgba(67, 97, 238, 1)',
                    'rgba(63, 55, 201, 1)',
                    'rgba(76, 201, 240, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: '各科目成绩对比'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // 创建成绩趋势分析图表
    const trendCtx = document.getElementById('studentReportTrendChart').getContext('2d');
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['期中考试', '月考1', '月考2', '月考3', '期末考试'],
            datasets: [{
                label: '数学',
                data: [85, 88, 90, 87, 95],
                borderColor: 'rgba(67, 97, 238, 1)',
                backgroundColor: 'rgba(67, 97, 238, 0.2)',
                tension: 0.3,
                fill: true
            }, {
                label: '语文',
                data: [80, 82, 85, 83, 88],
                borderColor: 'rgba(63, 55, 201, 1)',
                backgroundColor: 'rgba(63, 55, 201, 0.2)',
                tension: 0.3,
                fill: true
            }, {
                label: '英语',
                data: [78, 80, 82, 81, 92],
                borderColor: 'rgba(76, 201, 240, 1)',
                backgroundColor: 'rgba(76, 201, 240, 0.2)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '成绩趋势分析'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// 生成班级报告
function generateClassReport() {
    const reportContent = `
        <h2>三年级一班整体学习报告</h2>
        <div class="ai-summary">
            <h3><i class="fas fa-robot"></i> AI智能总结</h3>
            <p>三年级一班在本学期整体表现良好，班级平均分达到83.9分，高于年级平均分。数学成绩尤为突出，班级平均分95.5分。建议继续加强英语学科的教学，提升整体英语水平。</p>
        </div>
        
        <div class="chart-container">
            <div class="analysis-card compact">
                <h3><i class="fas fa-chart-bar"></i> 各科目平均分对比</h3>
                <div class="chart-wrapper">
                    <canvas id="classReportSubjectChart"></canvas>
                </div>
            </div>
            
            <div class="analysis-card compact">
                <h3><i class="fas fa-chart-line"></i> 成绩分布情况</h3>
                <div class="chart-wrapper">
                    <canvas id="classReportScoreChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="analysis-card">
            <h3><i class="fas fa-table"></i> 详细数据表</h3>
            <table>
                <thead>
                    <tr>
                        <th>科目</th>
                        <th>平均分</th>
                        <th>中位数</th>
                        <th>最高分</th>
                        <th>最低分</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>数学</td>
                        <td>85.5</td>
                        <td>87.0</td>
                        <td>98.5</td>
                        <td>65.0</td>
                    </tr>
                    <tr>
                        <td>语文</td>
                        <td>82.3</td>
                        <td>83.5</td>
                        <td>95.0</td>
                        <td>60.0</td>
                    </tr>
                    <tr>
                        <td>英语</td>
                        <td>78.9</td>
                        <td>79.5</td>
                        <td>92.0</td>
                        <td>58.5</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="ai-advice">
            <h3><i class="fas fa-lightbulb"></i> AI教学建议</h3>
            <p>针对三年级一班的教学建议：</p>
            <ol>
                <li>继续保持数学学科的优势，鼓励学生参与数学竞赛活动</li>
                <li>加强英语教学，特别是听力和口语训练</li>
                <li>开展语文阅读分享活动，提升学生的阅读理解能力</li>
                <li>关注成绩较低的学生，提供个性化辅导</li>
            </ol>
        </div>
    `;
    
    document.getElementById('report-content').innerHTML = reportContent;
    document.getElementById('report-preview').style.display = 'block';
    
    // 创建各科目平均分对比图表
    const subjectCtx = document.getElementById('classReportSubjectChart').getContext('2d');
    new Chart(subjectCtx, {
        type: 'bar',
        data: {
            labels: ['数学', '语文', '英语'],
            datasets: [{
                label: '平均分',
                data: [85.5, 82.3, 78.9],
                backgroundColor: [
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(63, 55, 201, 0.7)',
                    'rgba(76, 201, 240, 0.7)'
                ],
                borderColor: [
                    'rgba(67, 97, 238, 1)',
                    'rgba(63, 55, 201, 1)',
                    'rgba(76, 201, 240, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: '各科目平均分对比'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // 创建成绩分布情况图表
    const scoreCtx = document.getElementById('classReportScoreChart').getContext('2d');
    new Chart(scoreCtx, {
        type: 'line',
        data: {
            labels: ['90-100分', '80-89分', '70-79分', '60-69分', '60分以下'],
            datasets: [{
                label: '数学',
                data: [12, 10, 5, 2, 1],
                borderColor: 'rgba(67, 97, 238, 1)',
                backgroundColor: 'rgba(67, 97, 238, 0.2)',
                tension: 0.3,
                fill: true
            }, {
                label: '语文',
                data: [10, 12, 6, 1, 1],
                borderColor: 'rgba(63, 55, 201, 1)',
                backgroundColor: 'rgba(63, 55, 201, 0.2)',
                tension: 0.3,
                fill: true
            }, {
                label: '英语',
                data: [8, 11, 7, 3, 1],
                borderColor: 'rgba(76, 201, 240, 1)',
                backgroundColor: 'rgba(76, 201, 240, 0.2)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '各科目成绩分布情况'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}