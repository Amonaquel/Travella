const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/ask', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: "mistral",
      prompt: prompt,
      stream: false
    });

    res.json({ reply: response.data.response });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Ollama error");
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});