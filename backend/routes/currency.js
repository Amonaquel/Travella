router.post('/convert-currency', async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;
    console.log('Currency conversion request:', { amount, fromCurrency, toCurrency });

    // Ensure amount is a number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Prompt for exchange rate
    const prompt = `What is the current exchange rate from ${fromCurrency} to ${toCurrency}? Return only the numeric value.`;
    console.log('Sending prompt to Cohere:', prompt);

    const response = await co.generate({
      prompt: prompt,
      max_tokens: 50,
      temperature: 0.1,
      k: 0,
      p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop_sequences: [],
      return_likelihoods: 'NONE'
    });

    console.log('Raw Cohere response:', response.generations[0].text);

    // Extract the exchange rate from the response
    const exchangeRateText = response.generations[0].text.trim();
    const exchangeRate = parseFloat(exchangeRateText);

    if (isNaN(exchangeRate)) {
      console.error('Invalid exchange rate received:', exchangeRateText);
      return res.status(500).json({ error: 'Invalid exchange rate received from AI' });
    }

    console.log('Parsed exchange rate:', exchangeRate);

    // Calculate the converted amount
    const convertedAmount = numericAmount * exchangeRate;
    console.log('Converted amount:', convertedAmount);

    res.json({ convertedAmount });
  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
}); 