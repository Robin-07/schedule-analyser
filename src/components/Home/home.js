import React from "react";
import { useEffect, useState, useCallback } from "react";
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector, Legend } from 'recharts';
import ReactDatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { Rings } from  'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import './home.css';

export default function Home(){

    const [activeIndex, setActiveIndex] = useState(null);
    const [showLoader, setShowLoader] = useState(true);
    const onMouseOver = useCallback((data, index) => {
        setActiveIndex(index);
    }, []);
    const onMouseLeave = useCallback((data, index) => {
        setActiveIndex(null);
    }, []);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#dd4477', '#6633cc', '#3b3eac'];

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
        const sx = cx + (outerRadius - 220) * cos;
        const sy = cy + (outerRadius - 220) * sin;
        return (
          <Sector
            cx={sx}
            cy={sy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={COLORS[activeIndex % COLORS.length]}
          />
        );
      };
      
    function CustomTooltip({ payload, active }) {
        if (active) {
          return (
            <div className="custom-tooltip">
              <p className="tooltip-head">Date : {payload[0].name}</p>
              <p>Total Meals scheduled : {payload[0].value}</p>
              <p className="tooltip-head">Schedule by time slots</p>
              <ul>
                {Object.keys(mealsByTimeSlots).length !== 0 && 
                Object.keys(mealsByTimeSlots[payload[0].name]).map(((timeSlot, index) => 
                  <li key = {index}>{timeSlot} : {mealsByTimeSlots[payload[0].name][timeSlot]}</li>))}
              </ul>
            </div>
          );
        }
      
        return null;
      }

    const processDate = (date) => {
        /* Converting date from mm/dd/yyyy to string yyyy-mm-dd in order 
         to be able to compare it with JSON data */
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
        d.setFullYear(2021, 9 , 2);
        return d;
    });
    const [mealsByTimeSlots, setMealsByTimeSlots] = useState({});

    const getTimeSlot = (schedule_time) => {
      let hour = Number(schedule_time.substring(0,2));
      let from = (hour - (hour % 3)) % 12;
      let to = (hour + (3 - (hour % 3))) % 12;
      if(from === 0) from = 12;
      if(to === 0) to = 12;
      return from + (hour < 12 ? 'am' : 'pm') + ' to ' + to + (hour >= 9 && hour < 21 ? 'pm' : 'am');
    }

    useEffect(() => {
        if(data.length === 0){
            axios.get('https://jsonkeeper.com/b/HU8U/')
            .then((response) => {
              setData(response.data);
              setShowLoader(false)
              })
            .catch((error) => console.log(error.response))
        }
        else{
            let selected_date = processDate(selectedDate);
            const newData = [];
            const count = {};
            const newMealsByTimeSlots = {};
            for(const item of data){
                if(selected_date === item.item_date) {
                    let schedule_date = item.schedule_time.split(' ')[0];
                    let schedule_time = item.schedule_time.split(' ')[1];
                    let timeSlot = getTimeSlot(schedule_time);
                    if(count[schedule_date]) count[schedule_date]++; 
                    else count[schedule_date] = 1;
                    if(newMealsByTimeSlots[schedule_date] === undefined)
                      newMealsByTimeSlots[schedule_date] = {};
                    if(newMealsByTimeSlots[schedule_date][timeSlot] === undefined)
                      newMealsByTimeSlots[schedule_date][timeSlot] = 1;
                    else newMealsByTimeSlots[schedule_date][timeSlot]++;
                }
            }
            for(const scheduleDate of Object.keys(count)){
                newData.push({name: scheduleDate, value: count[scheduleDate]});
            }
            setDisplayData(newData);
            setMealsByTimeSlots(newMealsByTimeSlots);
        }
    },[selectedDate, data, setMealsByTimeSlots]);

    return(
        <div className = 'container'>
            <div className = 'chart-controls-container'>
                <div className = 'chart-controls'>
                <div className = 'chart-controls-title'>Select Delivery Date</div>
                <ReactDatePicker selected = {selectedDate} onChange = {(date) => setSelectedDate(date)}/>
                </div>
            </div>  
            <ResponsiveContainer width="100%" height="100%">
            {showLoader ? <Rings color = '#696969' ariaLabel="Loading"/> :
            displayData.length === 0 ? <div className = 'no-data'>Data Not Found</div> :
                <PieChart width={800} height={800}>
                <Pie
                    activeIndex={activeIndex}
                    data={displayData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    activeShape={renderActiveShape}
                    onMouseOver={onMouseOver}
                    onMouseLeave={onMouseLeave}
                    outerRadius={230}
                    fill="#8884d8"
                    nameKey="name"
                    dataKey="value"
                >
                    {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Legend
                  payload={
                    displayData.map(
                      (item, index) => ({
                        id: item.name,
                        type: "circle",
                        value: `${item.name} (${item.value})`,
                        color: COLORS[index % COLORS.length]
                      })
                    )
                  }
                />
                <Tooltip content={<CustomTooltip />}/>
                </PieChart>}
            </ResponsiveContainer>
        </div>
    );
}