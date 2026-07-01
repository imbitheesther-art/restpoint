import React from "react";

const UserProfile = () => {
    return <div>UserProfile</div>;
};

export default UserProfile;



import React from "react";
import {
    ScheduleComponent,
    Resize,
    Day,
    Week,
    WorkWeek,
    Month,
    Agenda,
    Inject,
    DragAndDrop,
} from "@syncfusion/ej2-react-schedule";
import { scheduleData } from "../data/dummy";
import { Headers } from "../components";

const Calender = () => {
    console.log("demo present in jan 2021");
    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Headers title="Calender" category={"App"} />
            <ScheduleComponent
                height="650px"
                eventSettings={{
                    dataSource: scheduleData,
                }}
            // selectedDate={new Date(2021, 0, 10)}
            >
                <Inject
                    services={[Resize, Day, Week, WorkWeek, Month, Agenda, DragAndDrop]}
                />
            </ScheduleComponent>
        </div>
    );
};

export default Calender;







import React from "react";
import {
    GridComponent,
    ColumnsDirective,
    ColumnDirective,
    Resize,
    Sort,
    ContextMenu,
    Filter,
    Page,
    ExcelExport,
    PdfExport,
    Edit,
    Inject,
} from "@syncfusion/ej2-react-grids";

import { Headers } from "./../components";
import { ordersData, ordersGrid } from "../data/dummy";

const Orders = () => {
    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Headers title="Orders" category="Page" />
            <GridComponent
                id="gridcomp"
                dataSource={ordersData}
                allowPaging
                allowSorting
            >
                <ColumnsDirective>
                    {ordersGrid.map((item, index) => (
                        <ColumnDirective key={index} {...item} />
                    ))}
                </ColumnsDirective>
                <Inject
                    services={[
                        Resize,
                        Sort,
                        ContextMenu,
                        Filter,
                        Page,
                        ExcelExport,
                        PdfExport,
                        Edit,
                    ]}
                />
            </GridComponent>
        </div>
    );
};

export default Orders;



import React from "react";
import {
    ChartComponent,
    SeriesCollectionDirective,
    SeriesDirective,
    Inject,
    ColumnSeries,
    Category,
    Tooltip,
    Legend,
    RangeColorSettingsDirective,
    RangeColorSettingDirective,
} from "@syncfusion/ej2-react-charts";

import {
    colorMappingData,
    ColorMappingPrimaryXAxis,
    ColorMappingPrimaryYAxis,
    rangeColorMapping,
} from "../../data/dummy";
import { Headers } from "../../components";
import { useStateContext } from "../../contexts/ContextProvider";

const ColorMapping = () => {
    const { currentMode } = useStateContext();

    return (
        <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
            <Headers
                category="Color Mappping"
                title="INDIA CLIMATE - WEATHER BY MONTH"
            />
            <div className="w-full">
                <ChartComponent
                    id="charts"
                    primaryXAxis={ColorMappingPrimaryXAxis}
                    primaryYAxis={ColorMappingPrimaryYAxis}
                    chartArea={{ border: { width: 0 } }}
                    legendSettings={{ mode: "Range", background: "white" }}
                    tooltip={{ enable: true }}
                    background={currentMode === "Dark" ? "#33373E" : "#fff"}
                >
                    <Inject services={[ColumnSeries, Tooltip, Category, Legend]} />
                    <SeriesCollectionDirective>
                        <SeriesDirective
                            dataSource={colorMappingData[0]}
                            name="INDIA"
                            xName="x"
                            yName="y"
                            type="Column"
                            cornerRadius={{
                                topLeft: 10,
                                topRight: 10,
                            }}
                        />
                    </SeriesCollectionDirective>
                    <RangeColorSettingsDirective>
                        {rangeColorMapping.map((item, index) => (
                            <RangeColorSettingDirective key={index} {...item} />
                        ))}
                    </RangeColorSettingsDirective>
                </ChartComponent>
            </div>
        </div>
    );
};

export default ColorMapping;



import React from "react";
import {
    RichTextEditorComponent,
    Inject,
    Image,
    Link,
    HtmlEditor,
    Toolbar,
    QuickToolbar,
} from "@syncfusion/ej2-react-richtexteditor";
import { Headers } from "../components";
import { EditorData } from "../data/dummy";

const Editor = () => {
    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Headers category="App" title="Editor" />
            <RichTextEditorComponent>
                <EditorData />
                <Inject services={[HtmlEditor, Toolbar, Image, Link, QuickToolbar]} />
            </RichTextEditorComponent>
        </div>
    );
};

export default Editor;


/* eslint-disable react/jsx-no-bind */

import { useTheme } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import PropTypes from 'prop-types';
import { tokens } from '../theme';
import { mockBarData as data } from '../data/mockData';

const BarChart = ({ isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <ResponsiveBar
            data={data}
            theme={{
                axis: {
                    domain: {
                        line: {
                            stroke: colors.grey[100],
                        },
                    },
                    legend: {
                        text: {
                            fill: colors.grey[100],
                        },
                    },
                    ticks: {
                        line: {
                            stroke: colors.grey[100],
                            strokeWidth: 1,
                        },
                        text: {
                            fill: colors.grey[100],
                        },
                    },
                },
                legends: {
                    text: {
                        fill: colors.grey[100],
                    },
                },
            }}
            keys={[
                'hot dog',
                'burger',
                'sandwich',
                'kebab',
                'fries',
                'donut',
            ]}
            indexBy="country"
            margin={{
                top: 50, right: 130, bottom: 50, left: 60,
            }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'nivo' }}
            defs={[
                {
                    id: 'dots',
                    type: 'patternDots',
                    background: 'inherit',
                    color: '#38bcb2',
                    size: 4,
                    padding: 1,
                    stagger: true,
                },
                {
                    id: 'lines',
                    type: 'patternLines',
                    background: 'inherit',
                    color: '#eed312',
                    rotation: -45,
                    lineWidth: 6,
                    spacing: 10,
                },
            ]}
            fill={[
                {
                    match: {
                        id: 'fries',
                    },
                    id: 'dots',
                },
                {
                    match: {
                        id: 'sandwich',
                    },
                    id: 'lines',
                },
            ]}
            borderColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        1.6,
                    ],
                ],
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : 'country',
                legendPosition: 'middle',
                legendOffset: 32,
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : 'food',
                legendPosition: 'middle',
                legendOffset: -40,
            }}
            enableGridX
            enableLabel={false}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        1.6,
                    ],
                ],
            }}
            legends={[
                {
                    dataFrom: 'keys',
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemOpacity: 1,
                            },
                        },
                    ],
                },
            ]}
            role="application"
            ariaLabel="Nivo bar chart demo"
            barAriaLabel={(e) => `${e.id}: ${e.formattedValue} in country: ${e.indexValue}`}
        />
    );
};

BarChart.propTypes = {
    isDashboard: PropTypes.bool.isRequired,
};

export default BarChart;




import { ResponsiveLine } from '@nivo/line';
import { useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { mockLineData as data } from '../data/mockData';
import { tokens } from '../theme';

const LineChart = ({ isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <ResponsiveLine
            data={data}
            theme={{
                axis: {
                    domain: {
                        line: {
                            stroke: colors.grey[100],
                        },
                    },
                    legend: {
                        text: {
                            fill: colors.grey[100],
                        },
                    },
                    ticks: {
                        line: {
                            stroke: colors.grey[100],
                            strokeWidth: 1,
                        },
                        text: {
                            fill: colors.grey[100],
                        },
                    },
                },
                legends: {
                    text: {
                        fill: colors.grey[100],
                    },
                },
                tooltip: {
                    container: {
                        color: colors.primary[500],
                    },
                },
            }}
            colors={isDashboard ? { datum: 'color' } : { scheme: 'nivo' }}
            margin={{
                top: 50, right: 110, bottom: 50, left: 60,
            }}
            xScale={{ type: 'point' }}
            yScale={{
                type: 'linear',
                min: 'auto',
                max: 'auto',
                stacked: true,
                reverse: false,
            }}
            yFormat=" >-.2f"
            curve="catmullRom"
            axisTop={null}
            axisRight={null}
            axisBottom={{
                orient: 'bottom',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : 'transportation',
                legendOffset: 36,
                legendPosition: 'middle',
            }}
            axisLeft={{
                orient: 'left',
                tickValues: 5,
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : 'count',
                legendOffset: -40,
                legendPosition: 'middle',
            }}
            enableGridX={false}
            enableGridY={false}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh
            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1,
                            },
                        },
                    ],
                },
            ]}
        />
    );
};

LineChart.propTypes = {
    isDashboard: PropTypes.bool.isRequired,
};

export default LineChart;




npm i powerbi - report - component     import React from 'react';
import { useTheme } from './ThemeContext.jsx';
import { IconMoon, IconSun, IconBell, IconSearch, IconRefresh } from './icons/IconSet.jsx';

export default function Topbar() {
    const { theme, toggle } = useTheme();
    const searchRef = React.useRef(null);
    React.useEffect(() => {
        function onKey(e) {
            const tag = (e.target && e.target.tagName) || '';
            const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;
            if (!isTyping && (e.key === '/' || (e.key === 'k' && (e.ctrlKey || e.metaKey)))) {
                e.preventDefault();
                searchRef.current?.focus();
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    function refresh() {
        window.location.reload();
    }
    function toggleRightPanel() {
        const key = 'ui:rightOpen';
        const current = localStorage.getItem(key);
        const next = current === 'false' ? true : false;
        localStorage.setItem(key, String(next));
        window.dispatchEvent(new Event('ui:rightpanel'));
    }

    function toggleLeftPanel() {
        const key = 'ui:leftOpen';
        const current = localStorage.getItem(key);
        const next = current === 'true' ? false : true;
        localStorage.setItem(key, String(next));
        // reflect to body for mobile slide-in
        if (next) document.body.classList.add('lp-open');
        else document.body.classList.remove('lp-open');
        window.dispatchEvent(new Event('ui:leftpanel'));
    }
    // initialize body class based on saved state (mobile)
    React.useEffect(() => {
        const v = localStorage.getItem('ui:leftOpen');
        const open = v == null ? false : v === 'true';
        if (open) document.body.classList.add('lp-open');
        else document.body.classList.remove('lp-open');
    }, []);
    return (
        <header className='topbar'>
            <div className='breadcrumbs' aria-label='Breadcrumb'>
                <span>Dashboards</span>
                <span className='sep'>/</span>
                <strong>Default</strong>
            </div>
            <div className='top-actions'>
                {/* mobile: open/close left sidebar */}
                <button className='icon-btn show-mobile' onClick={toggleLeftPanel} aria-label='Toggle menu'>
                    <svg
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.8'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        aria-hidden
                    >
                        <line x1='3' y1='6' x2='21' y2='6' />
                        <line x1='3' y1='12' x2='21' y2='12' />
                        <line x1='3' y1='18' x2='21' y2='18' />
                    </svg>
                </button>
                <div className='search' style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 8, top: 7, color: 'var(--muted)' }} aria-hidden>
                        <IconSearch />
                    </span>
                    <input ref={searchRef} aria-label='Search' placeholder='Search ( / )' style={{ paddingLeft: 30 }} />
                </div>
                <button className='icon-btn' onClick={refresh} aria-label='Refresh'>
                    <IconRefresh />
                </button>
                <button className='icon-btn' onClick={toggle} aria-label='Toggle theme'>
                    {theme === 'light' ? <IconMoon /> : <IconSun />}
                </button>
                <button className='icon-btn' aria-label='Notifications'>
                    <IconBell />
                </button>
                <button
                    className='icon-btn'
                    onClick={toggleRightPanel}
                    aria-label='Toggle right panel'
                    title='Toggle right panel'
                >
                    <svg
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.8'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        aria-hidden
                    >
                        <rect x='3' y='4' width='18' height='16' rx='2' />
                        <line x1='15' y1='4' x2='15' y2='20' />
                    </svg>
                </button>
                <div className='avatar' aria-label='User menu' title='You'>
                    JD
                </div>
            </div>
        </header>
    );
}