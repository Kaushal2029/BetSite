import React, { useState, useEffect, useRef } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import "../assets/Aviator/Aviator.css";
import aeroplane from "../assets/image/WhatsApp_Image_2024-09-13_at_17.35.42_cca93ab3-removebg-preview.png";
import TenDolar from "../assets/image/10-dollar-chip-EMEP03-removebg-preview.png";
import TwentyDolar from "../assets/image/Screenshot_2024-09-13_164625-removebg-preview.png";
import ThirtyDolar from "../assets/image/Screenshot_2024-09-13_164637-removebg-preview.png";
import FortyDolar from "../assets/image/Screenshot_2024-09-13_164659-removebg-preview.png";

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Aviator = () => {
  const [balance, setBalance] = useState(100.0);
  const [betAmount, setBetAmount] = useState(10.0);
  const [multiplier, setMultiplier] = useState(0);
  const [bets, setBets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [dataPoints, setDataPoints] = useState([]);
  const [showFinalMultiplier, setShowFinalMultiplier] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const chartRef = useRef(null); // For referencing the chart for manual updates
  const [currentMultiplier, setCurrentMultiplier] = useState(0); // For plane movement
  const [maxMultiplier, setMaxMultiplier] = useState(0); // Keep track of max multiplier
  const [maxTime, setMaxTime] = useState(0); // Keep track of max time for X-axis

  // Generates a random multiplier
  const generateMultiplier = (min = 1.01) => {
    const max = parseFloat((Math.random() * (100 - min) + min).toFixed(2)); // Random max between min and 100
    setMaxMultiplier(max); // Set max multiplier for Y-axis scaling
    return parseFloat((Math.random() * (max - min) + min).toFixed(2)); // Generate random multiplier between min and max
  };

  const placeBet = () => {
    if (betAmount > 0 && betAmount <= balance) {
      setBalance((prevBalance) => prevBalance - betAmount);
      setIsLoading(true);
      setMultiplier(0);
      setHasCashedOut(false);
      setDataPoints([]);
      setShowFinalMultiplier(false);

      const newMultiplier = generateMultiplier();
      const increment = newMultiplier / 200; // Adjust increments
      let currentTime = 0;
      const totalTime = 4000; // Max time for the X-axis
      setMaxTime(totalTime); // Set max time for X-axis scaling

      // Delay chart update to let the plane move first
      const initialPlaneMoveTime = 500; // Time in ms to move the plane initially
      setTimeout(() => {
        const loadingInterval = setInterval(() => {
          setMultiplier((prev) => {
            const nextMultiplier = prev + increment;
            currentTime += 10;

            // Update chart's data points and re-render
            setDataPoints((prevData) => [
              ...prevData,
              { x: currentTime, y: nextMultiplier },
            ]);

            if (chartRef.current) {
              chartRef.current.render(); // Manually re-render the chart for smooth animation
            }

            setCurrentMultiplier(nextMultiplier); // Update plane position

            if (nextMultiplier >= newMultiplier) {
              clearInterval(loadingInterval);
              setMultiplier(newMultiplier);
              setIsLoading(false);
              setShowFinalMultiplier(true);

              setIsResetting(true);

              setTimeout(() => {
                setShowFinalMultiplier(false);

                setDataPoints([]); // Reset data points after showing final multiplier
                setIsResetting(false); // End resetting
              }, 2000);
            }
            return nextMultiplier;
          });
        }, 10);
      }, initialPlaneMoveTime);
    } else {
      alert("Insufficient balance or invalid bet amount!");
    }
  };

  const cashOut = () => {
    if (!hasCashedOut && multiplier > 0) {
      const winnings = betAmount * multiplier;
      setBalance((prevBalance) => prevBalance + winnings);
      setBets((prevBets) => [
        ...prevBets,
        { user: "User", amount: betAmount, multiplier, winnings },
      ]);
      setHasCashedOut(true);
    }
  };

  useEffect(() => {
    // Fetch user balance and bet history from a backend API here
  }, []);

  // Chart options with dynamic X and Y axis limits
  const chartOptions = {
    theme: "light2",
    title: {
      text: "Multiplier Chart",
    },
    axisX: {
      title: "Time (ms)",
      maximum: maxTime, // Dynamically set the maximum value for the X-axis
    },
    axisY: {
      title: "Multiplier (x)",
      includeZero: false,
      minimum: 0,
      maximum: maxMultiplier, // Dynamically set the maximum value for the Y-axis
    },
    data: [
      {
        type: "line",
        xValueFormatString: "#,##0 ms",
        yValueFormatString: "0.00x",
        dataPoints: dataPoints,
        animationEnabled: true, // Enable chart animation
        // Specify consistent animation type
        animationDuration: 1200, // Duration in milliseconds
        animationType: "line" // Consistent animation type
      },
    ],
  };

  // Calculate plane position dynamically
  const planeStyle = {
    left: dataPoints.length
      ? `${(dataPoints[dataPoints.length - 1].x / maxTime) * 100}%`
      : "0%",
    bottom: dataPoints.length
      ? `${(dataPoints[dataPoints.length - 1].y / maxMultiplier) * 100}%`
      : "0%",
    transform: "translate(-50%, 50%)", // Center the plane on the point
  };

  const images = [TenDolar, TwentyDolar, ThirtyDolar, FortyDolar];

  return (
    <div className="app">
      <header className="app-header">
        <div className="balance">
          <span className="balance-label">Balance:</span>
          <span className="balance-amount">{balance.toFixed(2)} USD</span>
        </div>
        <h1 className="app-title">Aviator</h1>
        <span className="how-to-play">How to play?</span>
      </header>
      <main className="app-main">
        <div className="game-area">
          <div className="chart-container" style={{ position: "relative" }}>
            {!isLoading && multiplier > 0 && !hasCashedOut && isResetting && (
              <div className="plane-flew-away">Plane has flown away!</div>
            )}
            <CanvasJSChart options={chartOptions} ref={chartRef} />
            {/* Plane Animation */}
            <img
              src={aeroplane}
              alt="Plane"
              className="plane"
              style={planeStyle}
            />
          </div>

          <div className="multiplier">
            {isLoading ? (
              <div className="loading">{multiplier.toFixed(2)}x</div>
            ) : (
              <h1>
                {hasCashedOut
                  ? multiplier.toFixed(2) + "x"
                  : multiplier > 0
                  ? multiplier.toFixed(2) + "x"
                  : ""}
              </h1>
            )}
          </div>
        </div>
        <div className="bet-area">
          <div className="bets-history">
            <h2>Bet History</h2>
            <ul>
              {bets.map((bet, index) => (
                <li key={index}>
                  <span className="user">{bet.user}</span>
                  <span className="amount">{bet.amount} USD</span>
                  <span className="multiplier">
                    {bet.multiplier.toFixed(2)}x
                  </span>
                  <span className="winnings">
                    {bet.winnings.toFixed(2)} USD
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bet-controls">
            <div className="bet-input">
              <label htmlFor="bet-amount">Bet Amount:</label>
              <input
                type="text"
                id="bet-amount"
                value={betAmount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setBetAmount(isNaN(value) ? 0 : value);
                }}
              />
            </div>
            <div className="preset-buttons">
              {[10, 20, 50, 100].map((amount, index) => (
                <img
                  key={amount}
                  src={images[index]} // Use the corresponding image for each amount
                  alt={`Bet ${amount}`}
                  onClick={() => setBetAmount((prev) => prev + amount)}
                  style={{ cursor: "pointer" }} // Makes the image act like a clickable button
                />
              ))}
            </div>
            <button
              onClick={isLoading ? cashOut : placeBet}
              disabled={
                isLoading ? multiplier <= 0 || hasCashedOut : isResetting
              }
            >
              {isLoading ? "Cash out" : "Place Bet"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Aviator;
