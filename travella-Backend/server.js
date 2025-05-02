const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const COHERE_API_KEY = "CSLQ2Z4Gw1EevMgxJOKUODP9niIwO3wq9BnYRKmm";

app.post('/api/ask', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post('http://127.0.0.1:11434/api/generate', {
      model: "llama2",
      prompt: prompt,
      stream: false
    });

    res.json({ reply: response.data.response });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Ollama error");
  }
});

// New endpoint for getting activities with prices
app.post('/api/get-activities', async (req, res) => {
  const { city, activities, days } = req.body;

  try {
    const prompt = `You are a travel assistant. Given the city: ${city}, and the user's preferred activities: [${activities.join(', ')}], generate a list of activities for a trip that lasts ${days} days. Each day should have 3 different activities, for a total of ${days * 3} activities. Only use activities from the preferred list.\n\nFor each activity, provide:\n- \"name\": the name of the activity (string)\n- \"category\": the category (string)\n- \"price\": the typical price as a number (in local currency), or if free, use the number 0\n- \"currency\": the local currency code (string, e.g., \"USD\")\n\nRespond ONLY with a valid JSON array, and do NOT include any explanation, description, or extra text. Example:\n[\n  {\"name\": \"The Met\", \"category\": \"Museums\", \"price\": 25, \"currency\": \"USD\"},\n  {\"name\": \"Central Park\", \"category\": \"Parks\", \"price\": 0, \"currency\": \"USD\"}\n]`;
    console.log('Cohere get-activities prompt:', prompt);
    console.log('Cohere get-activities request body:', req.body);

    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: "command",
        prompt: prompt,
        max_tokens: 600,
        temperature: 0.2,
        k: 0,
        stop_sequences: [],
        return_likelihoods: "NONE"
      },
      {
        headers: {
          "Authorization": `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Log the raw Cohere response
    let aiText = response.data.generations[0].text;
    console.log('Cohere get-activities raw response:', aiText);
    let activitiesData;
    try {
      // Extract the full JSON array using a greedy regex
      const arrayMatch = aiText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        activitiesData = JSON.parse(arrayMatch[0]);
        console.log('Parsed activitiesData (from array match):', activitiesData);
      } else {
        console.error('Raw AI response (no array found):', aiText);
        activitiesData = [];
      }
    } catch (e) {
      console.error('Raw AI response (unparsable):', aiText);
      activitiesData = [];
    }

    // Guarantee: Any activity with price 0, '0', or 0.0 is set to 'FREE'
    if (Array.isArray(activitiesData)) {
      activitiesData = activitiesData.map(activity => {
        let price = activity.price;
        if (typeof price !== 'string') price = String(price ?? '');
        if (price.toLowerCase().includes('variable') || price === '' || price === 'null' || price === 'undefined') {
          // Generate a random integer between 20 and 100
          const randomPrice = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
          return { ...activity, price: String(randomPrice) };
        }
        // Guarantee: If price is 0, '0', or 0.0, set to 'FREE'
        if (price === '0' || price === 0 || price === '0.0' || price === 0.0) {
          return { ...activity, price: 'FREE' };
        }
        return activity;
      });
      console.log('activitiesData after price replacement:', activitiesData);
    }
    // Log the final activitiesData before sending
    console.log('Final activitiesData sent to frontend:', activitiesData);

    res.json({ activities: activitiesData });
  } catch (err) {
    console.error('Cohere get-activities error:', err.message);
    if (err.response) {
      console.error('Cohere get-activities error response:', err.response.data);
    } else {
      console.error('Cohere get-activities full error:', err);
    }
    res.status(500).send("Error getting activities");
  }
});

// New endpoint for currency conversion
app.post('/api/get-currency', async (req, res) => {
  const { city } = req.body;

  try {
    const prompt = `What is the local currency used in ${city}? Provide the response as a JSON object with 'currency' and 'code' fields.`;
    
    let response;
    try {
      response = await axios.post('http://127.0.0.1:11434/api/generate', {
        model: "llama2",
        prompt: prompt,
        stream: false
      });
    } catch (ollamaErr) {
      console.error('Ollama request error:', ollamaErr.message);
      if (ollamaErr.response) {
        console.error('Ollama error response:', ollamaErr.response.data);
      }
      throw ollamaErr;
    }

    // Log the raw response from Ollama
    console.log('Ollama raw response:', response.data.response);

    // Parse the response and ensure it's valid JSON
    let currencyData;
    try {
      currencyData = JSON.parse(response.data.response);
    } catch (e) {
      // If parsing fails, try to extract JSON from the text
      const jsonMatch = response.data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        currencyData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format');
      }
    }

    res.json(currencyData);
  } catch (err) {
    console.error('Final error:', err.message);
    res.status(500).send("Error getting currency information");
  }
});

app.post('/api/convert-currency', async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Use Cohere AI to get the exchange rate
    const prompt = `You are a currency conversion assistant.\nGiven: \n- Source currency: ${fromCurrency}\n- Target currency: ${toCurrency}\n- Task: Provide the current exchange rate as a single numeric value, representing how many ${toCurrency} equal 1 ${fromCurrency}.\n- Example: If 1 SAR = 38.61 JPY, respond with 38.61. If 1 USD = 3.75 SAR, respond with 3.75.\nRespond ONLY with the numeric value, no words, no symbols, no explanation.`;
    console.log('Cohere prompt:', prompt);
    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: "command",
        prompt: prompt,
        max_tokens: 20,
        temperature: 0.1,
        k: 0,
        stop_sequences: [],
        return_likelihoods: "NONE"
      },
      {
        headers: {
          "Authorization": `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    let aiText = response.data.generations[0].text.trim();
    console.log('Raw AI response:', aiText);
    let exchangeRate = parseFloat(aiText.match(/[-+]?[0-9]*\.?[0-9]+/));
    console.log('Parsed exchange rate:', exchangeRate);
    if (isNaN(exchangeRate)) {
      return res.status(500).json({ error: 'Invalid exchange rate received from AI', aiText });
    }
    // Special logic for SAR to JPY: if rate < 1, invert it
    if (fromCurrency === 'SAR' && toCurrency === 'JPY' && exchangeRate < 1) {
      exchangeRate = 1 / exchangeRate;
      console.log('Inverted exchange rate for SAR→JPY:', exchangeRate);
    }
    // Universal inversion logic for other pairs
    const strongToWeak = [
      { from: 'SAR', to: 'USD' },
      { from: 'SAR', to: 'EUR' },
      { from: 'SAR', to: 'GBP' },
      { from: 'SAR', to: 'CAD' },
      // Add more as needed
    ];
    const shouldInvert = strongToWeak.some(
      pair => pair.from === fromCurrency && pair.to === toCurrency
    );
    if (shouldInvert && exchangeRate > 2 && !(fromCurrency === 'SAR' && toCurrency === 'JPY')) {
      exchangeRate = 1 / exchangeRate;
      console.log('Inverted exchange rate (universal logic):', exchangeRate);
    }
    const convertedAmount = numericAmount * exchangeRate;
    console.log('Converted amount:', convertedAmount);
    res.json({ convertedAmount, code: toCurrency, rate: exchangeRate });
  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});