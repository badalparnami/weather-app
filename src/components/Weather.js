import React, { useEffect, useState } from "react";
import axios from "axios";

import LoadingIndicator from "../UI/LoadingIndicator";
import ErrorModal from "../UI/ErrorModal";

import "./Weather.css";

const getDay = (day) => {
  switch (day) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    default:
      return "Error Occured";
  }
};

const convertTicks = (ticks) => {
  const utcdate = new Date(ticks * 1000);
  const hours = utcdate.getHours();
  const minutes = (utcdate.getMinutes() < 10 ? "0" : "") + utcdate.getMinutes();
  const day = getDay(utcdate.getDay());

  return `${day}, ${hours}:${minutes}`;
};

const Weather = () => {
  const [data, setData] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(null);
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/weather/get`)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  const onSubmitHandler = (event) => {
    event.preventDefault();

    if (data.weather) {
      if (data.weather.name.toLowerCase() === city.toLowerCase()) {
        return;
      }
    }

    if (city.trim() === "") {
      setError(<span>Invalid Input</span>);
      return;
    }

    setLoading(true);
    setData("");

    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/weather/input/${city}`)
      .then((response) => {
        setLoading(false);
        setData(response.data);
        setCity("");
      })
      .catch((err) => {
        setLoading(false);
        if (err.response) {
          if (err.response.status === 400) {
            setError(null);
          } else {
            setError(err.response.data.message);
          }
        } else if (err.request) {
          setError("Slow Network Speed. Try Again later.");
        } else {
          setError("Oops!! Unusual error occurred");
        }
      });
  };

  const onChangeHandler = (e) => {
    setError("");
    setCity(e.target.value);
  };

  const clear = () => {
    setError(null);
  };

  let value = "";

  if (data.ip) {
    const { ip } = data;

    value = <h1>{`${ip.city}, ${ip.regionName} ${ip.zip}`}</h1>;
  } else if (data.weather) {
    const { weather } = data;

    value = (
      <h1>
        {weather.name}, {weather.sys.country}
      </h1>
    );
  }

  return (
    <div className="weather">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      {loading && <LoadingIndicator />}
      {!loading && (
        <form className="weather-form" onSubmit={onSubmitHandler}>
          <input
            type="text"
            value={city}
            onChange={onChangeHandler}
            placeholder="Enter City"
          />
          <button>Submit</button>
        </form>
      )}
      {data && !loading && (
        <div className="weather-details">
          <p className="date">@{convertTicks(data.weather.dt)}</p>
          {value}
          <p className="weather-temp">
            {data.weather.main.temp}
            <span>°c</span>
          </p>
          <div className="weather-desc">
            <p>{data.weather.weather[0].description}</p>
            <img
              src={`https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${data.weather.weather[0].icon}.svg`}
              alt={data.weather.weather.description}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
