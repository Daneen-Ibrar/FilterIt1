import React, { useState, useRef } from 'react';
import '../App.css';
import Slider from './Slider';
import SidebarItem from './SidebarItem';

const DEFAULT_OPTIONS = [
  {
    name: 'Brightness',
    property: 'brightness',
    value: 100,
    range: {
      min: 0,
      max: 200
    },
    unit: '%'
  },
  {
    name: 'Contrast',
    property: 'contrast',
    value: 100,
    range: {
      min: 0,
      max: 200
    },
    unit: '%'
  },
  {
    name: 'Saturation',
    property: 'saturate',
    value: 100,
    range: {
      min: 0,
      max: 200
    },
    unit: '%'
  },
  {
    name: 'Grayscale',
    property: 'grayscale',
    value: 0,
    range: {
      min: 0,
      max: 100
    },
    unit: '%'
  },
  {
    name: 'Sepia',
    property: 'sepia',
    value: 0,
    range: {
      min: 0,
      max: 100
    },
    unit: '%'
  },
  {
    name: 'Hue Rotate',
    property: 'hue-rotate',
    value: 0,
    range: {
      min: 0,
      max: 360
    },
    unit: 'deg'
  },
  {
    name: 'Blur',
    property: 'blur',
    value: 0,
    range: {
      min: 0,
      max: 20
    },
    unit: 'px'
  }
];

function App() {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [imageUrl, setImageUrl] = useState('');
  const [quality, setQuality] = useState(1);
  const canvasRef = useRef(null);

  function handleSliderChange({ target }) {
    if (selectedOptionIndex === -1) {
      setQuality(parseFloat(target.value));
    } else {
      setOptions(prevOptions => {
        return prevOptions.map((option, index) => {
          if (index !== selectedOptionIndex) return option;
          return { ...option, value: target.value };
        });
      });
    }
  }

  function handleQualityToggle() {
    setQuality(prevQuality => (prevQuality === 1 ? 0.1 : 1));
  }

  function getImageStyle() {
    const selectedOption = options[selectedOptionIndex];

    if (!selectedOption) {
      return {
        backgroundImage: `url(${imageUrl})`,
        quality: quality
      };
    }

    const filters = options.map(option => {
      return `${option.property}(${option.value}${option.unit})`;
    });

    return {
      filter: filters.join(' '),
      backgroundImage: `url(${imageUrl})`,
      quality: quality
    };
  }

  async function handleSaveImage() {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();

    image.crossOrigin = 'Anonymous';

    image.onload = function () {
      canvas.width = image.width;
      canvas.height = image.height;

      context.filter = getImageStyle().filter;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const dataURL = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'filtered_and_perfected.png';
      link.click();
    };

    try {
      const response = await fetch(`/proxy?url=${encodeURIComponent(imageUrl)}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      image.src = url;
    } catch (error) {
      console.error(error);
      alert('Error occurred while fetching the image.');
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="main-image" style={getImageStyle()} />
        <div className="sidebar">
          {options.map((option, index) => (
            <SidebarItem
              key={index}
              name={option.name}
              active={index === selectedOptionIndex}
              handleClick={() => setSelectedOptionIndex(index)}
            />
          ))}
          <SidebarItem
            name={`Quality: ${quality === 1 ? 'High' : 'Low'}`}
            active={false}
            handleClick={handleQualityToggle}
          />
        </div>
        <div className="slider-container">
          {selectedOptionIndex === -1 && (
            <Slider
              min={0.1}
              max={1}
              step={0.1}
              value={quality}
              handleChange={handleSliderChange}
            />
          )}
          {selectedOptionIndex !== -1 && (
            <Slider
              min={options[selectedOptionIndex].range.min}
              max={options[selectedOptionIndex].range.max}
              value={options[selectedOptionIndex].value}
              handleChange={handleSliderChange}
            />
          )}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="Enter image url..."
          />
          <button onClick={handleSaveImage}>Save</button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;
