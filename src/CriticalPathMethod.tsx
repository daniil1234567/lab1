import React, { useState, useEffect } from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

const GanttChart = () => {
    // Определение задач для диаграммы Ганта
    const tasks: Task[] = [
        {
            id: "1",
            name: "b1",
            start: new Date(0),
            end: new Date(5 * 24 * 60 * 60 * 1000), // Продолжительность 5 дней
            progress: 0,
            type: "task",
            dependencies: [],
        },
        {
            id: "2",
            name: "b2",
            start: new Date(0),
            end: new Date(8 * 24 * 60 * 60 * 1000), // Продолжительность 8 дней
            progress: 0,
            type: "task",
            dependencies: [],
        },
        {
            id: "3",
            name: "b3",
            start: new Date(0),
            end: new Date(3 * 24 * 60 * 60 * 1000), // Продолжительность 3 дня
            progress: 0,
            type: "task",
            dependencies: [],
        },
        {
            id: "4",
            name: "b4",
            start: new Date(5 * 24 * 60 * 60 * 1000), // Зависит от задачи b1
            end: new Date(11 * 24 * 60 * 60 * 1000),
            progress: 0,
            type: "task",
            dependencies: ["1"],
        },
        {
            id: "5",
            name: "b5",
            start: new Date(5 * 24 * 60 * 60 * 1000),
            end: new Date(9 * 24 * 60 * 60 * 1000),
            progress: 0,
            type: "task",
            dependencies: ["1"], // Зависит от задачи b1
        },
        {
            id: "6",
            name: "b6",
            start: new Date(3 * 24 * 60 * 60 * 1000),
            end: new Date(4 * 24 * 60 * 60 * 1000),
            progress: 0,
            type: "task",
            dependencies: ["3"], // Зависит от задачи b3
        },
        {
            id: "7",
            name: "b7",
            start: new Date(9 * 24 * 60 * 60 * 1000),
            end: new Date(11 * 24 * 60 * 60 * 1000),
            progress: 0,
            type: "task",
            dependencies: ["2", "5", "6"], // Зависит от задач b2, b5 и b6
        },
        {
            id: "8",
            name: "b8",
            start: new Date(9 * 24 * 60 * 60 * 1000),
            end: new Date(15 * 24 * 60 * 60 * 1000),
            progress: 0,
            type: "task",
            dependencies: ["2", "5", "6"], // Зависит от задач b2, b5 и b6
        },
        {
            id: "9",
            name: "b9",
            start: new Date(11 * 24 * 60 * 60 * 1000),
            end: new Date(14 * 24 * 60 * 60 * 1000),
            progress: 0,
            type: "task",
            dependencies: ["4", "7"], // Зависит от задач b4 и b7
        },
        {
            id: "10",
            name: "b10",
            start: new Date(3 * 24 * 60 * 60 * 1000),
            end: new Date(12 * 24 * 60 * 60 * 1000),
            progress: 0,
            type: "task",
            dependencies: ["3"], // Зависит от задачи b3
        },
        {
            id: "11",
            name: "b11",
            start: new Date(12 * 24 * 60 * 60 * 1000),
            end: new Date(19 * 24 * 60 * 60 * 1000),
            progress: 0,
            type: "task",
            dependencies: ["2", "5", "6", "10"], // Зависит от задач b2, b5, b6 и b10
        },
    ];

    // Хук для смены режима отображения диаграммы (недели, дни и т.д.)
    const [viewMode, setViewMode] = useState(ViewMode.Day);

    // Хранение результатов расчётов: ранние и поздние сроки, резервы и т.д.
    const [results, setResults] = useState<{
        earlyStart: { [key: string]: number };
        lateStart: { [key: string]: number };
        totalTime: number;
        criticalPath: string[];
        totalReserves: { [key: string]: number };
        independentReserves: { [key: string]: number };
        tensionCoefficients: { [key: string]: number };
    } | null>(null);

    // Рассчитываем необходимые параметры после монтирования компонента
    useEffect(() => {
        const calculateProjectDetails = () => {
            // Словарь с продолжительностью каждой задачи
            const durations: { [key: string]: number } = {
                "b1": 5,
                "b2": 8,
                "b3": 3,
                "b4": 6,
                "b5": 4,
                "b6": 1,
                "b7": 2,
                "b8": 6,
                "b9": 3,
                "b10": 9,
                "b11": 7,
            };

            // Зависимости между задачами
            const dependencies: { [key: string]: string[] } = {
                "b1": [],
                "b2": [],
                "b3": [],
                "b4": ["b1"],
                "b5": ["b1"],
                "b6": ["b3"],
                "b7": ["b2", "b5", "b6"],
                "b8": ["b2", "b5", "b6"],
                "b9": ["b4", "b7"],
                "b10": ["b3"],
                "b11": ["b2", "b5", "b6", "b10"],
            };

            // Массивы для ранних и поздних сроков
            const earlyStart: { [key: string]: number } = {};
            const earlyFinish: { [key: string]: number } = {};
            const lateStart: { [key: string]: number } = {};
            const lateFinish: { [key: string]: number } = {};
            const totalReserves: { [key: string]: number } = {};
            const independentReserves: { [key: string]: number } = {};
            const tensionCoefficients: { [key: string]: number } = {};

            // Рассчёт ранних сроков начала и окончания задач
            Object.keys(durations).forEach(task => {
                earlyStart[task] = dependencies[task].reduce(
                    (max, dep) => Math.max(max, earlyFinish[dep] || 0), // Максимальное значение из ранних окончаний зависимых задач
                    0
                );
                earlyFinish[task] = earlyStart[task] + durations[task]; // Раннее завершение = ранний старт + продолжительность
            });

            // Общая продолжительность проекта
            const totalTime = Math.max(...Object.values(earlyFinish)); // Максимальное значение из ранних завершений

            // Рассчёт поздних сроков начала и окончания задач
            Object.keys(durations).reverse().forEach(task => {
                lateFinish[task] = lateFinish[task] ?? totalTime; // Позднее завершение начинается с общей продолжительности проекта
                lateStart[task] = lateFinish[task] - durations[task]; // Поздний старт = позднее завершение - продолжительность
                dependencies[task].forEach(dep => {
                    lateFinish[dep] = Math.min(lateFinish[dep] ?? Infinity, lateStart[task]); // Обновляем поздние завершения для зависимых задач
                });
            });

            // Определение критического пути
            const criticalPath = Object.keys(durations).filter(task => earlyStart[task] === lateStart[task]); // Критический путь - задачи без резервов

            // Рассчёт резервов времени
            Object.keys(durations).forEach(task => {
                totalReserves[task] = lateStart[task] - earlyStart[task]; // Полный резерв = поздний старт - ранний старт
                independentReserves[task] = Math.max(
                    lateStart[task] - (earlyFinish[dependencies[task][0]] || 0), // Независимый резерв
                    0
                );
            });

            // Рассчёт коэффициентов напряжённости для некритических задач
            Object.keys(durations).forEach(task => {
                if (totalReserves[task] > 0) {
                    tensionCoefficients[task] = 1 - totalReserves[task] / durations[task]; // Коэффициент напряжённости = 1 - (резерв / продолжительность)
                }
            });

            return {
                earlyStart,
                lateStart,
                totalTime,
                criticalPath,
                totalReserves,
                independentReserves,
                tensionCoefficients,
            };
        };

        // Выполняем расчёты и сохраняем результаты
        const result = calculateProjectDetails();
        setResults(result);
    }, []);

    return (
        <div>
            <h2>Последовательность задач с днями</h2>
            {/* Диаграмма Ганта */}
            <Gantt tasks={tasks} viewMode={viewMode} locale={"ru"} />
            {/* Кнопки для смены режима отображения */}
            <button onClick={() => setViewMode(ViewMode.Day)}>День</button>
            <button onClick={() => setViewMode(ViewMode.Week)}>Неделя</button>

            {/* Вывод результатов расчётов */}
            {results && (
                <div>
                    <h3>Результаты расчётов:</h3>
                    <p><strong>Критический путь:</strong> {results.criticalPath.join(" → ")}</p>
                    <p><strong>Минимальное время выполнения проекта:</strong> {results.totalTime} дней</p>

                    {/* Ранние и поздние сроки начала событий */}
                    <h4>Наиболее ранние и поздние сроки наступления событий:</h4>
                    <ul>
                        {Object.keys(results.earlyStart).map(task => (
                            <li key={task}>
                                <strong>{task}:</strong> ранний старт: {results.earlyStart[task]}, поздний старт: {results.lateStart[task]}
                            </li>
                        ))}
                    </ul>

                    {/* Полные и независимые резервы времени */}
                    <h4>Полные и независимые резервы времени:</h4>
                    <ul>
                        {Object.keys(results.totalReserves).map(task => (
                            <li key={task}>
                                <strong>{task}:</strong> полный резерв: {results.totalReserves[task]}, независимый резерв: {results.independentReserves[task]}
                            </li>
                        ))}
                    </ul>

                    {/* Коэффициенты напряжённости */}
                    <h4>Коэффициенты напряженности:</h4>
                    <ul>
                        {Object.keys(results.tensionCoefficients).map(task => (
                            <li key={task}>
                                <strong>{task}:</strong> коэффициент напряженности: {results.tensionCoefficients[task]?.toFixed(2) || 'N/A'}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default GanttChart;
