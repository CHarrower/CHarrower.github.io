// SVG Icons
const TrainIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="16" rx="2"/>
    <path d="M4 11h16"/>
    <path d="M12 3v8"/>
    <path d="M8 19 6 22"/>
    <path d="m16 19 2 3"/>
  </svg>
);

const ClockIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const MoonIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6.364 6.364 0 0 0 9 9 9 0 1 1-9-9Z"/>
  </svg>
);

const SunIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);

const ThumbsUpIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10v12"/>
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3.17"/>
    <path d="M15 5.88V3a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v7"/>
  </svg>
);

const ThumbsDownIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 14V2"/>
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.17"/>
    <path d="M9 18.12V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-7"/>
  </svg>
);

// Function to generate a simple device fingerprint
const getDeviceFingerprint = () => {
  // Create a simple fingerprint based on browser and screen properties
  const screenProps = `${window.screen.height}x${window.screen.width}x${window.screen.colorDepth}`;
  const browserProps = navigator.userAgent;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Combine properties and create a hash
  const fingerprint = `${screenProps}-${timeZone}-${browserProps}`;
  
  // Convert to a simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString(16); // Convert to hex string
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

// Add this before your App component
class TimeAdjustmentManager {
  constructor() {
    this.adjustments = JSON.parse(localStorage.getItem('timeAdjustments') || '{}');
    this.feedbackCount = JSON.parse(localStorage.getItem('feedbackCount') || '{}');
  }

  addFeedback(trainTime, direction, wasOnTime, actualTime) {
    const key = `${direction}-${trainTime}`;
    
    if (!this.feedbackCount[key]) {
      this.feedbackCount[key] = { count: 0, totalDiff: 0 };
    }

    if (!wasOnTime && actualTime) {
      const [actualHours, actualMinutes] = actualTime.split(':').map(Number);
      const [scheduledHours, scheduledMinutes] = trainTime.split(':').map(Number);
      const timeDiff = (actualHours * 60 + actualMinutes) - (scheduledHours * 60 + scheduledMinutes);
      
      this.feedbackCount[key].count++;
      this.feedbackCount[key].totalDiff += timeDiff;

      // If we have 3 or more feedbacks, calculate average adjustment
      if (this.feedbackCount[key].count >= 3) {
        const avgDiff = Math.round(this.feedbackCount[key].totalDiff / this.feedbackCount[key].count);
        this.adjustments[key] = avgDiff;
      }
    }

    this.save();
  }

  getAdjustedTime(time, direction) {
    const key = `${direction}-${time}`;
    const adjustment = this.adjustments[key] || 0;
    
    if (adjustment === 0) return time;

    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + adjustment;
    const adjustedHours = Math.floor(totalMinutes / 60) % 24;
    const adjustedMinutes = totalMinutes % 60;
    
    return `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMinutes).padStart(2, '0')}`;
  }

  save() {
    localStorage.setItem('timeAdjustments', JSON.stringify(this.adjustments));
    localStorage.setItem('feedbackCount', JSON.stringify(this.feedbackCount));
  }
}

// Main App Component
const App = () => {
  // Define constants for subway configuration
  const CIRCUIT_TIME = 24; // Complete circuit takes 24 minutes
  
  // Station information with travel times from reference stations
  // Time values are in minutes relative to the starting reference stations
  const stations = [
    { id: 'govan', name: 'Govan', innerRef: 0, outerRef: 12 },
    { id: 'partick', name: 'Partick', innerRef: 3, outerRef: 9 },
    { id: 'kelvinhall', name: 'Kelvinhall', innerRef: 5, outerRef: 7 },
    { id: 'hillhead', name: 'Hillhead', innerRef: 7, outerRef: 5 },
    { id: 'kelvinbridge', name: 'Kelvinbridge', innerRef: 9, outerRef: 3 },
    { id: 'stgeorges', name: 'St. George\'s Cross', innerRef: 10, outerRef: 2 },
    { id: 'cowcaddens', name: 'Cowcaddens', innerRef: 11, outerRef: 1 },
    // Based on your journey data: 4 minutes from St. Enoch to Buchanan St
    { id: 'buchananst', name: 'Buchanan Street', innerRef: 14, outerRef: 22 },
    { id: 'stEnoch', name: 'St Enoch', innerRef: 10, outerRef: 18 },
    // Based on your journey data: 1 minute from Bridge St to St. Enoch
    { id: 'bridge', name: 'Bridge Street', innerRef: 9, outerRef: 17 },
    // Based on your journey data: 1 minute from West St to Bridge St
    { id: 'westst', name: 'West Street', innerRef: 8, outerRef: 16 },
    // Based on your journey data: 2 minutes from Shields Rd to West St
    { id: 'shields', name: 'Shields Road', innerRef: 6, outerRef: 14 },
    // Based on your journey data: 2 minutes from Kinning Park to Shields Rd
    { id: 'kinning', name: 'Kinning Park', innerRef: 4, outerRef: 12 },
    // Based on your journey data: 1 minute from Cessnock to Kinning Park
    { id: 'cessnock', name: 'Cessnock', innerRef: 3, outerRef: 11 },
    { id: 'ibrox', name: 'Ibrox', innerRef: 1, outerRef: 10 }
  ];
  
  // Service hours in minutes from midnight
  const serviceHours = {
    weekday: {
      start: 390, // 06:30
      end: 1420,  // 23:40
      firstInner: { govan: 390 }, // 06:30 from Govan
      firstOuter: { stEnoch: 392 }, // 06:32 from St Enoch
      lastInner: { govan: 1396 }, // 23:16 from Govan
      lastOuter: { stEnoch: 1410 }  // 23:30 from St Enoch
    },
    weekend: {
      start: 600, // 10:00
      end: 1092,  // 18:12
      firstInner: { govan: 600 }, // 10:00 from Govan
      firstOuter: { stEnoch: 603 }, // 10:03 from St Enoch
      lastInner: { govan: 1070 }, // 17:50 from Govan
      lastOuter: { stEnoch: 1080 }  // 18:00 from St Enoch
    }
  };

  // App state
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [trainsByDirection, setTrainsByDirection] = React.useState({ inner: [], outer: [] });
  const [selectedStation, setSelectedStation] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedStation');
      return saved || 'buchananst';
    }
    return 'buchananst';
  });
  const [selectedDirection, setSelectedDirection] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedDirection');
      return saved || 'both'; // 'both', 'inner', or 'outer'
    }
    return 'both';
  });
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [trainFeedback, setTrainFeedback] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trainFeedback');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [showModal, setShowModal] = React.useState(false);
  const [feedbackTrain, setFeedbackTrain] = React.useState(null);
  const [actualArrivalTime, setActualArrivalTime] = React.useState('');

  // Add a state variable to control the loading spinner
  const [isLoading, setIsLoading] = React.useState(true);

  // Simulate app initialization
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000); // Simulate a -second loading time

    return () => clearTimeout(timer);
  }, []);

  // Save preferences and feedback data
  React.useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  React.useEffect(() => {
    localStorage.setItem('selectedStation', selectedStation);
  }, [selectedStation]);
  
  React.useEffect(() => {
    localStorage.setItem('selectedDirection', selectedDirection);
  }, [selectedDirection]);
  
  React.useEffect(() => {
    localStorage.setItem('trainFeedback', JSON.stringify(trainFeedback));
  }, [trainFeedback]);

  // Find a station by its ID
  const findStation = (stationId) => {
    return stations.find(s => s.id === stationId) || stations[0];
  };
  
  // Check if service is running based on time of day
  const isServiceRunning = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentMinutes = hour * 60 + minute;
    const isWeekend = now.getDay() === 0;
    
    const { start, end } = isWeekend ? serviceHours.weekend : serviceHours.weekday;
    
    return currentMinutes >= start && currentMinutes <= end;
  };

  // Calculate train schedules
  const calculateTrains = () => {
    if (!isServiceRunning()) {
      setTrainsByDirection({ inner: [], outer: [] });
      return;
    }

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    const currentTimeInMinutes = hour * 60 + minute + (second / 60);
    const isWeekend = now.getDay() === 0;
    
    // Get service hours for current day
    const service = isWeekend ? serviceHours.weekend : serviceHours.weekday;
    
    // Determine frequency (peak or off-peak)
    const morningPeak = (currentTimeInMinutes >= 450 && currentTimeInMinutes <= 570); // 7:30-9:30
    const eveningPeak = (currentTimeInMinutes >= 990 && currentTimeInMinutes <= 1110); // 16:30-18:30
    const isPeakTime = !isWeekend && (morningPeak || eveningPeak);
    const frequency = isPeakTime ? 4 : 7; // 4 minutes during peak, average 7 minutes off-peak
    
    // Generate trains for both directions
    const innerTrains = generateInnerCircleTrains(currentTimeInMinutes, frequency, service);
    const outerTrains = generateOuterCircleTrains(currentTimeInMinutes, frequency, service);
    
    // Sort and store trains
    setTrainsByDirection({
      inner: innerTrains,
      outer: outerTrains
    });
  };
  
  // Generate Inner Circle (clockwise) trains
  const generateInnerCircleTrains = (currentTimeInMinutes, frequency, service) => {
    const selectedStationInfo = findStation(selectedStation);
    const trains = [];
    
    // First, generate a set of evenly spaced trains based on frequency
    // Start from the first train of the day and go forward in time
    const startTime = service.firstInner.govan;
    const endTime = service.lastInner.govan + 24; // Add enough time to complete the circuit
    
    // Time it takes for a train to reach the selected station from Govan (reference)
    const timeToSelectedStation = selectedStationInfo.innerRef;
    
    // Generate trains for the full service day
    for (let trainTime = startTime; trainTime <= endTime; trainTime += frequency) {
      // Time when this train reaches the selected station
      const arrivalTime = trainTime + timeToSelectedStation;
      
      // Only include trains that haven't arrived yet and are within the service hours
      const minutesUntil = Math.round(arrivalTime - currentTimeInMinutes);
      
      if (minutesUntil > 0 && arrivalTime <= service.end + CIRCUIT_TIME) {
        // Convert to hours and minutes for display
        const arrivalHour = Math.floor(arrivalTime / 60) % 24;
        const arrivalMinute = Math.floor(arrivalTime % 60);
        const timeStr = timeManager.getAdjustedTime(
          `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMinute).padStart(2, '0')}`,
          'Inner Circle'
        );
        
        // Generate unique ID for this train
        const trainId = `inner-${selectedStation}-${timeStr}-${currentTime.toDateString()}`;
        
        trains.push({
          id: trainId,
          time: timeStr,
          direction: 'Inner Circle',
          minutesUntil: minutesUntil,
          hasFeedback: !!trainFeedback[trainId]
        });
      }
    }
    
    // Sort by arrival time and take the next 3
    trains.sort((a, b) => a.minutesUntil - b.minutesUntil);
    return trains.slice(0, 3);
  };
  
  // Generate Outer Circle (counter-clockwise) trains
  const generateOuterCircleTrains = (currentTimeInMinutes, frequency, service) => {
    const selectedStationInfo = findStation(selectedStation);
    const trains = [];
    
    // Start from the first train of the day and go forward in time
    const startTime = service.firstOuter.stEnoch;
    const endTime = service.lastOuter.stEnoch + 24; // Add enough time to complete the circuit
    
    // Time it takes for a train to reach the selected station from St Enoch (reference)
    const timeToSelectedStation = selectedStationInfo.outerRef;
    
    // Generate trains for the full service day
    for (let trainTime = startTime; trainTime <= endTime; trainTime += frequency) {
      // Time when this train reaches the selected station
      const arrivalTime = trainTime + timeToSelectedStation;
      
      // Only include trains that haven't arrived yet and are within the service hours
      const minutesUntil = Math.round(arrivalTime - currentTimeInMinutes);
      
      if (minutesUntil > 0 && arrivalTime <= service.end + CIRCUIT_TIME) {
        // Convert to hours and minutes for display
        const arrivalHour = Math.floor(arrivalTime / 60) % 24;
        const arrivalMinute = Math.floor(arrivalTime % 60);
        const timeStr = timeManager.getAdjustedTime(
          `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMinute).padStart(2, '0')}`,
          'Outer Circle'
        );
        
        // Generate unique ID for this train
        const trainId = `outer-${selectedStation}-${timeStr}-${currentTime.toDateString()}`;
        
        trains.push({
          id: trainId,
          time: timeStr,
          direction: 'Outer Circle',
          minutesUntil: minutesUntil,
          hasFeedback: !!trainFeedback[trainId]
        });
      }
    }
    
    // Sort by arrival time and take the next 3
    trains.sort((a, b) => a.minutesUntil - b.minutesUntil);
    return trains.slice(0, 3);
  };

  // Adjust train times based on feedback
  const adjustTrainTimes = (feedback) => {
    const adjustedTrains = { inner: [], outer: [] };

    // Adjust inner circle trains
    trainsByDirection.inner.forEach(train => {
      const feedbackForTrain = feedback[train.id];
      if (feedbackForTrain && !feedbackForTrain.wasOnTime) {
        const actualTime = feedbackForTrain.actualTime.split(':').map(Number);
        const actualTotalMinutes = actualTime[0] * 60 + actualTime[1];
        const scheduledTime = train.time.split(':').map(Number);
        const scheduledTotalMinutes = scheduledTime[0] * 60 + scheduledTime[1];
        const timeDifference = actualTotalMinutes - scheduledTotalMinutes;

        // Adjust times for all subsequent stations
        stations.forEach(station => {
          const adjustedTime = (scheduledTotalMinutes + station.innerRef + timeDifference) % (24 * 60);
          const adjustedHour = Math.floor(adjustedTime / 60);
          const adjustedMinute = adjustedTime % 60;
          const adjustedTimeStr = `${String(adjustedHour).padStart(2, '0')}:${String(adjustedMinute).padStart(2, '0')}`;
          adjustedTrains.inner.push({
            ...train,
            time: adjustedTimeStr,
            station: station.id
          });
        });
      } else {
        adjustedTrains.inner.push(train);
      }
    });

    // Adjust outer circle trains
    trainsByDirection.outer.forEach(train => {
      const feedbackForTrain = feedback[train.id];
      if (feedbackForTrain && !feedbackForTrain.wasOnTime) {
        const actualTime = feedbackForTrain.actualTime.split(':').map(Number);
        const actualTotalMinutes = actualTime[0] * 60 + actualTime[1];
        const scheduledTime = train.time.split(':').map(Number);
        const scheduledTotalMinutes = scheduledTime[0] * 60 + scheduledTime[1];
        const timeDifference = actualTotalMinutes - scheduledTotalMinutes;

        // Adjust times for all subsequent stations
        stations.forEach(station => {
          const adjustedTime = (scheduledTotalMinutes + station.outerRef + timeDifference) % (24 * 60);
          const adjustedHour = Math.floor(adjustedTime / 60);
          const adjustedMinute = adjustedTime % 60;
          const adjustedTimeStr = `${String(adjustedHour).padStart(2, '0')}:${String(adjustedMinute).padStart(2, '0')}`;
          adjustedTrains.outer.push({
            ...train,
            time: adjustedTimeStr,
            station: station.id
          });
        });
      } else {
        adjustedTrains.outer.push(train);
      }
    });

    setTrainsByDirection(adjustedTrains);
  };

  // Get trains for current view based on selected direction
  const getTrainsForCurrentView = () => {
    if (selectedDirection === 'inner') {
      return trainsByDirection.inner;
    } else if (selectedDirection === 'outer') {
      return trainsByDirection.outer;
    } else {
      // For 'both', interleave the trains from both directions and sort by arrival time
      const combinedTrains = [...trainsByDirection.inner, ...trainsByDirection.outer];
      combinedTrains.sort((a, b) => a.minutesUntil - b.minutesUntil);
      return combinedTrains.slice(0, 3); // Limit to 3 trains total
    }
  };
  
  // Add this after your existing state declarations
  const timeManager = React.useMemo(() => new TimeAdjustmentManager(), []);

  // Update your handleTrainFeedback function
  const handleTrainFeedback = (train, wasOnTime) => {
    if (wasOnTime) {
      setTrainFeedback(prev => ({
        ...prev,
        [train.id]: {
          wasOnTime: true,
          timestamp: new Date().toISOString()
        }
      }));
      timeManager.addFeedback(train.time, train.direction, true);
    } else {
      setFeedbackTrain(train);
      setActualArrivalTime('');
      setShowModal(true);
    }
  };

  // Update your submitActualTime function
  const submitActualTime = () => {
    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(actualArrivalTime)) {
      alert('Please enter a valid time in 24-hour format (HH:MM)');
      return;
    }
    
    // Extract hours and minutes from input
    const [inputHours, inputMinutes] = actualArrivalTime.split(':').map(Number);
    
    // Basic validation of hours and minutes
    if (inputHours < 0 || inputHours > 23 || inputMinutes < 0 || inputMinutes > 59) {
      alert('Please enter a valid time (hours: 0-23, minutes: 0-59)');
      return;
    }
    
    // Extract scheduled time for comparison
    const [scheduledHours, scheduledMinutes] = feedbackTrain.time.split(':').map(Number);
    
    // Convert both times to minutes for easy comparison
    const scheduledTotalMinutes = scheduledHours * 60 + scheduledMinutes;
    const actualTotalMinutes = inputHours * 60 + inputMinutes;
    
    // Check if the actual time is too far from the scheduled time (more than 30 minutes)
    const timeDifference = Math.abs(actualTotalMinutes - scheduledTotalMinutes);
    if (timeDifference > 30) {
      if (!confirm('The time you entered is more than 30 minutes from the scheduled time. Are you sure this is correct?')) {
        return;
      }
    }
    
    // Remove the future time check to allow future times
    
    // Save the feedback with actual arrival time
    setTrainFeedback({
      ...trainFeedback,
      [feedbackTrain.id]: {
        wasOnTime: false,
        actualTime: actualArrivalTime,
        timestamp: new Date().toISOString()
      }
    });

    timeManager.addFeedback(
      feedbackTrain.time,
      feedbackTrain.direction,
      false,
      actualArrivalTime
    );

    setShowModal(false);
    setFeedbackTrain(null);
  };

  // Clock and train schedule updates
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(timer);
  }, []);
  
  React.useEffect(() => {
    calculateTrains();
  }, [currentTime, selectedStation]);

  // Call adjustTrainTimes whenever feedback is updated
  React.useEffect(() => {
    adjustTrainTimes(trainFeedback);
  }, [trainFeedback]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`container ${darkMode ? 'dark' : 'light'}`}>
      <div className={`card ${darkMode ? 'dark' : 'light'}`}>
        <div className="card-header">
          <div className="header-content">
            <div className="station-info">
              <TrainIcon size={32} />
              <div className="station-text">
                <h2>{findStation(selectedStation).name} Station</h2>
                <p>Glasgow Subway</p>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="toggle-button"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <SunIcon size={24} /> : <MoonIcon size={24} />}
            </button>
          </div>
        </div>

        <div className={`card-content ${darkMode ? 'dark' : 'light'}`}>
          <div className={`time-display ${darkMode ? 'dark' : 'light'}`}>
            <ClockIcon size={20} />
            <span className="time-text">
              {currentTime.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}
            </span>
          </div>
          
          {/* Station selector */}
          <select 
            value={selectedStation} 
            onChange={(e) => setSelectedStation(e.target.value)}
            className={darkMode ? 'dark' : 'light'}
          >
            <option value="" disabled>Select your station</option>
            {stations.map(station => (
              <option key={station.id} value={station.id}>
                {station.name} Station
              </option>
            ))}
          </select>
          
          {/* Direction selector */}
          <div className="direction-selector">
            <label className="direction-label">Direction:</label>
            <div className="direction-options">
              <label className={`direction-option ${selectedDirection === 'both' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="direction" 
                  value="both" 
                  checked={selectedDirection === 'both'} 
                  onChange={() => setSelectedDirection('both')}
                />
                <span>Both</span>
              </label>
              <label className={`direction-option ${selectedDirection === 'inner' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="direction" 
                  value="inner" 
                  checked={selectedDirection === 'inner'} 
                  onChange={() => setSelectedDirection('inner')}
                />
                <span>Inner Circle</span>
              </label>
              <label className={`direction-option ${selectedDirection === 'outer' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="direction" 
                  value="outer" 
                  checked={selectedDirection === 'outer'} 
                  onChange={() => setSelectedDirection('outer')}
                />
                <span>Outer Circle</span>
              </label>
            </div>
          </div>

          {isServiceRunning() ? (
            <div>
              <h3 className={`train-title ${darkMode ? 'dark' : 'light'}`}>
                Next Trains:
              </h3>
              <div className="trains-container">
                {getTrainsForCurrentView().length > 0 ? (
                  getTrainsForCurrentView().map(train => (
                    <div
                      key={train.id}
                      className={`train-card ${train.direction === 'Inner Circle' ? 'inner' : `outer ${darkMode ? 'dark' : 'light'}`}`}
                    >
                      <div className="train-info">
                        <div className="train-time">
                          <TrainIcon size={20} />
                          <span className="train-time-text">{train.time}</span>
                          <span className="arriving-soon">
                            {train.minutesUntil <= 1 ? 'Arriving now' : `in ${train.minutesUntil} min`}
                          </span>
                        </div>
                        <span className="direction-badge">
                          {train.direction}
                        </span>
                      </div>
                      
                      {/* Feedback buttons */}
                      {train.hasFeedback ? (
                        <div className="feedback-status">
                          ✓ Thanks for your feedback
                        </div>
                      ) : (
                        <div className="train-feedback">
                          <div className="feedback-wrapper">
                            <button 
                              className="feedback-btn"
                              onClick={() => handleTrainFeedback(train, true)}
                              aria-label="Train arrived on time"
                            >
                              <ThumbsUpIcon size={18} />
                            </button>
                            <span className="feedback-label">On time</span>
                          </div>
                          <div className="feedback-wrapper">
                            <button 
                              className="feedback-btn"
                              onClick={() => handleTrainFeedback(train, false)}
                              aria-label="Train did not arrive on time"
                            >
                              <ThumbsDownIcon size={18} />
                            </button>
                            <span className="feedback-label">Not on time</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    No trains available in this direction.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`no-service ${darkMode ? 'dark' : 'light'}`}>
              <h3 className={`no-service-title ${darkMode ? 'dark' : 'light'}`}>
                No Service Currently Running
              </h3>
              <div className={`service-hours ${darkMode ? 'dark' : 'light'}`}>
                <p className="hours-title">Service Hours:</p>
                <div className="hours-list">
                  <p>Monday to Saturday: 06:30 - 23:40</p>
                  <p>Sunday: 10:00 - 18:12</p>
                </div>
              </div>
            </div>
          )}

          <div className={`footer-note ${darkMode ? 'dark' : 'light'}`}>
            Times are approximate. Service frequency: 4 mins (peak) / 6-8 mins (off-peak)
          </div>
        </div>
      </div>
      
      {/* Time Input Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className={`modal-content ${darkMode ? 'dark' : 'light'}`}>
            <h3 className="modal-title">Actual Arrival Time</h3>
            
            <div className="time-input-group">
              <label htmlFor="actualTime" className="input-label">
                When did the {feedbackTrain?.direction} train actually arrive?
              </label>
              <input
                id="actualTime"
                type="text"
                className={`time-input ${darkMode ? 'dark' : 'light'}`}
                placeholder="HH:MM (24hr)"
                value={actualArrivalTime}
                onChange={(e) => setActualArrivalTime(e.target.value)}
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className={`modal-btn cancel ${darkMode ? 'dark' : 'light'}`}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-btn submit"
                onClick={submitActualTime}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create root and render app
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);