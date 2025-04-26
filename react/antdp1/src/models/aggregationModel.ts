import { useState } from 'react';

export default function aggregationModel() {
  const [aggregation, setAggregation] = useState({});
  const [oriAggregation, setOriAggregation] = useState({});
  const [generateSummary,setGenerateSummary] = useState(false);


  const [aggregations, setAggregations] = useState({});
  const [oriAggregations, setOriAggregations] = useState({});


  return { aggregation,oriAggregation,setOriAggregation,setAggregation,generateSummary,
    setGenerateSummary,aggregations, setAggregations,oriAggregations, setOriAggregations };
}
