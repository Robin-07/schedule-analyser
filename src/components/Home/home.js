import React from "react";
import { useEffect, useState, useCallback } from "react";
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import ReactDatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './home.css';

export default function Home(){

    const [activeIndex, setActiveIndex] = useState(null);
    const onMouseOver = useCallback((data, index) => {
        setActiveIndex(index);
    }, []);
    const onMouseLeave = useCallback((data, index) => {
        setActiveIndex(null);
    }, []);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value}) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {name}&nbsp;{`(${value})`}
        </text>
    );
    };

    const renderActiveShape = props => {
        const RADIAN = Math.PI / 180;
        const {
          cx,
          cy,
          innerRadius,
          outerRadius,
          startAngle,
          endAngle,
          midAngle
        } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius - 40) * cos;
        const sy = cy + (outerRadius - 40) * sin;
        return (
          <Sector
            cx={sx}
            cy={sy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill="red"
          />
        );
      };
      

    function getIntroOfPage(label) {
        if (label === 'Page A') {
          return "Page A is about men's clothing";
        } if (label === 'Page B') {
          return "Page B is about women's dress";
        } if (label === 'Page C') {
          return "Page C is about women's bag";
        } if (label === 'Page D') {
          return 'Page D is about household goods';
        } if (label === 'Page E') {
          return 'Page E is about food';
        } if (label === 'Page F') {
          return 'Page F is about baby food';
        }
      }

    function CustomTooltip({ payload, label, active }) {
        if (active) {
          return (
            <div className="custom-tooltip">
              <p className="label">{`${label} : ${payload[0].value}`}</p>
              <p className="intro">{getIntroOfPage(label)}</p>
              <p className="desc">Anything you want can be displayed here.</p>
            </div>
          );
        }
      
        return null;
      }

    const processDate = (date) => {
        // Converting date from mm/dd/yyyy to string yyyy-mm-dd in order 
        // to be able to compare it with JSON data.
        let year = date.getFullYear().toString();
        let month = (date.getMonth() + 1).toString();
        let day = date.getDate().toString();
        if(month.length === 1) month = '0' + month;
        if(day.length === 1) day = '0' + day;
        return year + '-' + month + '-' + day;
    }

    const [data,setData] = useState([]);
    const [displayData, setDisplayData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        d.setFullYear(2021, 4 , 19);
        return d;
    });

    useEffect(() => {
        if(data.length === 0){
            axios.get('/b/HU8U/')
            .then((response) => setData(response.data))
            .catch((error) => console.log(error.response))
        }
        else{
            let selected_date = processDate(selectedDate);
            const newData = [];
            const count = {};
            for(const item of data){
                if(selected_date === item.item_date) {
                    let schedule_date = item.schedule_time.split(' ')[0];
                    let schedule_time = item.schedule_time.split(' ')[1];
                    if(count[schedule_date]) count[schedule_date]++;
                    else count[schedule_date] = 1;
                }
            }
            for(const scheduleDate of Object.keys(count)){
                newData.push({name: scheduleDate, value: count[scheduleDate]});
            }
            setDisplayData(newData);
        }
    },[selectedDate, data]);

    return(
        <div className = 'container'>
            <div className = 'date-picker-container'>
                <div className = 'date-picker'>
                <div class = 'date-picker-title'>Select Date</div>
                <ReactDatePicker selected = {selectedDate} onChange = {(date) => setSelectedDate(date)}/>
                </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart width={1000} height={1000}>
                <Pie
                    activeIndex={activeIndex}
                    data={displayData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    activeShape={renderActiveShape}
                    onMouseOver={onMouseOver}
                    onMouseLeave={onMouseLeave}
                    outerRadius={230}
                    fill="#8884d8"
                    nameKey="name"
                    dataKey="value"
                >
                    {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} 
                    onClick={(e) => console.log(e)}/>
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}