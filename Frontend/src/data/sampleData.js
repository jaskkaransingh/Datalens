// Sample dataset for DataLens dashboard demo
export const COLUMNS = ['ID', 'Name', 'Age', 'Salary', 'Department', 'Score', 'Joined', 'Status'];

export const RAW_DATA = [
    { ID: 1, Name: 'Alice Johnson', Age: 28, Salary: 72000, Department: 'Engineering', Score: 94.2, Joined: '2021-03-15', Status: 'Active' },
    { ID: 2, Name: 'Bob Smith', Age: 34, Salary: null, Department: 'Marketing', Score: 78.5, Joined: '2019-07-22', Status: 'Active' },
    { ID: 3, Name: 'Carol White', Age: null, Salary: 65000, Department: 'HR', Score: 88.1, Joined: '2020-11-01', Status: 'On Leave' },
    { ID: 4, Name: 'David Lee', Age: 41, Salary: 91000, Department: 'Engineering', Score: null, Joined: '2018-04-10', Status: 'Active' },
    { ID: 5, Name: 'Eva Martinez', Age: 29, Salary: 58000, Department: 'Sales', Score: 71.3, Joined: '2022-01-18', Status: 'Active' },
    { ID: 6, Name: 'Frank Brown', Age: 38, Salary: -500, Department: 'Finance', Score: 85.7, Joined: '2017-09-30', Status: 'Active' },
    { ID: 7, Name: null, Age: 25, Salary: 48000, Department: 'Marketing', Score: 66.4, Joined: '2023-05-12', Status: 'Active' },
    { ID: 8, Name: 'Hannah Clark', Age: 32, Salary: 77000, Department: 'Engineering', Score: 91.8, Joined: '2020-08-25', Status: 'Active' },
    { ID: 9, Name: 'Ivan Rodriguez', Age: 44, Salary: 105000, Department: 'Management', Score: 96.3, Joined: '2015-02-14', Status: 'Active' },
    { ID: 10, Name: 'Julia Kim', Age: 27, Salary: 54000, Department: 'Sales', Score: 73.9, Joined: '2022-09-08', Status: 'Inactive' },
    { ID: 11, Name: 'Kevin Patel', Age: 36, Salary: 83000, Department: 'Finance', Score: 89.2, Joined: '2018-12-03', Status: 'Active' },
    { ID: 12, Name: 'Laura Chen', Age: null, Salary: null, Department: 'HR', Score: null, Joined: '2021-06-19', Status: 'Active' },
    { ID: 13, Name: 'Mike Davis', Age: 31, Salary: 69000, Department: 'Sales', Score: 77.6, Joined: '2020-03-28', Status: 'Active' },
    { ID: 14, Name: 'Nina Singh', Age: 29, Salary: 61000, Department: 'Marketing', Score: 82.4, Joined: '2021-10-14', Status: 'Active' },
    { ID: 15, Name: 'Oscar Müller', Age: 52, Salary: 120000, Department: 'Management', Score: 97.1, Joined: '2012-05-07', Status: 'Active' },
];

export const COLUMN_HEALTH = {
    ID: { missing: 0, warnings: 0, clean: 100 },
    Name: { missing: 7, warnings: 0, clean: 93 },
    Age: { missing: 13, warnings: 0, clean: 87 },
    Salary: { missing: 13, warnings: 7, clean: 80 },
    Department: { missing: 0, warnings: 0, clean: 100 },
    Score: { missing: 13, warnings: 0, clean: 87 },
    Joined: { missing: 0, warnings: 0, clean: 100 },
    Status: { missing: 0, warnings: 0, clean: 100 },
};

export const DEPT_CHART_DATA = {
    labels: ['Engineering', 'Marketing', 'HR', 'Finance', 'Sales', 'Management'],
    datasets: [{
        label: 'Avg Salary ($)',
        data: [80000, 56640, 62500, 84000, 57333, 112500],
        backgroundColor: [
            'rgba(201,168,76,0.75)',
            'rgba(217,119,6,0.65)',
            'rgba(13,148,136,0.65)',
            'rgba(225,29,72,0.6)',
            'rgba(124,58,237,0.65)',
            'rgba(5,150,105,0.7)',
        ],
        borderColor: [
            '#c9a84c', '#d97706', '#0d9488', '#e11d48', '#7c3aed', '#059669',
        ],
        borderWidth: 2,
        borderRadius: 8,
    }],
};

export const SCORE_LINE_DATA = {
    labels: RAW_DATA.filter(r => r.Score).map(r => r.Name?.split(' ')[0] || `#${r.ID}`),
    datasets: [{
        label: 'Performance Score',
        data: RAW_DATA.filter(r => r.Score).map(r => r.Score),
        borderColor: '#c9a84c',
        backgroundColor: 'rgba(201,168,76,0.12)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#d97706',
        pointRadius: 5,
        pointHoverRadius: 8,
    }],
};

export const STATUS_PIE_DATA = {
    labels: ['Active', 'Inactive', 'On Leave'],
    datasets: [{
        data: [11, 1, 1],
        backgroundColor: ['rgba(13,148,136,0.75)', 'rgba(225,29,72,0.65)', 'rgba(217,119,6,0.65)'],
        borderColor: ['#0d9488', '#e11d48', '#d97706'],
        borderWidth: 2,
    }],
};

export const AGE_SALARY_SCATTER = {
    datasets: [{
        label: 'Age vs Salary',
        data: RAW_DATA
            .filter(r => r.Age && r.Salary && r.Salary > 0)
            .map(r => ({ x: r.Age, y: r.Salary })),
        backgroundColor: 'rgba(201,168,76,0.65)',
        borderColor: '#c9a84c',
        pointRadius: 7,
        pointHoverRadius: 10,
    }],
};

export const STATS = {
    rows: RAW_DATA.length,
    columns: COLUMNS.length,
    missing: 6,
    warnings: 1,
    clean: 93,
};

export const SUGGESTIONS = [
    { id: 1, column: 'Name', issue: 'Missing value in row 7', action: 'Fill with "Unknown"', severity: 'medium' },
    { id: 2, column: 'Salary', issue: 'Negative value (-500) in row 6', action: 'Replace with median salary', severity: 'high' },
    { id: 3, column: 'Age', issue: '2 missing values detected', action: 'Impute with column mean', severity: 'medium' },
    { id: 4, column: 'Score', issue: '2 missing values detected', action: 'Drop rows with missing', severity: 'low' },
    { id: 5, column: 'Laura (row 12)', issue: 'Multiple missing fields', action: 'Remove entire row', severity: 'high' },
];
