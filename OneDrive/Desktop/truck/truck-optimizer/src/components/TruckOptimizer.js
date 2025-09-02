import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import './TruckOptimizer.css';

const TruckOptimizer = () => {
  const [trucks, setTrucks] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [results, setResults] = useState(null);
  const [addonTrucks, setAddonTrucks] = useState([]);

  // Unit selection state
  const [truckUnits, setTruckUnits] = useState('feet');
  const [boxUnits, setBoxUnits] = useState('inches');

  // Addon truck form state
  const [addonForm, setAddonForm] = useState({
    name: '',
    length: '',
    width: '',
    height: '',
    cost: '',
    numberOfTrucks: ''
  });

  // Predefined truck types - Indian Commercial Vehicles
  const predefinedTrucks = [
    {
      name: 'Tata Ace',
      length: 7,
      width: 4.5,
      height: 5,
      cost: 8500,
      icon: '🚐'
    },
    {
      name: 'Mahindra Jeeto',
      length: 6.5,
      width: 4.25,
      height: 5,
      cost: 7800,
      icon: '🚐'
    },
    {
      name: 'Mahindra Supro Maxitruck',
      length: 7.5,
      width: 4.5,
      height: 5.5,
      cost: 9200,
      icon: '🚐'
    },
    {
      name: 'Ashok Leyland Dost',
      length: 8,
      width: 5,
      height: 5.5,
      cost: 10500,
      icon: '🚐'
    },
    {
      name: 'Mahindra Bolero Pickup',
      length: 8.5,
      width: 5.5,
      height: 5.5,
      cost: 12000,
      icon: '🛻'
    },
    {
      name: 'Tata Intra V30',
      length: 9,
      width: 5.3,
      height: 6,
      cost: 13500,
      icon: '🚚'
    },
    {
      name: 'Tata 407',
      length: 10,
      width: 6,
      height: 6.5,
      cost: 15500,
      icon: '🚚'
    },
    {
      name: 'Force Kargo King',
      length: 9.5,
      width: 5.5,
      height: 6,
      cost: 14800,
      icon: '🚚'
    },
    {
      name: 'Eicher Pro 1049',
      length: 14,
      width: 6,
      height: 6.5,
      cost: 22000,
      icon: '🚛'
    },
    {
      name: 'Mahindra Furio 7',
      length: 14,
      width: 6.2,
      height: 7,
      cost: 23500,
      icon: '🚛'
    },
    {
      name: 'Tata 709',
      length: 17,
      width: 7,
      height: 7,
      cost: 28000,
      icon: '🚛'
    },
    {
      name: 'Eicher 1112',
      length: 19,
      width: 7,
      height: 7,
      cost: 32000,
      icon: '🚛'
    },
    {
      name: 'BharatBenz 1217',
      length: 20,
      width: 7,
      height: 7.5,
      cost: 35000,
      icon: '🚛'
    },
    {
      name: 'Ashok Leyland Ecomet 1212',
      length: 20,
      width: 7,
      height: 7.5,
      cost: 34500,
      icon: '🚛'
    },
    {
      name: 'Tata LPT 1613',
      length: 22,
      width: 7.5,
      height: 8,
      cost: 38000,
      icon: '�'
    },
    {
      name: 'Eicher Pro 3015',
      length: 24,
      width: 7.5,
      height: 8,
      cost: 42000,
      icon: '🚛'
    },
    {
      name: 'Ashok Leyland 1616',
      length: 24,
      width: 7.5,
      height: 8,
      cost: 41500,
      icon: '🚛'
    },
    {
      name: 'BharatBenz 1617R',
      length: 24,
      width: 8,
      height: 8.5,
      cost: 45000,
      icon: '🚛'
    },
    {
      name: 'Tata LPT 2518',
      length: 28,
      width: 8,
      height: 8.5,
      cost: 52000,
      icon: '�'
    },
    {
      name: '32 ft Container Trailer',
      length: 32,
      width: 8,
      height: 8.5,
      cost: 65000,
      icon: '�'
    }
  ];

  // Truck form state
  const [truckForm, setTruckForm] = useState({
    name: '',
    length: '',
    width: '',
    height: '',
    cost: '',
    numberOfTrucks: '',
    isConstraint: false,
    constraintValue: ''
  });

  // Box form state
  const [boxForm, setBoxForm] = useState({
    name: '',
    length: '',
    width: '',
    height: '',
    quantity: ''
  });

  // Add predefined truck to form for editing (without cost)
  const addPredefinedTruck = (predefinedTruck) => {
    setTruckForm({
      name: predefinedTruck.name,
      length: predefinedTruck.length.toString(),
      width: predefinedTruck.width.toString(),
      height: predefinedTruck.height.toString(),
      cost: '', // Don't populate cost for predefined trucks
      numberOfTrucks: '',
      isConstraint: false,
      constraintValue: ''
    });
    
    // Scroll to form for better UX
    const formElement = document.querySelector('.truck-card .card-body');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Edit existing truck
  const editTruck = (truck) => {
    setTruckForm({
      name: truck.name,
      length: truck.length.toString(),
      width: truck.width.toString(),
      height: truck.height.toString(),
      cost: truck.cost.toString(),
      numberOfTrucks: truck.numberOfTrucks?.toString() || '',
      isConstraint: truck.isConstraint,
      constraintValue: truck.constraintValue?.toString() || ''
    });
    
    // Remove the truck from the list so it can be re-added with updates
    setTrucks(trucks.filter(t => t.id !== truck.id));
  };

  // Unit conversion helper
  const convertUnits = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    
    // Convert to base unit (inches)
    let valueInInches = value;
    if (fromUnit === 'feet') valueInInches = value * 12;
    if (fromUnit === 'meters') valueInInches = value * 39.3701;
    if (fromUnit === 'cm') valueInInches = value * 0.393701;
    
    // Convert from inches to target unit
    if (toUnit === 'feet') return valueInInches / 12;
    if (toUnit === 'meters') return valueInInches / 39.3701;
    if (toUnit === 'cm') return valueInInches / 0.393701;
    
    return valueInInches; // Default to inches
  };

  // Get unit options
  const getUnitOptions = () => [
    { value: 'inches', label: 'Inches' },
    { value: 'feet', label: 'Feet' },
    { value: 'meters', label: 'Meters' },
    { value: 'cm', label: 'Centimeters' }
  ];

  // Add truck with validation
  const addTruck = () => {
    // Check if all required fields except numberOfTrucks are filled
    const requiredFields = ['name', 'length', 'width', 'height', 'cost'];
    const emptyFields = requiredFields.filter(field => !truckForm[field]);
    
    if (emptyFields.length > 0) {
      alert(`Please fill in the following required fields: ${emptyFields.join(', ')}`);
      return;
    }

    // Check if numberOfTrucks is provided and valid
    if (truckForm.numberOfTrucks && parseInt(truckForm.numberOfTrucks) <= 0) {
      alert('Number of trucks must be greater than 0 if specified');
      return;
    }

    const newTruck = {
      id: Date.now(),
      ...truckForm,
      length: parseFloat(truckForm.length),
      width: parseFloat(truckForm.width),
      height: parseFloat(truckForm.height),
      cost: parseFloat(truckForm.cost),
      numberOfTrucks: truckForm.numberOfTrucks ? parseInt(truckForm.numberOfTrucks) : null,
      constraintValue: truckForm.constraintValue ? parseFloat(truckForm.constraintValue) : 0
    };
    setTrucks([...trucks, newTruck]);
    setTruckForm({ 
      name: '', 
      length: '', 
      width: '', 
      height: '', 
      cost: '', 
      numberOfTrucks: '',
      isConstraint: false, 
      constraintValue: '' 
    });
  };

  // Add box
  const addBox = () => {
    if (boxForm.name && boxForm.length && boxForm.width && boxForm.height && boxForm.quantity) {
      const newBox = {
        id: Date.now(),
        ...boxForm,
        length: parseFloat(boxForm.length),
        width: parseFloat(boxForm.width),
        height: parseFloat(boxForm.height),
        quantity: parseInt(boxForm.quantity)
      };
      setBoxes([...boxes, newBox]);
      setBoxForm({ name: '', length: '', width: '', height: '', quantity: '' });
    }
  };

  // Edit existing box
  const editBox = (box) => {
    setBoxForm({
      name: box.name,
      length: box.length.toString(),
      width: box.width.toString(),
      height: box.height.toString(),
      quantity: box.quantity.toString()
    });
    
    // Remove the box from the list so it can be re-added with updates
    setBoxes(boxes.filter(b => b.id !== box.id));
  };

  // Delete truck
  const deleteTruck = (id) => {
    setTrucks(trucks.filter(truck => truck.id !== id));
  };

  // Delete box
  const deleteBox = (id) => {
    setBoxes(boxes.filter(box => box.id !== id));
  };

  // Addon truck functions
  // Helper function to calculate boxes that can fit in a specific truck
  const calculateBoxesForTruck = (truck, quantity) => {
    if (!boxes || boxes.length === 0 || !results) return { boxesFitted: 0 };

    // Convert units to feet for consistent calculation
    const convertToFeet = (value, fromUnit) => {
      switch(fromUnit) {
        case 'inches': return value / 12;
        case 'meters': return value * 3.28084;
        case 'cm': return value / 30.48;
        case 'feet': 
        default: return value;
      }
    };

    const truckInFeet = {
      length: convertToFeet(truck.length, truckUnits),
      width: convertToFeet(truck.width, truckUnits),
      height: convertToFeet(truck.height, truckUnits)
    };

    const boxInFeet = {
      length: convertToFeet(boxes[0].length, boxUnits),
      width: convertToFeet(boxes[0].width, boxUnits),
      height: convertToFeet(boxes[0].height, boxUnits)
    };

    // Calculate how many boxes can fit in one truck (dimensional fitting)
    const boxesPerLength = Math.floor(truckInFeet.length / boxInFeet.length);
    const boxesPerWidth = Math.floor(truckInFeet.width / boxInFeet.width);
    const boxesPerHeight = Math.floor(truckInFeet.height / boxInFeet.height);
    
    const boxesPerTruck = boxesPerLength * boxesPerWidth * boxesPerHeight;
    const totalBoxesFitted = Math.min(boxesPerTruck * quantity, results.remainingBoxCount || 0);

    return { boxesFitted: totalBoxesFitted };
  };

  const addAddonTruck = () => {
    if (!addonForm.truckType || addonForm.quantity <= 0 || addonForm.cost <= 0) {
      alert('Please select a truck type, enter valid quantity and cost');
      return;
    }

    // Find the selected truck from either added trucks or predefined trucks
    let selectedTruck = trucks.find(truck => truck.name === addonForm.truckType);
    if (!selectedTruck) {
      selectedTruck = predefinedTrucks.find(truck => truck.name === addonForm.truckType);
    }

    if (!selectedTruck) {
      alert('Selected truck type not found');
      return;
    }

    // Calculate how many boxes this addon truck can fit
    const addonTruckResults = calculateBoxesForTruck(selectedTruck, addonForm.quantity);

    const newAddonTruck = {
      id: Date.now(),
      type: addonForm.truckType,
      quantity: addonForm.quantity,
      costPerTruck: addonForm.cost,
      totalCost: addonForm.cost * addonForm.quantity,
      boxesFitted: addonTruckResults.boxesFitted,
      dimensions: {
        length: selectedTruck.length,
        width: selectedTruck.width,
        height: selectedTruck.height
      }
    };
    
    setAddonTrucks([...addonTrucks, newAddonTruck]);
    setAddonForm({ 
      truckType: '', 
      quantity: 0, 
      cost: 0
    });
  };

  const selectRecommendedAddon = (recommendation) => {
    setAddonForm({
      name: recommendation.name,
      length: recommendation.length.toString(),
      width: recommendation.width.toString(),
      height: recommendation.height.toString(),
      cost: recommendation.cost.toString(),
      numberOfTrucks: recommendation.trucksNeeded.toString()
    });
  };

  const deleteAddonTruck = (id) => {
    setAddonTrucks(addonTrucks.filter(truck => truck.id !== id));
  };

  const calculateAddonResults = () => {
    if (addonTrucks.length === 0 || !results) return null;

    // Convert addon trucks to feet for calculation
    const convertToFeet = (value, fromUnit) => {
      switch(fromUnit) {
        case 'inches': return value / 12;
        case 'meters': return value * 3.28084;
        case 'cm': return value / 30.48;
        case 'feet': 
        default: return value;
      }
    };

    const addonTrucksInFeet = addonTrucks.map(truck => ({
      ...truck,
      length: convertToFeet(truck.length, truckUnits),
      width: convertToFeet(truck.width, truckUnits),
      height: convertToFeet(truck.height, truckUnits),
      volume: convertToFeet(truck.length, truckUnits) * convertToFeet(truck.width, truckUnits) * convertToFeet(truck.height, truckUnits)
    }));

    let totalAddonCost = 0;
    let totalAddonVolume = 0;
    let addonBoxesFitted = 0;

    addonTrucksInFeet.forEach(truck => {
      totalAddonCost += truck.cost * truck.numberOfTrucks;
      totalAddonVolume += truck.volume * truck.numberOfTrucks;
    });

    // Estimate how many boxes can be fitted (simplified calculation)
    const avgBoxVolume = results.totalBoxVolume / results.totalBoxes;
    addonBoxesFitted = Math.min(results.remainingBoxCount, Math.floor(totalAddonVolume / avgBoxVolume));

    return {
      totalCost: totalAddonCost,
      totalVolume: totalAddonVolume,
      boxesFitted: addonBoxesFitted,
      remainingAfterAddon: results.remainingBoxCount - addonBoxesFitted,
      trucks: addonTrucksInFeet
    };
  };

  // Enhanced optimization logic with mixed solution support
  const optimizeTrucks = () => {
    if (trucks.length === 0 || boxes.length === 0) {
      alert('Please add at least one truck and one box type');
      return;
    }

    // Helper function to convert units to feet for consistent calculation
    const convertToFeet = (value, fromUnit) => {
      switch(fromUnit) {
        case 'inches': return value / 12;
        case 'meters': return value * 3.28084;
        case 'cm': return value / 30.48;
        case 'feet': 
        default: return value;
      }
    };

    // Convert all boxes to feet for calculation
    const boxesInFeet = boxes.map(box => ({
      ...box,
      length: convertToFeet(box.length, boxUnits),
      width: convertToFeet(box.width, boxUnits),
      height: convertToFeet(box.height, boxUnits),
      volume: convertToFeet(box.length, boxUnits) * convertToFeet(box.width, boxUnits) * convertToFeet(box.height, boxUnits)
    }));

    // Convert all trucks to feet for calculation  
    const trucksInFeet = trucks.map(truck => ({
      ...truck,
      length: convertToFeet(truck.length, truckUnits),
      width: convertToFeet(truck.width, truckUnits), 
      height: convertToFeet(truck.height, truckUnits),
      volume: convertToFeet(truck.length, truckUnits) * convertToFeet(truck.width, truckUnits) * convertToFeet(truck.height, truckUnits)
    }));

    // Calculate total box requirements
    const totalBoxRequirements = boxesInFeet.reduce((total, box) => total + box.quantity, 0);
    const totalBoxVolume = boxesInFeet.reduce((total, box) => {
      return total + (box.volume * box.quantity);
    }, 0);

    // Separate trucks by number configuration
    const predefinedTrucks = trucksInFeet.filter(truck => truck.numberOfTrucks && truck.numberOfTrucks > 0);
    const autoCalculateTrucks = trucksInFeet.filter(truck => !truck.numberOfTrucks || truck.numberOfTrucks <= 0);

    let totalCost = 0;
    let usedVolume = 0;
    let distribution = [];
    let remainingBoxes = [...boxesInFeet.map(box => ({ ...box, remaining: box.quantity }))];
    let truckBreakdown = [];

    // Handle predefined truck quantities first
    predefinedTrucks.forEach(truck => {
      const truckVolume = truck.volume;
      const totalTruckVolume = truck.numberOfTrucks * truckVolume;
      const cost = truck.numberOfTrucks * truck.cost;
      
      // Calculate boxes that can fit in this truck type
      let boxesPerTruck = [];
      let totalBoxesFitted = 0;
      let volumeUsed = 0;

      // For each truck, calculate box distribution
      for (let truckIndex = 0; truckIndex < truck.numberOfTrucks; truckIndex++) {
        let currentTruckVolume = truckVolume;
        let currentTruckBoxes = [];
        
        // Try to fit boxes in current truck using bin packing approach
        for (let box of remainingBoxes) {
          if (box.remaining > 0) {
            // Check if box can physically fit in truck dimensions
            const canFitDimensions = (
              box.length <= truck.length && 
              box.width <= truck.width && 
              box.height <= truck.height
            );
            
            if (canFitDimensions) {
              const canFitByVolume = Math.min(box.remaining, Math.floor(currentTruckVolume / box.volume));
              
              if (canFitByVolume > 0) {
                currentTruckBoxes.push({
                  name: box.name,
                  quantity: canFitByVolume,
                  volume: canFitByVolume * box.volume
                });
                box.remaining -= canFitByVolume;
                currentTruckVolume -= canFitByVolume * box.volume;
                totalBoxesFitted += canFitByVolume;
                volumeUsed += canFitByVolume * box.volume;
              }
            }
          }
        }
        boxesPerTruck.push(currentTruckBoxes);
      }

      totalCost += cost;
      usedVolume += volumeUsed;

      const truckInfo = {
        truckType: truck.name,
        isPredefined: true,
        numberOfTrucks: truck.numberOfTrucks,
        cost: cost,
        totalBoxesFitted: totalBoxesFitted,
        boxesPerTruck: boxesPerTruck,
        volume: totalTruckVolume,
        volumeUsed: volumeUsed,
        remainingVolume: totalTruckVolume - volumeUsed,
        efficiency: totalTruckVolume > 0 ? ((volumeUsed / totalTruckVolume) * 100).toFixed(1) : '0.0'
      };
      
      distribution.push(truckInfo);
      truckBreakdown.push(truckInfo);
    });

    // Calculate remaining requirements
    const remainingBoxCount = remainingBoxes.reduce((sum, box) => sum + box.remaining, 0);
    const remainingBoxVolume = remainingBoxes.reduce((total, box) => {
      return total + (box.volume * box.remaining);
    }, 0);

    // Handle auto-calculate trucks for remaining boxes
    let autoCalculateResults = null;
    if (remainingBoxCount > 0 && autoCalculateTrucks.length > 0) {
      // Find most cost-effective truck for remaining volume
      const trucksWithEfficiency = autoCalculateTrucks.map(truck => {
        const costPerCubicFoot = truck.cost / truck.volume;
        return { ...truck, costPerCubicFoot };
      });

      trucksWithEfficiency.sort((a, b) => a.costPerCubicFoot - b.costPerCubicFoot);
      const bestTruck = trucksWithEfficiency[0];
      const trucksNeeded = Math.ceil(remainingBoxVolume / bestTruck.volume);
      const additionalCost = trucksNeeded * bestTruck.cost;
      
      totalCost += additionalCost;
      usedVolume += trucksNeeded * bestTruck.volume;

      autoCalculateResults = {
        truckType: bestTruck.name,
        isPredefined: false,
        trucksRequired: trucksNeeded,
        cost: additionalCost,
        volume: trucksNeeded * bestTruck.volume,
        boxesForRemaining: remainingBoxCount
      };

      distribution.push(autoCalculateResults);
    }

    // Calculate decision metrics
    const totalShippedBoxes = totalBoxRequirements - remainingBoxCount;
    const utilizationRate = usedVolume > 0 ? (totalBoxVolume / usedVolume) * 100 : 0;
    const costEfficiency = usedVolume > 0 ? totalCost / usedVolume : 0;
    const shippingCompleteness = totalBoxRequirements > 0 ? (totalShippedBoxes / totalBoxRequirements) * 100 : 0;

    // Generate addon truck recommendations for remaining boxes
    const addonRecommendations = [];
    if (remainingBoxCount > 0) {
      const availableAddonTrucks = [...predefinedTrucks, ...autoCalculateTrucks].map(truck => {
        const trucksNeeded = Math.ceil(remainingBoxVolume / truck.volume);
        return {
          ...truck,
          trucksNeeded: trucksNeeded,
          totalCost: trucksNeeded * truck.cost,
          costPerBox: (trucksNeeded * truck.cost) / remainingBoxCount
        };
      }).sort((a, b) => a.costPerBox - b.costPerBox);

      addonRecommendations.push(...availableAddonTrucks.slice(0, 5));
    }

    // Generate AI insights
    const insights = {};
    
    if (costEfficiency < 100) {
      insights.efficiency = `Excellent cost efficiency at ₹${costEfficiency.toFixed(2)}/ft³`;
    } else if (costEfficiency > 300) {
      insights.cost = `Consider larger trucks to reduce cost per ft³ (₹${costEfficiency.toFixed(2)})`;
    }

    if (utilizationRate > 80) {
      insights.utilization = `Excellent space utilization at ${utilizationRate.toFixed(1)}%`;
    } else if (utilizationRate < 50) {
      insights.utilization = `Low space utilization (${utilizationRate.toFixed(1)}%) - consider smaller trucks`;
    }

    if (shippingCompleteness === 100) {
      insights.shipping = 'All cargo can be shipped with this configuration';
    } else {
      insights.shipping = `${(100 - shippingCompleteness).toFixed(1)}% of cargo cannot be shipped - consider additional trucks`;
    }

    setResults({
      distribution: distribution,
      truckBreakdown: truckBreakdown,
      autoCalculateResults: autoCalculateResults,
      totalCost: totalCost,
      totalBoxVolume: totalBoxVolume,
      usedVolume: usedVolume,
      remainingBoxes: remainingBoxes,
      remainingBoxCount: remainingBoxCount,
      remainingBoxVolume: remainingBoxVolume,
      addonRecommendations: addonRecommendations,
      costEfficiency: costEfficiency,
      decisionMetrics: {
        costEfficiency: costEfficiency,
        utilizationRate: utilizationRate / 100,
        shippingCompleteness: shippingCompleteness / 100
      },
      insights: insights,
      totalShipped: totalShippedBoxes,
      totalBoxes: totalBoxRequirements
    });
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;

  return (
    <div className="truck-optimizer">
      <Container fluid>
        {/* Header */}
        <Row className="justify-content-center">
          <Col xs={12}>
            <div className="optimizer-header">
              <div className="section-icon">
                <div className="icon-cube revolving-gear">⚙️</div>
              </div>
              <h2 className="section-title">Smart Truck System</h2>
              <p className="section-subtitle">Configure your fleet and cargo specifications</p>
            </div>
          </Col>
        </Row>

        <Row className="g-4">
          {/* Truck Management */}
          <Col lg={6} md={12}>
            <Card className="glass-card truck-card">
              <Card.Header className="card-header-custom">
                <div className="header-icon">🚛</div>
                <h3>Fleet Management</h3>
                <p>Define your truck categories</p>
              </Card.Header>
              <Card.Body>
                <Form>
                  {/* Unit Selection and Predefined Truck Selection */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="form-label-with-unit">
                          Dimension Unit
                          <span className="unit-display">{truckUnits}</span>
                        </Form.Label>
                        <Form.Select
                          value={truckUnits}
                          onChange={(e) => setTruckUnits(e.target.value)}
                        >
                          {getUnitOptions().map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="form-label-with-unit">
                          Quick Select Truck
                          <span className="unit-display">Predefined</span>
                        </Form.Label>
                        <Form.Select
                          onChange={(e) => {
                            if (e.target.value) {
                              const selectedTruck = predefinedTrucks[parseInt(e.target.value)];
                              addPredefinedTruck(selectedTruck);
                              e.target.value = ''; // Reset dropdown
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="">Select a predefined truck...</option>
                          {predefinedTrucks.map((truck, index) => (
                            <option key={index} value={index}>
                              {truck.name} ({truck.length}×{truck.width}×{truck.height} ft)
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Manual Truck Input */}
                  <h6 className="form-section-title">Custom Truck Details</h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="form-group-enhanced">
                        <Form.Label>Truck Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={truckForm.name}
                          onChange={(e) => setTruckForm({...truckForm, name: e.target.value})}
                          placeholder="e.g., Large Truck"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="form-group-enhanced">
                        <Form.Label className="form-label-with-unit">
                          Price
                          <span className="unit-display">₹</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={truckForm.cost}
                          onChange={(e) => setTruckForm({...truckForm, cost: e.target.value})}
                          placeholder="25000"
                        />
                        <div className="unit-overlay">₹</div>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="form-group-enhanced">
                        <Form.Label className="form-label-with-unit">
                          Length
                          <span className="unit-display">{truckUnits}</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={truckForm.length}
                          onChange={(e) => setTruckForm({...truckForm, length: e.target.value})}
                          placeholder="20"
                        />
                        <div className="unit-overlay">{truckUnits}</div>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="form-group-enhanced">
                        <Form.Label className="form-label-with-unit">
                          Width
                          <span className="unit-display">{truckUnits}</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={truckForm.width}
                          onChange={(e) => setTruckForm({...truckForm, width: e.target.value})}
                          placeholder="8"
                        />
                        <div className="unit-overlay">{truckUnits}</div>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="form-group-enhanced">
                        <Form.Label className="form-label-with-unit">
                          Height
                          <span className="unit-display">{truckUnits}</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={truckForm.height}
                          onChange={(e) => setTruckForm({...truckForm, height: e.target.value})}
                          placeholder="8"
                        />
                        <div className="unit-overlay">{truckUnits}</div>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Number of Trucks Section */}
                  <Row>
                    <Col md={12}>
                      <Form.Group className="form-group-enhanced">
                        <Form.Label className="form-label-with-unit">
                          Number of Trucks Available
                          <span className="unit-display">Optional</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={truckForm.numberOfTrucks}
                          onChange={(e) => setTruckForm({...truckForm, numberOfTrucks: e.target.value})}
                          placeholder="Leave empty for automatic calculation"
                        />
                        <div className="help-text">
                          Specify if you have a fixed number of this truck type available. Leave empty to let the system calculate the optimal quantity.
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Constraint Section */}
                  <div className="constraint-section">
                    <div className="constraint-section-header">
                      <div className="constraint-icon">🔒</div>
                      <h6 className="constraint-title">Mixed Solution Constraint</h6>
                    </div>
                    <div className="constraint-checkbox">
                      <Form.Check
                        type="checkbox"
                        id="truck-constraint"
                        checked={truckForm.isConstraint}
                        onChange={(e) => setTruckForm({...truckForm, isConstraint: e.target.checked})}
                      />
                      <Form.Label htmlFor="truck-constraint">
                        Use this truck type as a constraint for mixed solutions
                      </Form.Label>
                    </div>
                    {truckForm.isConstraint && (
                      <div className="constraint-input">
                        <Form.Group>
                          <Form.Label>Fixed Quantity</Form.Label>
                          <Form.Control
                            type="number"
                            value={truckForm.constraintValue}
                            onChange={(e) => setTruckForm({...truckForm, constraintValue: e.target.value})}
                            placeholder="2"
                          />
                        </Form.Group>
                      </div>
                    )}
                    <div className="constraint-description">
                      When enabled, specify exactly how many of this truck type to use, and the system will optimize other truck types around this constraint.
                    </div>
                  </div>

                  <Button variant="success" onClick={addTruck} className="add-truck-btn">
                    Add Truck
                  </Button>
                </Form>

                {trucks.length > 0 && (
                  <div className="mt-4">
                    <h6>Fleet Categories <span className="section-counter">({trucks.length})</span></h6>
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Dimensions</th>
                          <th>Cost (₹)</th>
                          <th>Available</th>
                          <th>Type</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trucks.map(truck => (
                          <tr key={truck.id}>
                            <td>{truck.name}</td>
                            <td>{truck.length}×{truck.width}×{truck.height} ft</td>
                            <td>₹{truck.cost.toLocaleString('en-IN')}</td>
                            <td>
                              {truck.numberOfTrucks ? 
                                <span className="badge bg-info">{truck.numberOfTrucks} units</span> : 
                                <span className="badge bg-secondary">Auto-calc</span>
                              }
                            </td>
                            <td>
                              {truck.isConstraint ? 
                                <span className="badge bg-warning">Fixed ({truck.constraintValue})</span> : 
                                <span className="badge bg-success">Flexible</span>
                              }
                            </td>
                            <td>
                              <div className="truck-actions">
                                <Button 
                                  variant="info" 
                                  size="sm" 
                                  onClick={() => editTruck(truck)}
                                  className="edit-btn me-2"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="danger" 
                                  size="sm" 
                                  onClick={() => deleteTruck(truck.id)}
                                  className="delete-btn"
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Box Management */}
          <Col lg={6} md={12}>
            <Card className="glass-card box-card">
              <Card.Header className="card-header-custom">
                <div className="header-icon">📦</div>
                <h3>Cargo Management</h3>
                <p>Define your box categories</p>
              </Card.Header>
              <Card.Body>
                <Form>
                  {/* Unit Selection Row */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="form-label-with-unit">
                          Dimension Unit
                          <span className="unit-display">{boxUnits}</span>
                        </Form.Label>
                        <Form.Select
                          value={boxUnits}
                          onChange={(e) => setBoxUnits(e.target.value)}
                        >
                          {getUnitOptions().map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Box Details */}
                  <h6 className="form-section-title">Box Specifications</h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="form-group-enhanced">
                        <Form.Label>Box Type Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={boxForm.name}
                          onChange={(e) => setBoxForm({...boxForm, name: e.target.value})}
                          placeholder="e.g., Standard Box"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="form-group-enhanced">
                        <Form.Label className="form-label-with-unit">
                          Quantity
                          <span className="unit-display">Units</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={boxForm.quantity}
                          onChange={(e) => setBoxForm({...boxForm, quantity: e.target.value})}
                          placeholder="100"
                        />
                        <div className="unit-overlay">Units</div>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="form-group-enhanced">
                        <Form.Label className="form-label-with-unit">
                          Length
                          <span className="unit-display">{boxUnits}</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={boxForm.length}
                          onChange={(e) => setBoxForm({...boxForm, length: e.target.value})}
                          placeholder="24"
                        />
                        <div className="unit-overlay">{boxUnits}</div>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="form-group-enhanced">
                        <Form.Label className="form-label-with-unit">
                          Width
                          <span className="unit-display">{boxUnits}</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={boxForm.width}
                          onChange={(e) => setBoxForm({...boxForm, width: e.target.value})}
                          placeholder="16"
                        />
                        <div className="unit-overlay">{boxUnits}</div>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="form-group-enhanced">
                        <Form.Label className="form-label-with-unit">
                          Height
                          <span className="unit-display">{boxUnits}</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={boxForm.height}
                          onChange={(e) => setBoxForm({...boxForm, height: e.target.value})}
                          placeholder="12"
                        />
                        <div className="unit-overlay">{boxUnits}</div>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button variant="success" onClick={addBox} className="add-box-btn">
                    Add Box Type
                  </Button>
                </Form>

                {boxes.length > 0 && (
                  <div className="mt-4">
                    <h6>Cargo Categories <span className="section-counter">({boxes.length})</span></h6>
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Dimensions</th>
                          <th>Quantity</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {boxes.map(box => (
                          <tr key={box.id}>
                            <td>{box.name}</td>
                                                        <td>{box.length} x {box.width} x {box.height} {boxUnits}</td>
                            <td>{box.quantity}</td>
                            <td>
                              <div className="box-actions">
                                <Button 
                                  variant="info" 
                                  size="sm" 
                                  onClick={() => editBox(box)}
                                  className="edit-btn me-2"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="danger" 
                                  size="sm" 
                                  onClick={() => deleteBox(box.id)}
                                  className="delete-btn"
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Optimization Section */}
        <Row className="justify-content-center mt-5">
          <Col xs={12} className="text-center">
            {trucks.length === 0 || boxes.length === 0 ? (
              <Card className="glass-card getting-started-card">
                <Card.Body>
                  <div className="getting-started">
                    <div className="ai-assistant-icon">🤖</div>
                    <h3>AI Assistant Ready</h3>
                    <div className="instructions">
                      {trucks.length === 0 && (
                        <div className="instruction-item">
                          <span className="step-number">1</span>
                          <div className="step-content">
                            <strong>Add Fleet Categories</strong>
                            <p>Define truck dimensions, pricing, and constraints</p>
                          </div>
                        </div>
                      )}
                      {boxes.length === 0 && (
                        <div className="instruction-item">
                          <span className="step-number">2</span>
                          <div className="step-content">
                            <strong>Add Cargo Categories</strong>
                            <p>Specify box dimensions and quantities</p>
                          </div>
                        </div>
                      )}
                      <div className="instruction-item">
                        <span className="step-number">3</span>
                        <div className="step-content">
                          <strong>AI Optimization</strong>
                          <p>Get intelligent recommendations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <div className="calculate-section">
                <button 
                  className="calculate-btn"
                  onClick={optimizeTrucks}
                >
                  <span className="btn-icon">🚀</span>
                  <span className="btn-text">Launch AI Optimization</span>
                  <div className="btn-glow"></div>
                </button>
              </div>
            )}
          </Col>
        </Row>

        {/* Results Section */}
        {results && (
          <Row className="mt-5">
            <Col xs={12}>
              <div className="optimization-results">
                <h2>🚛 Mixed Solution Optimization Results</h2>
                
                {/* Summary Section */}
                <div className="results-summary">
                  <div className="cost-summary">
                    <h3>📊 Cost Summary</h3>
                    <p><strong>Total Cost:</strong> {formatCurrency(results.totalCost)}</p>
                    <p><strong>Boxes Shipped:</strong> {results.totalShipped} of {results.totalBoxes} ({((results.totalShipped/results.totalBoxes)*100).toFixed(1)}%)</p>
                    {results.remainingBoxCount > 0 && (
                      <p className="remaining-alert"><strong>⚠️ Remaining Boxes:</strong> {results.remainingBoxCount} boxes cannot be shipped</p>
                    )}
                  </div>
                </div>

                {/* Detailed Truck Breakdown */}
                {results.truckBreakdown && results.truckBreakdown.length > 0 && (
                  <div className="detailed-breakdown-section">
                    <h3>� Detailed Truck Analysis</h3>
                    
                    {results.truckBreakdown.map((truck, index) => (
                      <div key={index} className="truck-detailed-breakdown">
                        <div className="truck-header">
                          <h4>{truck.truckType}</h4>
                          <div className="truck-status">
                            {truck.isPredefined ? (
                              <span className="badge bg-info">📋 Predefined ({truck.numberOfTrucks} trucks)</span>
                            ) : (
                              <span className="badge bg-success">🔄 Auto-calculated</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="truck-metrics">
                          <div className="metric-row">
                            <span><strong>Total Cost:</strong> {formatCurrency(truck.cost)}</span>
                            <span><strong>Space Efficiency:</strong> {truck.efficiency}%</span>
                          </div>
                          <div className="metric-row">
                            <span><strong>Total Boxes Fitted:</strong> {truck.totalBoxesFitted}</span>
                            <span><strong>Remaining Volume:</strong> {truck.remainingVolume?.toFixed(1)} ft³</span>
                          </div>
                        </div>

                        {/* Boxes per truck breakdown */}
                        <div className="boxes-per-truck">
                          <h5>📦 Boxes per Truck</h5>
                          {truck.boxesPerTruck.map((truckBoxes, truckIndex) => (
                            <div key={truckIndex} className="single-truck-breakdown">
                              <h6>Truck #{truckIndex + 1}</h6>
                              {truckBoxes.length > 0 ? (
                                <div className="box-distribution">
                                  {truckBoxes.map((box, boxIndex) => (
                                    <span key={boxIndex} className="box-item">
                                      {box.name}: {box.quantity} units ({box.volume.toFixed(1)} ft³)
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="empty-truck">No boxes assigned</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Recommendations for remaining volume */}
                        {truck.remainingVolume > 10 && (
                          <div className="volume-recommendation">
                            <p className="recommendation-note">
                              💡 {truck.remainingVolume.toFixed(1)} ft³ unused space available in this truck type
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Auto-calculated trucks for remaining boxes */}
                {results.autoCalculateResults && (
                  <div className="auto-calculate-section">
                    <h3>🎯 Auto-calculated Solution</h3>
                    <div className="auto-result-card">
                      <h4>{results.autoCalculateResults.truckType}</h4>
                      <div className="auto-metrics">
                        <p><strong>Trucks Required:</strong> {results.autoCalculateResults.trucksRequired}</p>
                        <p><strong>Cost:</strong> {formatCurrency(results.autoCalculateResults.cost)}</p>
                        <p><strong>For Remaining Boxes:</strong> {results.autoCalculateResults.boxesForRemaining}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Addon Truck Management */}
                {results.remainingBoxCount > 0 && results.addonRecommendations && results.addonRecommendations.length > 0 && (
                  <div className="addon-recommendations">
                    <h3>� Addon Truck Recommendations</h3>
                    <p className="addon-intro">Select additional trucks to handle the remaining {results.remainingBoxCount} boxes:</p>
                    
                    <div className="recommendation-grid">
                      {results.addonRecommendations.slice(0, 3).map((recommendation, index) => (
                        <div key={index} className="recommendation-card">
                          <h5>{recommendation.name}</h5>
                          <div className="recommendation-details">
                            <p><strong>Trucks Needed:</strong> {recommendation.trucksNeeded}</p>
                            <p><strong>Total Cost:</strong> {formatCurrency(recommendation.totalCost)}</p>
                            <p><strong>Cost per Box:</strong> ₹{recommendation.costPerBox.toFixed(0)}</p>
                          </div>
                          <button 
                            className="btn btn-outline-success btn-sm recommendation-btn"
                            onClick={() => selectRecommendedAddon(recommendation)}
                          >
                            Select This Option
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Addon Truck Input */}
                {results.remainingBoxCount > 0 && (
                  <div className="custom-addon-section">
                    <h4>⚙️ Custom Addon Truck Selection</h4>
                    <div className="addon-form-section">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label htmlFor="addonTruckType" className="form-label">Truck Type</label>
                          <select 
                            id="addonTruckType"
                            className="form-select" 
                            value={addonForm.truckType}
                            onChange={(e) => setAddonForm({...addonForm, truckType: e.target.value})}
                          >
                            <option value="">Select truck type...</option>
                            {trucks.map(truck => (
                              <option key={truck.id} value={truck.name}>{truck.name}</option>
                            ))}
                            {predefinedTrucks.map(truck => (
                              <option key={truck.name} value={truck.name}>{truck.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label htmlFor="addonQuantity" className="form-label">Number of Trucks</label>
                          <input 
                            type="number" 
                            id="addonQuantity"
                            className="form-control" 
                            min="1" 
                            max="50"
                            value={addonForm.quantity}
                            onChange={(e) => setAddonForm({...addonForm, quantity: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="col-md-4">
                          <label htmlFor="addonCost" className="form-label">Cost per Truck ($)</label>
                          <input 
                            type="number" 
                            id="addonCost"
                            className="form-control" 
                            step="0.01" 
                            min="0"
                            value={addonForm.cost}
                            onChange={(e) => setAddonForm({...addonForm, cost: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      <div className="addon-form-actions">
                        <button 
                          className="btn add-addon-btn"
                          onClick={addAddonTruck}
                          disabled={!addonForm.truckType || addonForm.quantity <= 0}
                        >
                          Add Addon Trucks
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Added Addon Trucks Display */}
                {addonTrucks.length > 0 && (
                  <div className="added-addon-trucks">
                    <h4>🚛 Added Addon Trucks</h4>
                    <div className="table-responsive">
                      <table className="table addon-trucks-table">
                        <thead>
                          <tr>
                            <th>Truck Type</th>
                            <th>Quantity</th>
                            <th>Boxes Fitted</th>
                            <th>Cost per Truck</th>
                            <th>Total Cost</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {addonTrucks.map((truck, index) => (
                            <tr key={index}>
                              <td>{truck.type}</td>
                              <td>{truck.quantity}</td>
                              <td>{truck.boxesFitted}</td>
                              <td>{formatCurrency(truck.costPerTruck)}</td>
                              <td>{formatCurrency(truck.totalCost)}</td>
                              <td>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => {
                                    const newAddonTrucks = addonTrucks.filter((_, i) => i !== index);
                                    setAddonTrucks(newAddonTrucks);
                                  }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Addon Results Summary */}
                    <div className="addon-results-summary">
                      <h5>📊 Addon Trucks Summary</h5>
                      <div className="addon-summary-metrics">
                        <div className="metric-item">
                          <span className="metric-label">Total Addon Trucks:</span>
                          <span className="metric-value">{addonTrucks.reduce((sum, truck) => sum + truck.quantity, 0)}</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Additional Boxes Fitted:</span>
                          <span className="metric-value">{addonTrucks.reduce((sum, truck) => sum + truck.boxesFitted, 0)}</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Additional Cost:</span>
                          <span className="metric-value">{formatCurrency(addonTrucks.reduce((sum, truck) => sum + truck.totalCost, 0))}</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Remaining Boxes:</span>
                          <span className="metric-value">
                            {Math.max(0, results.remainingBoxCount - addonTrucks.reduce((sum, truck) => sum + truck.boxesFitted, 0))}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status Messages */}
                      {addonTrucks.reduce((sum, truck) => sum + truck.boxesFitted, 0) >= results.remainingBoxCount ? (
                        <div className="success-message">
                          ✅ All remaining boxes can be accommodated with the selected addon trucks!
                        </div>
                      ) : (
                        <div className="warning-message">
                          ⚠️ {results.remainingBoxCount - addonTrucks.reduce((sum, truck) => sum + truck.boxesFitted, 0)} boxes still need accommodation. Consider adding more trucks.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Decision Metrics */}
                {results.decisionMetrics && (
                  <div className="decision-metrics">
                    <h3>📈 Decision Metrics</h3>
                    <p><strong>Cost Efficiency:</strong> {formatCurrency(results.decisionMetrics.costEfficiency)}/ft³</p>
                    <p><strong>Utilization Rate:</strong> {(results.decisionMetrics.utilizationRate * 100).toFixed(1)}%</p>
                    <p><strong>Shipping Completeness:</strong> {(results.decisionMetrics.shippingCompleteness * 100).toFixed(1)}%</p>
                  </div>
                )}

                {/* AI Insights */}
                {results.insights && Object.keys(results.insights).length > 0 && (
                  <div className="ai-insights">
                    <h3>🤖 AI Insights & Recommendations</h3>
                    {results.insights.efficiency && (
                      <div className="insight-item">
                        <h4>Efficiency Analysis</h4>
                        <p>{results.insights.efficiency}</p>
                      </div>
                    )}
                    {results.insights.cost && (
                      <div className="insight-item">
                        <h4>Cost Optimization</h4>
                        <p>{results.insights.cost}</p>
                      </div>
                    )}
                    {results.insights.shipping && (
                      <div className="insight-item">
                        <h4>Shipping Strategy</h4>
                        <p>{results.insights.shipping}</p>
                      </div>
                    )}
                    {results.insights.recommendation && (
                      <div className="insight-item">
                        <h4>Strategic Recommendation</h4>
                        <p>{results.insights.recommendation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        )}
      </Container>

      {/* Support Footer */}
      <Container className="mt-5">
        <Row>
          <Col>
            <div className="support-footer">
              <div className="support-content">
                <div className="support-icon">
                  <div className="icon-cube">📞</div>
                </div>
                <div className="support-info">
                  <h5>Need Support?</h5>
                  <p className="support-name">Contact: <strong>Jeet Shorey</strong></p>
                  <p className="support-email">
                    Email: <a href="mailto:shoreyjeet@gmail.com" className="email-link">shoreyjeet@gmail.com</a>
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TruckOptimizer;
