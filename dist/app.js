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