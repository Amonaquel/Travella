const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/travella', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Schedule Schema
const scheduleSchema = new mongoose.Schema({
  userId: String,
  city: String,
  startDate: Date,
  endDate: Date,
  budgetAmount: Number,
  selectedActivities: [String],
  tripDays: Number,
  localCurrency: {
    currency: String,
    code: String
  },
  convertedBudget: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

const COHERE_API_KEY = "SOp5BfiBVRwTeMbn0fQHqCdOmkHzkQPh0nUKwKh2";

app.post('/api/ask', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post('https://api.cohere.ai/v1/generate', {
      model: "command",
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.7,
      k: 0,
      stop_sequences: [],
      return_likelihoods: "NONE"
    }, {
      headers: {
        "Authorization": `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    res.json({ reply: response.data.generations[0].text });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Cohere API error");
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
    
    const response = await axios.post('https://api.cohere.ai/v1/generate', {
      model: "command",
      prompt: prompt,
      max_tokens: 100,
      temperature: 0.2,
      k: 0,
      stop_sequences: [],
      return_likelihoods: "NONE"
    }, {
      headers: {
        "Authorization": `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    // Log the raw response from Cohere
    console.log('Cohere raw response:', response.data.generations[0].text);

    // Parse the response and ensure it's valid JSON
    let currencyData;
    try {
      currencyData = JSON.parse(response.data.generations[0].text);
    } catch (e) {
      // If parsing fails, try to extract JSON from the text
      const jsonMatch = response.data.generations[0].text.match(/\{[\s\S]*\}/);
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

    const apiKey = 'bd6d834aa92a6e955697e763';
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`;
    const response = await axios.get(url);

    // Check for API error in the response
    if (response.data.result !== 'success') {
      return res.status(500).json({ error: response.data['error-type'] || 'Failed to fetch exchange rate' });
    }

    const rate = response.data.conversion_rate;
    if (!rate) {
      return res.status(500).json({ error: 'Failed to fetch exchange rate' });
    }

    const convertedAmount = numericAmount * rate;
    res.json({
      convertedAmount: convertedAmount.toFixed(2),
      code: toCurrency,
      rate: rate.toFixed(4)
    });
  } catch (error) {
    console.error('Currency conversion error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
});

// GET endpoint for currency conversion (for testing)
app.get('/api/convert-currency', async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.query;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const apiKey = 'bd6d834aa92a6e955697e763';
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`;
    const response = await axios.get(url);

    const rate = response.data.conversion_rate;
    if (!rate) {
      return res.status(500).json({ error: 'Failed to fetch exchange rate' });
    }

    const convertedAmount = numericAmount * rate;
    res.json({
      convertedAmount: convertedAmount.toFixed(2),
      code: toCurrency,
      rate: rate.toFixed(4)
    });
  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
});

// Save user schedule
app.post('/api/schedules', async (req, res) => {
  try {
    const scheduleData = {
      ...req.body,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate)
    };
    
    const schedule = new Schedule(scheduleData);
    await schedule.save();
    
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({ error: 'Failed to save schedule' });
  }
});

// Get user schedules
app.get('/api/schedules/:userId', async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.params.userId })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Delete user schedule
app.delete('/api/schedules/:scheduleId', async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.scheduleId);
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});